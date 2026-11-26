// Hero background: a slowly turning "neural" shell of light around the head,
// with synapse lines, two orbital rings and signals travelling along them.
// Loaded lazily (dynamic import) on desktop only.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, Points,
  ShaderMaterial, AdditiveBlending, LineSegments, LineBasicMaterial, Group, Color,
  TorusGeometry, MeshBasicMaterial, Mesh, Vector3,
} from 'three';

export function startNeural(canvas: HTMLCanvasElement, stage?: HTMLElement | null) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the CSS glow and DOM orbit still carry the hero
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // rig = everything around the head; positioned over the DOM head on resize
  const rig = new Group();
  scene.add(rig);
  const world = new Group();
  rig.add(world);

  // ── Particle shell ──
  const COUNT = 1600;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const size = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    // denser near an equatorial band, so it reads as a halo, not a ball
    const u = Math.random() * Math.PI * 2;
    const band = Math.random() < 0.55;
    const v = band ? (Math.random() - 0.5) * 0.7 : Math.acos(2 * Math.random() - 1) - Math.PI / 2;
    const r = (band ? 3.3 : 2.6) + Math.random() * (band ? 1.4 : 0.9);
    pos[i * 3] = Math.cos(v) * Math.cos(u) * r;
    pos[i * 3 + 1] = Math.sin(v) * r * 0.9;
    pos[i * 3 + 2] = Math.cos(v) * Math.sin(u) * r;
    seed[i] = Math.random() * 100;
    size[i] = Math.random() < 0.06 ? 3.2 + Math.random() * 2.5 : 1 + Math.random() * 1.6;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(pos, 3));
  pGeo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  pGeo.setAttribute('aSize', new BufferAttribute(size, 1));
  const pMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPx: { value: renderer.getPixelRatio() },
      uA: { value: new Color('#2563ff') },
      uB: { value: new Color('#48d6ff') },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed; attribute float aSize;
      uniform float uTime; uniform float uPx;
      varying float vTw; varying float vMix;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vTw = 0.45 + 0.55 * sin(uTime * 1.4 + aSeed);
        vMix = fract(aSeed * 0.137);
        gl_PointSize = aSize * uPx * (9.0 / -mv.z) * (0.8 + 0.4 * vTw);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA; uniform vec3 uB;
      varying float vTw; varying float vMix;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a * a;
        gl_FragColor = vec4(mix(uA, uB, vMix), a * vTw * 0.95);
      }`,
  });
  world.add(new Points(pGeo, pMat));

  // ── Synapses: connect nearby points from a subset ──
  const SUB = 340;
  const linePos: number[] = [];
  const tmpA = new Vector3();
  const tmpB = new Vector3();
  for (let i = 0; i < SUB; i++) {
    tmpA.fromArray(pos, i * 3);
    let links = 0;
    for (let j = i + 1; j < SUB && links < 3; j++) {
      tmpB.fromArray(pos, j * 3);
      if (tmpA.distanceTo(tmpB) < 1.05) {
        linePos.push(tmpA.x, tmpA.y, tmpA.z, tmpB.x, tmpB.y, tmpB.z);
        links++;
      }
    }
  }
  const lGeo = new BufferGeometry();
  lGeo.setAttribute('position', new BufferAttribute(new Float32Array(linePos), 3));
  const lMat = new LineBasicMaterial({ color: '#3b7bff', transparent: true, opacity: 0.1, blending: AdditiveBlending, depthWrite: false });
  world.add(new LineSegments(lGeo, lMat));

  // ── Orbital rings ──
  const rings = new Group();
  rings.rotation.set(-1.3, 0, 0.21);
  rig.add(rings);
  const ringA = new Mesh(new TorusGeometry(4.15, 0.008, 8, 240), new MeshBasicMaterial({ color: '#48d6ff', transparent: true, opacity: 0.55, blending: AdditiveBlending }));
  const ringB = new Mesh(new TorusGeometry(4.6, 0.005, 8, 240), new MeshBasicMaterial({ color: '#2563ff', transparent: true, opacity: 0.4, blending: AdditiveBlending }));
  ringB.rotation.x = 0.16;
  rings.add(ringA, ringB);

  // signals travelling the rings
  const SIG = 6;
  const sigPos = new Float32Array(SIG * 3);
  const sigGeo = new BufferGeometry();
  sigGeo.setAttribute('position', new BufferAttribute(sigPos, 3));
  sigGeo.setAttribute('aSeed', new BufferAttribute(new Float32Array(SIG).fill(1.57), 1));
  sigGeo.setAttribute('aSize', new BufferAttribute(new Float32Array(SIG).fill(9), 1));
  const sigs = new Points(sigGeo, pMat);
  rings.add(sigs);

  // ── Wide neural field across the whole hero (behind the text too) ──
  const field = new Group();
  scene.add(field);
  const F = 1100;
  const fPos = new Float32Array(F * 3);
  const fSeed = new Float32Array(F);
  const fSize = new Float32Array(F);
  for (let i = 0; i < F; i++) {
    fPos[i * 3] = (Math.random() - 0.5) * 24;
    fPos[i * 3 + 1] = (Math.random() - 0.5) * 9.5;
    fPos[i * 3 + 2] = -4.5 + Math.random() * 4;
    fSeed[i] = Math.random() * 100;
    fSize[i] = Math.random() < 0.05 ? 2.6 + Math.random() * 2 : 0.7 + Math.random() * 1.1;
  }
  const fGeo = new BufferGeometry();
  fGeo.setAttribute('position', new BufferAttribute(fPos, 3));
  fGeo.setAttribute('aSeed', new BufferAttribute(fSeed, 1));
  fGeo.setAttribute('aSize', new BufferAttribute(fSize, 1));
  field.add(new Points(fGeo, pMat));
  const fLines: number[] = [];
  const a3 = new Vector3();
  const b3 = new Vector3();
  for (let i = 0; i < F; i++) {
    a3.fromArray(fPos, i * 3);
    let links = 0;
    for (let j = i + 1; j < F && links < 3; j++) {
      b3.fromArray(fPos, j * 3);
      if (a3.distanceTo(b3) < 1.15) {
        fLines.push(a3.x, a3.y, a3.z, b3.x, b3.y, b3.z);
        links++;
      }
    }
  }
  const flGeo = new BufferGeometry();
  flGeo.setAttribute('position', new BufferAttribute(new Float32Array(fLines), 3));
  field.add(new LineSegments(flGeo, new LineBasicMaterial({ color: '#2f6bff', transparent: true, opacity: 0.075, blending: AdditiveBlending, depthWrite: false })));

  // ── Sizing: keep the 3D halo locked onto the DOM head ──
  const VIS_H = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const RIG_UNITS = 5.35; // stage size, in world units, the halo was designed for
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (stage) {
      const c = canvas.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const visW = VIS_H * camera.aspect;
      const nx = (st.left + st.width / 2 - c.left) / c.width - 0.5;
      const ny = (st.top + st.height / 2 - c.top) / c.height - 0.5;
      rig.position.set(nx * visW, -ny * VIS_H, 0);
      rig.scale.setScalar(((st.height / c.height) * VIS_H) / RIG_UNITS);
    }
  };
  if (stage) new ResizeObserver(resize).observe(stage);
  new ResizeObserver(resize).observe(canvas);
  resize();

  // ── Interaction ──
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const t0 = performance.now();
  const render = (now: number) => {
    const t = (now - t0) / 1000;
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    pMat.uniforms.uTime.value = t;
    world.rotation.y = t * 0.05 + mx * 0.25;
    world.rotation.x = my * 0.12;
    rings.rotation.z = 0.21 + mx * 0.05;
    field.rotation.y = mx * 0.06;
    field.rotation.x = my * 0.04;
    field.position.x = Math.sin(t * 0.05) * 0.3;
    for (let i = 0; i < SIG; i++) {
      const r = i % 2 ? 4.6 : 4.15;
      const a = t * (i % 2 ? -0.35 : 0.5) + (i * Math.PI * 2) / SIG;
      sigPos[i * 3] = Math.cos(a) * r;
      sigPos[i * 3 + 1] = Math.sin(a) * r;
      sigPos[i * 3 + 2] = 0;
    }
    sigGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };

  canvas.classList.add('on');
  if (reduce) {
    render(t0 + 4000);
    return;
  }
  const loop = (now: number) => {
    if (visible && !document.hidden) render(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
