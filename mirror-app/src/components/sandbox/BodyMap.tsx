import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ─── palette ─── */
const STATUS_COLORS = {
  positive: '#4ae616',
  moderate: '#eaea08',
  negative: '#f5700b',
};

/* ─── 5-system regions mapped to body-bbox offsets ─── */
const BODY_REGIONS = [
  { id: 'neurological',   label: 'NEUROLOGICAL',   description: 'Brain & Nervous System',      offset: [0, 0.43, 0.02],    color: STATUS_COLORS.positive, organ: '/models/brain.glb' },
  { id: 'cardiovascular', label: 'CARDIOVASCULAR',  description: 'Heart & Circulatory System',  offset: [0.08, 0.26, 0.06], color: STATUS_COLORS.positive, organ: '/models/heart.glb' },
  { id: 'metabolic',      label: 'METABOLIC',       description: 'Pancreas & Metabolic System', offset: [0.06, 0.155, 0.06],color: STATUS_COLORS.negative, organ: '/models/pancreas.glb' },
  { id: 'endocrine',      label: 'ENDOCRINE',       description: 'Thyroid & Glandular System',  offset: [0, 0.35, 0.05],    color: STATUS_COLORS.moderate, organ: '/models/thyroid.glb' },
  { id: 'immune',         label: 'IMMUNE',          description: 'Spleen & Immune System',      offset: [-0.10, 0.14, 0.05],color: STATUS_COLORS.moderate, organ: '/models/spleen.glb' },
];

/* ─── shaders ─── */
const vertexShader = `
  attribute float intensity;
  varying float vIntensity;
  uniform float uPixelRatio;
  uniform float uPointSize;
  void main() {
    vIntensity = intensity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPointSize * uPixelRatio * (3.0 / -mvPosition.z);
    gl_Position  = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vIntensity;
  uniform float uFade;
  void main() {
    vec2  c    = gl_PointCoord - vec2(0.5);
    float dist = length(c);
    if (dist > 0.5) discard;
    vec3  baseColor = vec3(0.0, 0.75, 0.85);
    vec3  color     = baseColor * (0.6 + vIntensity * 0.6);
    float alpha     = smoothstep(0.5, 0.15, dist) * (0.7 + vIntensity * 0.3);
    gl_FragColor = vec4(color, alpha * uFade);
  }
`;

function makePointMaterial(pointSize: number, fade: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uPointSize:  { value: pointSize },
      uFade:       { value: fade },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/* ─── point-sampling from mesh triangles ─── */
function samplePointsFromMesh(geometry: THREE.BufferGeometry, numPoints: number) {
  const positions: number[] = [];
  const intensities: number[] = [];
  const posAttr = geometry.getAttribute('position');
  const indexAttr = geometry.getIndex();
  const triangles: { vA: THREE.Vector3; vB: THREE.Vector3; vC: THREE.Vector3 }[] = [];
  const areas: number[] = [];
  let totalArea = 0;

  const readTri = (a: number, b: number, c: number) => {
    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b);
    const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c);
    const area = new THREE.Triangle(vA, vB, vC).getArea();
    triangles.push({ vA, vB, vC });
    areas.push(area);
    totalArea += area;
  };

  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 3)
      readTri(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
  } else {
    for (let i = 0; i < posAttr.count; i += 3)
      readTri(i, i + 1, i + 2);
  }

  for (let i = 0; i < numPoints; i++) {
    let r = Math.random() * totalArea;
    let idx = 0;
    for (let j = 0; j < areas.length; j++) {
      r -= areas[j];
      if (r <= 0) { idx = j; break; }
    }
    const t = triangles[idx];
    let u = Math.random(), v = Math.random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    positions.push(
      t.vA.x * w + t.vB.x * u + t.vC.x * v,
      t.vA.y * w + t.vB.y * u + t.vC.y * v,
      t.vA.z * w + t.vB.z * u + t.vC.z * v,
    );
    intensities.push(0.4 + Math.random() * 0.6);
  }
  return {
    positions: new Float32Array(positions),
    intensities: new Float32Array(intensities),
  };
}

function glbToPointCloud(
  loader: GLTFLoader,
  path: string,
  numPoints: number,
  material: THREE.ShaderMaterial,
  callback: (points: THREE.Points | null) => void,
) {
  loader.load(
    path,
    (gltf) => {
      const allPos: number[] = [];
      const allInt: number[] = [];
      gltf.scene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        child.updateWorldMatrix(true, false);
        const geo = (child as THREE.Mesh).geometry.clone();
        geo.applyMatrix4(child.matrixWorld);
        const s = samplePointsFromMesh(geo, numPoints);
        for (let i = 0; i < s.positions.length; i++) allPos.push(s.positions[i]);
        for (let i = 0; i < s.intensities.length; i++) allInt.push(s.intensities[i]);
      });
      if (!allPos.length) { callback(null); return; }

      const ptGeo = new THREE.BufferGeometry();
      ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(allPos, 3));
      ptGeo.setAttribute('intensity', new THREE.Float32BufferAttribute(allInt, 1));
      ptGeo.computeBoundingBox();

      const ctr = new THREE.Vector3();
      const sz = new THREE.Vector3();
      ptGeo.boundingBox!.getCenter(ctr);
      ptGeo.boundingBox!.getSize(sz);
      const maxD = Math.max(sz.x, sz.y, sz.z);
      const sc = 1.8 / maxD;

      const points = new THREE.Points(ptGeo, material);
      points.scale.setScalar(sc);
      points.position.set(-ctr.x * sc, -ctr.y * sc, -ctr.z * sc);
      callback(points);
    },
    undefined,
    () => callback(null),
  );
}

/* ─── types ─── */
interface BodyMapProps {
  onZoneClick?: (zoneId: string) => void;
}

interface HitboxEntry {
  mesh: THREE.Mesh;
  group: THREE.Group;
  region: typeof BODY_REGIONS[0];
}

/* ─── component ─── */
export default function BodyMap({ onZoneClick }: BodyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  /* detail overlay refs */
  const detailRef = useRef<HTMLDivElement>(null);
  const detailTitleRef = useRef<HTMLHeadingElement>(null);
  const detailDescRef = useRef<HTMLParagraphElement>(null);
  const organCanvasRef = useRef<HTMLCanvasElement>(null);
  const organLoadingRef = useRef<HTMLParagraphElement>(null);
  const organUnavailRef = useRef<HTMLParagraphElement>(null);
  const detailSummaryRef = useRef<HTMLDivElement>(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);

  const cleanupRef = useRef<(() => void) | null>(null);

  // Keep a ref to onZoneClick so the Three.js event handler can access the latest value
  const onZoneClickRef = useRef(onZoneClick);
  onZoneClickRef.current = onZoneClick;

  const initScene = useCallback(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;

    /* ── scene ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0f);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0x406080, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set(0, 1, 0);

    const bodyMaterial = makePointMaterial(2.0, 1.0);
    const organMaterial = makePointMaterial(1.5, 1.0);
    const loader = new GLTFLoader();

    let humanPoints: THREE.Points | null = null;
    const hitboxes: HitboxEntry[] = [];
    let hoveredRegion: typeof BODY_REGIONS[0] | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let detailOpen = false;
    let targetFade = 1.0;
    let disposed = false;

    /* organ sub-renderer */
    let organRenderer: THREE.WebGLRenderer | null = null;
    let organScene: THREE.Scene | null = null;
    let organCamera: THREE.PerspectiveCamera | null = null;
    let organControls: OrbitControls | null = null;
    let currentOrgan: THREE.Points | null = null;

    const SPHERE_RADIUS = 0.017;
    const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 12, 8);
    const glowGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 1.9, 12, 8);

    /* ── marker creation ── */
    function createMarkers(bboxCenter: THREE.Vector3, bboxSize: THREE.Vector3) {
      BODY_REGIONS.forEach((region) => {
        const [ox, oy, oz] = region.offset;
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(region.color),
          transparent: true, opacity: 0.22,
          depthWrite: false, blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);

        const coreMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(region.color),
          transparent: true, opacity: 0.95,
          depthWrite: false, blending: THREE.AdditiveBlending,
        });
        const core = new THREE.Mesh(sphereGeo, coreMat);

        const group = new THREE.Group();
        group.add(glow);
        group.add(core);
        group.position.set(
          bboxCenter.x + bboxSize.x * ox,
          bboxCenter.y + bboxSize.y * oy,
          bboxCenter.z + bboxSize.z * oz,
        );
        (group as any).userData.region = region;
        (core as any).userData.region = region;

        humanPoints!.add(group);
        hitboxes.push({ mesh: core, group, region });
      });
    }

    /* ── load body ── */
    loader.load('/models/body.glb', (gltf) => {
      if (disposed) return;
      const allPos: number[] = [];
      const allInt: number[] = [];
      gltf.scene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        child.updateWorldMatrix(true, false);
        const geo = (child as THREE.Mesh).geometry.clone();
        geo.applyMatrix4(child.matrixWorld);
        const s = samplePointsFromMesh(geo, 25000);
        for (let i = 0; i < s.positions.length; i++) allPos.push(s.positions[i]);
        for (let i = 0; i < s.intensities.length; i++) allInt.push(s.intensities[i]);
      });
      if (!allPos.length) return;

      const ptGeo = new THREE.BufferGeometry();
      ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(allPos, 3));
      ptGeo.setAttribute('intensity', new THREE.Float32BufferAttribute(allInt, 1));
      ptGeo.computeBoundingBox();

      const center = new THREE.Vector3();
      ptGeo.boundingBox!.getCenter(center);
      const size = new THREE.Vector3();
      ptGeo.boundingBox!.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;

      humanPoints = new THREE.Points(ptGeo, bodyMaterial);
      humanPoints.scale.set(scale, scale, scale);
      humanPoints.position.set(-center.x * scale, -center.y * scale + 1, -center.z * scale);
      scene.add(humanPoints);
      controls.target.set(0, 1, 0);
      controls.update();

      createMarkers(center, size);
    });

    /* ── hover / click ── */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const _worldPos = new THREE.Vector3();
    const _screen = new THREE.Vector3();

    const bubble = bubbleRef.current!;
    const hbLine = svgRef.current!.querySelector('#hb-line') as SVGLineElement;
    const hbDot = svgRef.current!.querySelector('#hb-dot') as SVGCircleElement;
    const hbIndicator = bubble.querySelector('.bubble-indicator') as HTMLElement;
    const hbLabel = bubble.querySelector('.bubble-label') as HTMLElement;
    const hbDesc = bubble.querySelector('.bubble-desc') as HTMLElement;

    function showBubble(region: typeof BODY_REGIONS[0]) {
      hoveredRegion = region;
      hbIndicator.style.color = region.color;
      hbIndicator.style.background = region.color;
      hbLabel.textContent = region.label;
      hbDesc.textContent = region.description;
      bubble.classList.add('visible');
      renderer.domElement.style.cursor = 'pointer';
    }

    function hideBubble() {
      hoveredRegion = null;
      bubble.classList.remove('visible');
      hbLine.setAttribute('stroke-opacity', '0');
      hbDot.setAttribute('fill-opacity', '0');
      renderer.domElement.style.cursor = 'default';
    }

    function scheduleHide() {
      cancelHide();
      hideTimer = setTimeout(hideBubble, 280);
    }
    function cancelHide() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    }

    function updateHoverBubble() {
      if (!hoveredRegion) return;
      const hb = hitboxes.find(h => h.region.id === hoveredRegion!.id);
      if (!hb) return;

      hb.mesh.getWorldPosition(_worldPos);
      _screen.copy(_worldPos).project(camera);

      const rect = renderer.domElement.getBoundingClientRect();
      const sx = (_screen.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-_screen.y * 0.5 + 0.5) * rect.height + rect.top;

      const bubbleW = 220;
      const gap = 60;
      const midX = rect.left + rect.width / 2;
      let bx: number, lineStartX: number;

      if (sx < midX) {
        bx = sx + gap;
        lineStartX = bx;
      } else {
        bx = sx - gap - bubbleW;
        lineStartX = bx + bubbleW;
      }

      const by = Math.max(20, Math.min(window.innerHeight - 120, sy - 30));

      bubble.style.left = bx + 'px';
      bubble.style.top = by + 'px';

      hbLine.setAttribute('x1', String(lineStartX));
      hbLine.setAttribute('y1', String(by + 22));
      hbLine.setAttribute('x2', String(sx));
      hbLine.setAttribute('y2', String(sy));
      hbLine.setAttribute('stroke', hoveredRegion.color);
      hbLine.setAttribute('stroke-opacity', '0.45');

      hbDot.setAttribute('cx', String(sx));
      hbDot.setAttribute('cy', String(sy));
      hbDot.setAttribute('fill', hoveredRegion.color);
      hbDot.setAttribute('fill-opacity', '0.7');
    }

    function onMouseMove(event: MouseEvent) {
      if (detailOpen) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = hitboxes.map(h => h.mesh);
      const hits = raycaster.intersectObjects(meshes);

      if (hits.length > 0) {
        const region = (hits[0].object as any).userData.region;
        cancelHide();
        showBubble(region);
      } else {
        scheduleHide();
      }
    }

    function onCanvasClick() {
      if (hoveredRegion && !detailOpen) {
        openDetail(hoveredRegion);
        onZoneClickRef.current?.(hoveredRegion.id);
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('mouseleave', scheduleHide);

    bubble.addEventListener('mouseenter', cancelHide);
    bubble.addEventListener('mouseleave', scheduleHide);
    bubble.addEventListener('click', () => {
      if (hoveredRegion) {
        openDetail(hoveredRegion);
        onZoneClickRef.current?.(hoveredRegion.id);
      }
    });

    /* ── detail overlay (organ point cloud) ── */
    function initOrganRenderer() {
      if (organRenderer) return;
      const oc = organCanvasRef.current!;
      organRenderer = new THREE.WebGLRenderer({ canvas: oc, antialias: true, alpha: true });
      organRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      organRenderer.setClearColor(0x000000, 0);

      organScene = new THREE.Scene();
      organCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
      organCamera.position.set(0, 0, 2.5);

      organScene.add(new THREE.AmbientLight(0x607080, 0.8));

      organControls = new OrbitControls(organCamera, oc);
      organControls.enableDamping = true;
      organControls.dampingFactor = 0.08;
      organControls.autoRotate = true;
      organControls.autoRotateSpeed = 2.0;
    }

    function resizeOrganRenderer() {
      if (!organRenderer || !organCanvasRef.current) return;
      const c = organCanvasRef.current.parentElement!;
      const w = c.clientWidth;
      const h = c.clientHeight;
      organRenderer.setSize(w, h);
      organCamera!.aspect = w / h;
      organCamera!.updateProjectionMatrix();
    }

    function clearOrganScene() {
      if (!organScene) return;
      if (currentOrgan) { organScene.remove(currentOrgan); currentOrgan = null; }
    }

    /* ── synthetic data for detail view ── */
    const SYNTHETIC_DATA: Record<string, { metrics: { label: string; value: string; unit: string; status: string }[]; summary: string }> = {
      neurological: {
        metrics: [
          { label: 'Brain Age', value: '56.4', unit: 'years', status: 'attention' },
          { label: 'Deep Sleep', value: '1.4', unit: 'hrs', status: 'attention' },
          { label: 'REM Sleep', value: '1.8', unit: 'hrs', status: 'normal' },
          { label: 'Sleep Score', value: '72', unit: '/ 100', status: 'normal' },
          { label: 'Cognitive Pace', value: '1.14', unit: '×', status: 'attention' },
        ],
        summary: 'Deep sleep declining — avg 1.4h (target 1.8h+). Primary driver of neurological aging acceleration.',
      },
      cardiovascular: {
        metrics: [
          { label: 'Heart Age', value: '55.8', unit: 'years', status: 'normal' },
          { label: 'Resting HR', value: '68', unit: 'bpm', status: 'optimal' },
          { label: 'HRV (RMSSD)', value: '42', unit: 'ms', status: 'normal' },
          { label: 'HRV Trend', value: '−3%', unit: 'w/w', status: 'attention' },
          { label: 'Cardiac Pace', value: '1.08', unit: '×', status: 'normal' },
        ],
        summary: 'Resting HRV declining 3% week-over-week. Stable overall but trending toward acceleration.',
      },
      metabolic: {
        metrics: [
          { label: 'Metabolic Age', value: '60.1', unit: 'years', status: 'attention' },
          { label: 'Glucose Var.', value: '47', unit: 'mg/dL', status: 'attention' },
          { label: 'Post-meal Spike', value: '+47', unit: 'mg/dL', status: 'attention' },
          { label: 'Time in Range', value: '78', unit: '%', status: 'normal' },
          { label: 'Metabolic Pace', value: '1.28', unit: '×', status: 'attention' },
        ],
        summary: 'Post-meal glucose spikes (avg +47 mg/dL) are the primary driver. Post-meal walks could reduce by ~30%.',
      },
      endocrine: {
        metrics: [
          { label: 'Endocrine Age', value: '57.0', unit: 'years', status: 'normal' },
          { label: 'Temp Rhythm', value: 'IRREG', unit: '', status: 'attention' },
          { label: 'Circadian HRV', value: 'DRIFT', unit: '', status: 'attention' },
          { label: 'TSH Proxy', value: '2.1', unit: 'mIU/L', status: 'optimal' },
          { label: 'Endocrine Pace', value: '1.10', unit: '×', status: 'normal' },
        ],
        summary: 'Circadian temperature rhythm irregular — late light exposure disrupting endocrine signaling.',
      },
      immune: {
        metrics: [
          { label: 'Immune Age', value: '58.3', unit: 'years', status: 'attention' },
          { label: 'Inflam. Load', value: 'ELEV', unit: '', status: 'attention' },
          { label: 'Sleep Consist.', value: '68', unit: '%', status: 'normal' },
          { label: 'Epigenetic CpG', value: '↑', unit: 'meth', status: 'attention' },
          { label: 'Immune Pace', value: '1.18', unit: '×', status: 'attention' },
        ],
        summary: 'Inflammatory load elevated by late dinners. Epigenetic immunosenescence markers trending up.',
      },
    };

    function openDetail(region: typeof BODY_REGIONS[0]) {
      initOrganRenderer();
      detailOpen = true;
      targetFade = 0.15;
      hideBubble();

      const overlay = detailRef.current!;
      detailTitleRef.current!.textContent = region.label;
      detailTitleRef.current!.style.color = region.color;
      detailDescRef.current!.textContent = region.description;

      const data = SYNTHETIC_DATA[region.id];
      const dc = dataContainerRef.current!;
      dc.innerHTML = '';
      if (data) {
        data.metrics.forEach((m) => {
          const row = document.createElement('div');
          row.className = 'bm-data-row';
          row.innerHTML =
            `<span class="bm-data-label">${m.label}</span>` +
            `<span><span class="bm-data-value bm-status-${m.status}">${m.value}</span>` +
            `<span class="bm-data-unit">${m.unit}</span></span>`;
          dc.appendChild(row);
        });
        detailSummaryRef.current!.textContent = '// ' + data.summary;
      }

      clearOrganScene();
      organLoadingRef.current!.classList.remove('bm-hidden');
      organUnavailRef.current!.classList.add('bm-hidden');

      if (region.organ) {
        glbToPointCloud(loader, region.organ, 10000, organMaterial, (points) => {
          clearOrganScene();
          organLoadingRef.current!.classList.add('bm-hidden');
          if (points) {
            currentOrgan = points;
            organScene!.add(points);
            resizeOrganRenderer();
          } else {
            organUnavailRef.current!.classList.remove('bm-hidden');
          }
        });
      } else {
        organLoadingRef.current!.classList.add('bm-hidden');
        organUnavailRef.current!.classList.remove('bm-hidden');
      }

      overlay.classList.remove('bm-hidden');
    }

    function closeDetail() {
      detailOpen = false;
      targetFade = 1.0;
      detailRef.current!.classList.add('bm-hidden');
      clearOrganScene();
    }

    // Bind close
    const closeBtn = detailRef.current!.querySelector('.bm-detail-close') as HTMLButtonElement;
    closeBtn.addEventListener('click', closeDetail);
    detailRef.current!.addEventListener('click', (e) => {
      if (e.target === detailRef.current) closeDetail();
    });

    /* ── animation loop ── */
    let animId: number;
    function animate() {
      if (disposed) return;
      animId = requestAnimationFrame(animate);

      hitboxes.forEach((h) => {
        if (!h.group) return;
        const isHovered = hoveredRegion && hoveredRegion.id === h.region.id;
        (h.mesh.material as THREE.MeshBasicMaterial).opacity = isHovered ? 1.0 : 0.95;
        ((h.group.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = isHovered ? 0.45 : 0.22;
      });

      const cur = bodyMaterial.uniforms.uFade.value;
      if (Math.abs(cur - targetFade) > 0.005) {
        bodyMaterial.uniforms.uFade.value += (targetFade - cur) * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);

      if (hoveredRegion) updateHoverBubble();

      if (detailOpen && organRenderer && organScene) {
        organControls!.update();
        organRenderer.render(organScene, organCamera!);
      }
    }

    /* ── resize ── */
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      bodyMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      if (detailOpen) resizeOrganRenderer();
    }
    window.addEventListener('resize', onResize);

    animate();

    /* ── cleanup ── */
    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      renderer.domElement.removeEventListener('mouseleave', scheduleHide);
      controls.dispose();
      renderer.dispose();
      organRenderer?.dispose();
      organControls?.dispose();
    };
  }, []);

  useEffect(() => {
    cleanupRef.current = initScene();
    return () => cleanupRef.current?.();
  }, [initScene]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 500 }}>
      {/* Main 3D canvas */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* SVG overlay for connecting line */}
      <svg ref={svgRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line id="hb-line" strokeWidth="1" strokeOpacity="0" filter="url(#glow)" />
        <circle id="hb-dot" r="3.5" fillOpacity="0" filter="url(#glow)" />
      </svg>

      {/* Hover bubble */}
      <div ref={bubbleRef} className="bm-hover-bubble">
        <span className="bubble-indicator" />
        <span className="bubble-label" />
        <div className="bubble-desc" />
        <div className="bubble-hint">Click to inspect</div>
      </div>

      {/* Detail overlay */}
      <div ref={detailRef} className="bm-detail-overlay bm-hidden">
        <div className="bm-detail-panel">
          <button className="bm-detail-close">&times;</button>
          <div className="bm-detail-header">
            <h2 ref={detailTitleRef} className="bm-detail-title" />
            <p ref={detailDescRef} className="bm-detail-desc" />
          </div>
          <div className="bm-detail-body">
            <div className="bm-organ-container">
              <canvas ref={organCanvasRef} className="bm-organ-canvas" />
              <p ref={organLoadingRef} className="bm-organ-loading">
                LOADING MODEL<span className="bm-dot-anim">...</span>
              </p>
              <p ref={organUnavailRef} className="bm-organ-unavail bm-hidden">
                // NO 3D MODEL AVAILABLE
              </p>
            </div>
            <div ref={dataContainerRef} className="bm-data-container" />
          </div>
          <div ref={detailSummaryRef} className="bm-detail-summary" />
        </div>
      </div>
    </div>
  );
}
