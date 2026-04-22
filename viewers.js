import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let activeContainer = null; // the currently live .model-viewer element
const instances = new Map(); // container { renderer, controls, animId, ro, dispose }

const FADE_MS = 400; // keep in sync with the CSS transition duration

// ─────────────────────────────────────────────
//  WIRING — runs once on load
// ─────────────────────────────────────────────
document.querySelectorAll('.model-viewer').forEach(container => {

    // Click on the preview layer & activate
    container.querySelector('.mv-preview').addEventListener('click', () => {
        handleActivate(container);
    });

    // Click the close button & deactivate
    container.querySelector('.mv-close').addEventListener('click', e => {
        e.stopPropagation();
        deactivate(container);
    });
});

// ─────────────────────────────────────────────
//  ACTIVATION
// ─────────────────────────────────────────────
async function handleActivate(container) {
    // If something else is open, close it first then open the new one
    if (activeContainer && activeContainer !== container) {
        await deactivate(activeContainer);
    }
    if (activeContainer === container) return; // already open
    await activate(container);
}

async function activate(container) {
    const preview   = container.querySelector('.mv-preview');
    const canvasWrap = container.querySelector('.mv-canvas-wrap');

    // Show the loading state on the preview while the scene builds
    container.classList.add('mv-loading');

    // Tiny head-start so the loading class paints before the heavy work
    await delay(30);

    // Build the Three.js scene (this is the "expensive" part)
    const inst = initViewer(container, canvasWrap);
    instances.set(container, inst);

    // Wait one frame for the renderer to have a first image
    await delay(50);

    container.classList.remove('mv-loading');

    // Fade: hide preview, show canvas
    preview.classList.add('mv-hidden');
    canvasWrap.classList.add('mv-visible');
    container.classList.add('mv-active');

    activeContainer = container;
}

async function deactivate(container) {
    const preview    = container.querySelector('.mv-preview');
    const canvasWrap = container.querySelector('.mv-canvas-wrap');

    // Fade canvas out, preview back in
    container.classList.remove('mv-active');
    canvasWrap.classList.remove('mv-visible');

    await delay(FADE_MS);

    preview.classList.remove('mv-hidden');

    // Dispose Three.js resources fully
    const inst = instances.get(container);
    if (inst) {
        inst.ro?.disconnect();
        cancelAnimationFrame(inst.animId);
        inst.controls.dispose();
        inst.dispose(); // geometry + material cleanup
        inst.renderer.dispose();
        inst.renderer.forceContextLoss(); // release WebGL context
        canvasWrap.innerHTML = '';        // remove the <canvas> from DOM
        instances.delete(container);
    }

    if (activeContainer === container) activeContainer = null;
}

// ─────────────────────────────────────────────
//  THREE.JS SCENE 
// ─────────────────────────────────────────────
function initViewer(container, canvasWrap) {
    const modelPath = container.dataset.model;

    const scene = new THREE.Scene();

    const w = canvasWrap.clientWidth  || container.clientWidth;
    const h = canvasWrap.clientHeight || container.clientHeight;

    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setSize(w, h);
    canvasWrap.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Track disposable assets for clean teardown
    const disposables = [];

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;

        // Collect all geometries + materials for later disposal
        model.traverse(obj => {
            if (obj.isMesh) {
                disposables.push(obj.geometry);
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(m => {
                    disposables.push(m);
                    // Dispose any textures on the material
                    Object.values(m).forEach(v => {
                        if (v?.isTexture) disposables.push(v);
                    });
                });
            }
        });

        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        camera.position.set(0, 0, maxDim * 2);
        controls.update();

        scene.add(model);
    });

    // Resize observer: reacts to CSS layout changes, not just window resize
    const ro = new ResizeObserver(() => {
        const nw = canvasWrap.clientWidth;
        const nh = canvasWrap.clientHeight;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
    });
    ro.observe(canvasWrap);

    let animId;
    function animate() {
        animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    return {
        renderer,
        controls,
        get animId() { return animId; },
        ro,
        dispose: () => disposables.forEach(d => d.dispose?.()),
    };
}

// ─────────────────────────────────────────────
//  UTIL
// ─────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));
