/**
 * hero3d.js
 * Self-contained Three.js hero module for the Hot Meal Bar 3D dumpling showcase.
 *
 * Features:
 *  - GLB model loaded via GLTFLoader
 *  - Auto-centered via Box3
 *  - Studio 3-point lighting + environment ambient
 *  - Contact shadow plane
 *  - Soft floating idle animation (sine wave)
 *  - Mouse hover: X ±8°, Y ±12° smooth lerp (NO continuous spin)
 *  - GSAP ScrollTrigger: upward drift + subtle rotation on scroll
 *  - Proper cleanup via destroy()
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

// ─── Degree helpers ───────────────────────────────────────────────────────────
const DEG = Math.PI / 180;

// ─── Configuration ───────────────────────────────────────────────────────────
// Adjust this value to scale the 3D model size (default is 2.8)
const MODEL_TARGET_SIZE = 3.8;

// Initial base orientation offsets of the model (in degrees)
// Adjust these to change the initial angle (e.g. Y: 180 to rotate 180° around the vertical axis)
const MODEL_INITIAL_ROTATION = {
  x: 0,
  y: 60, // Default 180 to flip front-facing
  z: 0
};

// Constant position offset for the model in 3D world units
// Positive Y = up, Negative Y = down. X: positive = right, negative = left
const MODEL_POSITION_OFFSET = { x: 0, y: 0.07 };

// ─── Lerp helper ─────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Initialise the 3D hero on a given <canvas> element.
 * @param {string} canvasId  id of the <canvas> element
 * @returns {{ destroy: () => void }}
 */
export function initHero3D(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return { destroy: () => { } };

  const container = canvas.parentElement;

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Scene ───────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();

  // ── Camera ──────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ── Sizing ──────────────────────────────────────────────────────────────────
  function updateSize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  updateSize();

  // ── Lighting — Studio 3-point setup ─────────────────────────────────────────

  // Ambient warm fill
  const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.6);
  scene.add(ambientLight);

  // Key light — warm gold from upper-left
  const keyLight = new THREE.DirectionalLight(0xffe0a0, 2.4);
  keyLight.position.set(-3, 5, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill light — cool blue from right
  const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.8);
  fillLight.position.set(4, 2, 2);
  scene.add(fillLight);

  // Rim / back light — warm accent
  const rimLight = new THREE.DirectionalLight(0xffd580, 1.2);
  rimLight.position.set(0, -3, -4);
  scene.add(rimLight);

  // Hemisphere sky/ground
  const hemi = new THREE.HemisphereLight(0x2a3a5a, 0x1a1008, 0.5);
  scene.add(hemi);

  // ── Contact shadow plane ─────────────────────────────────────────────────────
  const shadowGeo = new THREE.PlaneGeometry(5, 5);
  const shadowMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.18,
    roughness: 1,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.6;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Radial gradient for softer contact shadow
  const shadowBlurGeo = new THREE.PlaneGeometry(4, 4);
  const shadowBlurMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.10,
  });
  const shadowBlur = new THREE.Mesh(shadowBlurGeo, shadowBlurMat);
  shadowBlur.rotation.x = -Math.PI / 2;
  shadowBlur.position.y = -1.58;
  scene.add(shadowBlur);

  // ── State ────────────────────────────────────────────────────────────────────
  let model = null;
  let modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // Hover & Jump state variables
  let isHovered = false;
  let currentScale = 1.0;
  let isJumping = false;
  const jumpScale = { x: 1, y: 1, z: 1 };
  const jumpState = { y: 0, rotY: 0, rotZ: 0 };

  // Idle float params
  const idleState = { t: 0 };

  // Mouse hover target rotation (radians)
  const mouse = { x: 0, y: 0 };
  const hoverRot = { x: 0, y: 0 };

  // Scroll state (set by GSAP)
  const scrollState = { y: 0, rotY: 0 };

  // Current model rotation accumulator (lerped)
  const currentRot = { x: 0, y: 0 };

  // ── GSAP Scroll interaction ──────────────────────────────────────────────────
  let scrollTriggerInstance = null;

  function setupScrollTrigger() {
    scrollTriggerInstance = gsap.to(scrollState, {
      y: -1.2,
      rotY: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }
  setupScrollTrigger();

  // ── Mouse tracking & Click Interactions ──────────────────────────────────────
  function onMouseEnter() {
    isHovered = true;
  }
  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    // Normalize -1 to 1 within the container
    mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }
  function onMouseLeave() {
    isHovered = false;
    mouse.x = 0;
    mouse.y = 0;
  }

  // Bouncy click animation: jump + 360 spin + squash & stretch
  function triggerJump() {
    if (isJumping) return;
    isJumping = true;

    // Reset values
    jumpState.y = 0;
    jumpState.rotY = 0;
    jumpScale.x = 1;
    jumpScale.y = 1;
    jumpScale.z = 1;

    const tl = gsap.timeline({
      onComplete: () => {
        isJumping = false;
      }
    });

    // 1. Take-off: squash down
    tl.to(jumpScale, {
      x: 1.15,
      y: 0.85,
      z: 1.15,
      duration: 0.12,
      ease: "power1.in"
    });

    // 2. Launch: stretch up and jump
    tl.to(jumpState, {
      y: 1.4,
      duration: 0.35,
      ease: "power2.out"
    }, ">");

    tl.to(jumpScale, {
      x: 0.88,
      y: 1.18,
      z: 0.88,
      duration: 0.22,
      ease: "power2.out"
    }, "<");

    // 3. Peak: normalize scale in air
    tl.to(jumpScale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.12,
      ease: "power1.inOut"
    }, ">-0.08");

    // 4. Fall & Bouncy Landing: squash on impact
    tl.to(jumpState, {
      y: 0,
      duration: 0.55,
      ease: "bounce.out"
    }, ">");

    tl.to(jumpScale, {
      x: 1.2,
      y: 0.8,
      z: 1.2,
      duration: 0.12,
      ease: "power1.out"
    }, ">-0.42");

    // 5. Recovery: bounce elastic back to 1.0
    tl.to(jumpScale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.3,
      ease: "elastic.out(1, 0.3)"
    }, ">");

    // Horizontal spin only (Y-axis)
    gsap.to(jumpState, {
      rotY: 360 * DEG,
      duration: 0.85,
      ease: "power2.inOut"
    });
  }

  // Listeners
  container.addEventListener('mouseenter', onMouseEnter);
  window.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);
  container.addEventListener('click', triggerJump);

  // ── Load GLB model ───────────────────────────────────────────────────────────
  const loader = new GLTFLoader();
  loader.load(
    '/models/dumplings.glb',
    (gltf) => {
      model = gltf.scene;

      // Hide loading spinner
      const loadingEl = document.getElementById('hero-3d-loading');
      if (loadingEl) {
        loadingEl.classList.add('fade-out');
      }

      // Apply initial base orientation
      model.rotation.x = MODEL_INITIAL_ROTATION.x * DEG;
      model.rotation.y = MODEL_INITIAL_ROTATION.y * DEG;
      model.rotation.z = MODEL_INITIAL_ROTATION.z * DEG;

      // Enable shadows on all meshes
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Enhance material quality
          if (child.material) {
            child.material.envMapIntensity = 0.5;
          }
        }
      });

      // Auto-center using Box3
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      // Scale to fit nicely in viewport (~2.2 units tall)
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = MODEL_TARGET_SIZE / maxDim;
      model.scale.setScalar(scale);

      // Re-center after scale
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = new THREE.Vector3();
      scaledBox.getCenter(scaledCenter);
      model.position.sub(scaledCenter);

      // Reposition shadow plane to base of model
      const scaledMin = scaledBox.min;
      shadowPlane.position.y = scaledMin.y - 0.05;
      shadowBlur.position.y = scaledMin.y - 0.03;

      modelGroup.add(model);
    },
    undefined,
    (error) => {
      console.warn('[hero3d] Failed to load dumplings.glb:', error);

      // Hide loading spinner
      const loadingEl = document.getElementById('hero-3d-loading');
      if (loadingEl) {
        loadingEl.classList.add('fade-out');
      }

      // Fallback: show a simple torus knot as placeholder
      const geo = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xc49a45,
        metalness: 0.4,
        roughness: 0.3,
      });
      model = new THREE.Mesh(geo, mat);
      model.castShadow = true;
      modelGroup.add(model);
    }
  );

  // ── Animation loop ───────────────────────────────────────────────────────────
  let animId = null;
  let lastTime = 0;

  function animate(time) {
    animId = requestAnimationFrame(animate);
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (modelGroup) {
      // ─ Idle float (sine wave) ─────────────────────────────────────────────
      idleState.t += dt * 0.6;
      const floatY = Math.sin(idleState.t) * 0.08;
      const floatRoll = Math.sin(idleState.t * 0.7) * 0.015;

      // ─ Hover target rotation ──────────────────────────────────────────────
      hoverRot.x = mouse.y * 8 * DEG;   // ±8° on X axis
      hoverRot.y = mouse.x * 12 * DEG;  // ±12° on Y axis

      // ─ Lerp current rotation toward hover target ──────────────────────────
      currentRot.x = lerp(currentRot.x, hoverRot.x, 0.06);
      currentRot.y = lerp(currentRot.y, hoverRot.y, 0.06);

      // ─ Hover scaling (smooth zoom-in) ────────────────────────────────────
      const targetScale = isHovered ? 1.12 : 1.0;
      currentScale = lerp(currentScale, targetScale, 0.08);
      modelGroup.scale.set(
        currentScale * jumpScale.x,
        currentScale * jumpScale.y,
        currentScale * jumpScale.z
      );

      // ─ Apply combined rotation + float + jump spin ────────────────────────
      modelGroup.rotation.x = currentRot.x + floatRoll;
      modelGroup.rotation.y = currentRot.y + scrollState.rotY + jumpState.rotY;
      modelGroup.rotation.z = 0;

      // ─ Float + scroll + jump Y position (+ constant offset) ───────────────
      modelGroup.position.y = floatY + scrollState.y + jumpState.y + MODEL_POSITION_OFFSET.y;
      modelGroup.position.x = MODEL_POSITION_OFFSET.x;
    }

    renderer.render(scene, camera);
  }

  animate(0);

  // ── Resize observer ──────────────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => {
    updateSize();
  });
  resizeObserver.observe(container);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  function destroy() {
    cancelAnimationFrame(animId);
    resizeObserver.disconnect();
    container.removeEventListener('mouseenter', onMouseEnter);
    window.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseleave', onMouseLeave);
    container.removeEventListener('click', triggerJump);

    if (scrollTriggerInstance) {
      if (scrollTriggerInstance.scrollTrigger) {
        scrollTriggerInstance.scrollTrigger.kill();
      }
    }
    ScrollTrigger.getAll().forEach(st => st.kill());

    renderer.dispose();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  return { destroy };
}
