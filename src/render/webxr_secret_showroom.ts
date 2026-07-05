import * as THREE from 'three';
import { loadGltf } from './assets/loader';

const SECRET_POCKET = { x: 181, z: 101 };
const SHOW_RADIUS_SQ = 18 * 18;
const BELLE_URL = '/models/chars/npcs/valley_belle.glb';
const TANK_URL = '/models/props/energy_vale/legged_sky_tank.glb';

type NavigatorWithXR = Navigator & {
  xr?: {
    isSessionSupported?: (mode: 'immersive-vr') => Promise<boolean>;
    requestSession?: (
      mode: 'immersive-vr',
      options?: { optionalFeatures?: string[] },
    ) => Promise<XRSessionLike>;
  };
};

type XRSessionLike = {
  addEventListener: (type: 'end', listener: () => void, options?: { once?: boolean }) => void;
  end?: () => Promise<void>;
};

export class SecretPocketWebXRShowroom {
  private button: HTMLButtonElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private supported: boolean | null = null;
  private active = false;
  private visible = false;

  constructor() {
    if (typeof document === 'undefined') return;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.textContent = 'VR Showroom';
    this.button.title = 'Enter the secret Energy Vale WebXR showroom';
    this.button.style.cssText = [
      'position:fixed',
      'right:18px',
      'bottom:86px',
      'z-index:90',
      'display:none',
      'padding:10px 14px',
      'border:1px solid rgba(255,255,255,.26)',
      'border-radius:8px',
      'background:rgba(6,10,18,.82)',
      'color:#f7fbff',
      'font:700 13px/1.1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'box-shadow:0 10px 30px rgba(0,0,0,.35)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'cursor:pointer',
    ].join(';');
    this.button.addEventListener('click', () => void this.enter());
    document.body.appendChild(this.button);
    void this.detectSupport();
  }

  update(playerX: number, playerZ: number): void {
    if (!this.button || this.active) return;
    const dx = playerX - SECRET_POCKET.x;
    const dz = playerZ - SECRET_POCKET.z;
    const near = dx * dx + dz * dz <= SHOW_RADIUS_SQ;
    const canShow = near && this.supported !== false;
    if (canShow === this.visible) return;
    this.visible = canShow;
    this.button.style.display = canShow ? 'block' : 'none';
  }

  dispose(): void {
    this.button?.remove();
    this.button = null;
    this.endSession();
  }

  private async detectSupport(): Promise<void> {
    const xr = (navigator as NavigatorWithXR).xr;
    if (!xr?.isSessionSupported) {
      this.supported = false;
      return;
    }
    try {
      this.supported = await xr.isSessionSupported('immersive-vr');
    } catch {
      this.supported = false;
    }
  }

  private async enter(): Promise<void> {
    if (this.active) return;
    const xr = (navigator as NavigatorWithXR).xr;
    if (!xr?.requestSession) {
      this.flashUnavailable();
      return;
    }
    this.active = true;
    if (this.button) {
      this.button.disabled = true;
      this.button.textContent = 'Loading VR...';
    }
    try {
      this.buildScene();
      await this.loadShowpieces();
      const session = await xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });
      session.addEventListener('end', () => this.endSession(), { once: true });
      await this.renderer!.xr.setSession(session as never);
      this.renderer!.setAnimationLoop(() => {
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;
        if (renderer && scene && camera) renderer.render(scene, camera);
      });
      if (this.button) this.button.style.display = 'none';
    } catch (err) {
      console.warn('WebXR showroom failed', err);
      this.flashUnavailable();
      this.endSession();
    }
  }

  private buildScene(): void {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:89;display:none';
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.xr.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071019);
    scene.fog = new THREE.Fog(0x071019, 14, 34);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 80);
    camera.position.set(0, 1.6, 4.2);
    camera.lookAt(0, 1.35, 0);

    const hemi = new THREE.HemisphereLight(0xdcefff, 0x27301f, 1.35);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe1a8, 2.4);
    key.position.set(4, 8, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0x76d6ff, 4.5, 12, 2);
    fill.position.set(-3, 2.4, 2.2);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.8, 0.18, 48),
      new THREE.MeshStandardMaterial({
        color: 0x263734,
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    floor.position.y = -0.09;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.035, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0x7bdcff }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.03;
    scene.add(ring);

    this.canvas = canvas;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  private async loadShowpieces(): Promise<void> {
    const scene = this.scene!;
    const [belle, tank] = await Promise.all([loadGltf(BELLE_URL), loadGltf(TANK_URL)]);
    const belleRoot = normalizeClone(belle.scene, 1.75);
    belleRoot.position.set(-1.25, 0, -0.2);
    belleRoot.rotation.y = Math.PI * 0.18;
    scene.add(belleRoot);

    const tankRoot = normalizeClone(tank.scene, 2.55);
    tankRoot.position.set(1.45, 0, -0.15);
    tankRoot.rotation.y = -Math.PI * 0.22;
    scene.add(tankRoot);
  }

  private flashUnavailable(): void {
    if (!this.button) return;
    this.button.disabled = false;
    this.button.textContent = 'VR unavailable';
    window.setTimeout(() => {
      if (!this.button) return;
      this.button.textContent = 'VR Showroom';
      this.button.disabled = false;
    }, 1800);
  }

  private endSession(): void {
    this.renderer?.setAnimationLoop(null);
    this.scene?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) mat.dispose();
    });
    this.renderer?.dispose();
    this.canvas?.remove();
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.active = false;
    if (this.button) {
      this.button.disabled = false;
      this.button.textContent = 'VR Showroom';
    }
  }
}

function normalizeClone(source: THREE.Object3D, targetHeight: number): THREE.Group {
  const root = source.clone(true) as THREE.Group;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry = mesh.geometry.clone();
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((mat) => mat.clone())
      : mesh.material.clone();
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.x, size.y, size.z, 0.001);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  return root;
}
