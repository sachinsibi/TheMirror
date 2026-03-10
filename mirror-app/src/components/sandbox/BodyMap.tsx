import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makeBodyPointMaterial, glbToPointCloud } from '../../utils/pointcloud';

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

/* ─── types ─── */
export interface OrganDetail {
  id: string;
  name: string;
  age: number;
  pace: number;
  trend: 'improving' | 'stable' | 'worsening';
  factors: string[];
  dataSource: string;
  color: string;
}

interface BodyMapProps {
  fullPage?: boolean;
  organDetails?: OrganDetail[];
  onZoneClick?: (zoneId: string) => void;
  onZoneHover?: (zoneId: string | null) => void;
  onEmptyClick?: () => void;
}

interface HitboxEntry {
  mesh: THREE.Mesh;
  group: THREE.Group;
  region: typeof BODY_REGIONS[0];
}


/* ─── component ─── */
export default function BodyMap({ fullPage, organDetails, onZoneClick, onZoneHover, onEmptyClick }: BodyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const setLoadedRef = useRef(setLoaded);
  const onZoneClickRef = useRef(onZoneClick);
  onZoneClickRef.current = onZoneClick;
  const onZoneHoverRef = useRef(onZoneHover);
  onZoneHoverRef.current = onZoneHover;
  const onEmptyClickRef = useRef(onEmptyClick);
  onEmptyClickRef.current = onEmptyClick;
  const organDetailsRef = useRef(organDetails);
  organDetailsRef.current = organDetails;

  const initScene = useCallback(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0f);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    // 15° upward elevation: camera arcs up from horizontal (r=3 kept constant)
    // y_offset = 3*sin(15°) ≈ 0.776,  z = 3*cos(15°) ≈ 2.898
    camera.position.set(0, 1 + 0.776, 2.898);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* Shift the body to appear at ~30% from left of viewport.
       setViewOffset pans the camera projection without moving the orbit target,
       so the body rotates correctly around its own centre. */
    function applyViewOffset() {
      const W = container.clientWidth;
      const H = container.clientHeight;
      // Virtual canvas is 2× wide; we show the right 50%+shift portion,
      // which places the body (at virtual centre W) at 30% from screen left.
      camera.setViewOffset(2 * W, H, Math.round(0.70 * W), 0, W, H);
    }
    applyViewOffset();

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

    const bodyMaterial = makeBodyPointMaterial(2.0, 1.0);
    const loader = new GLTFLoader();

    let humanPoints: THREE.Points | null = null;
    const hitboxes: HitboxEntry[] = [];
    let hoveredRegion: typeof BODY_REGIONS[0] | null = null;
    let disposed = false;

    const SPHERE_RADIUS = 0.017;
    const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 12, 8);
    const glowGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 1.9, 12, 8);

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

    /* load body — async so point sampling yields between chunks */
    glbToPointCloud(loader, '/models/body.glb', 25000, bodyMaterial).then((points) => {
      if (disposed || !points) return;
      humanPoints = points;

      // Extract bounding info for marker placement from the geometry
      const ptGeo = humanPoints.geometry;
      ptGeo.computeBoundingBox();
      const center = new THREE.Vector3();
      ptGeo.boundingBox!.getCenter(center);
      const size = new THREE.Vector3();
      ptGeo.boundingBox!.getSize(size);

      // glbToPointCloud already normalised the mesh to ~1.8 units tall and centred at origin.
      // Re-scale to the desired display size and lift it to y=1.
      const currentScale = humanPoints.scale.x; // set by glbToPointCloud (1.8/maxDim)
      const displayScale = (2.5 / 1.8) * currentScale;
      humanPoints.scale.setScalar(displayScale);
      humanPoints.position.set(0, 1, 0);
      humanPoints.rotation.y = Math.PI / 6;   // 30° Y rotation
      scene.add(humanPoints);
      controls.target.set(0, 1, 0);
      controls.update();

      // Markers need the original bbox in local space (before display scaling)
      createMarkers(center, size);
      setLoadedRef.current(true);

      // Set heartbeat origin to cardiovascular region in local geometry space
      const cvRegion = BODY_REGIONS.find(r => r.id === 'cardiovascular')!;
      const heartOrigin = new THREE.Vector3(
        center.x + size.x * cvRegion.offset[0],
        center.y + size.y * cvRegion.offset[1],
        center.z + size.z * cvRegion.offset[2],
      );
      bodyMaterial.uniforms.uHeartOrigin.value.copy(heartOrigin);

      // Max radius = distance from heart to furthest corner of bounding box
      const maxR = Math.max(
        heartOrigin.distanceTo(ptGeo.boundingBox!.min),
        heartOrigin.distanceTo(ptGeo.boundingBox!.max),
      );
      bodyMaterial.uniforms.uMaxRadius.value = maxR;
    });

    /* hover / click */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const _worldPos = new THREE.Vector3();
    const _screen = new THREE.Vector3();

    const bubble = bubbleRef.current!;
    const hbLine = svgRef.current!.querySelector('#hb-line') as SVGLineElement;
    const hbDot = svgRef.current!.querySelector('#hb-dot') as SVGCircleElement;
    const hbIndicator = bubble.querySelector('.bubble-indicator') as HTMLElement;
    const hbLabel = bubble.querySelector('.bubble-label') as HTMLElement;

    function showBubble(region: typeof BODY_REGIONS[0]) {
      hoveredRegion = region;
      hbIndicator.style.color = region.color;
      hbIndicator.style.background = region.color;
      hbLabel.textContent = region.label;
      bubble.classList.add('visible');
      renderer.domElement.style.cursor = 'pointer';
      onZoneHoverRef.current?.(region.id);
    }

    function hideBubble() {
      hoveredRegion = null;
      bubble.classList.remove('visible');
      hbLine.setAttribute('stroke-opacity', '0');
      hbDot.setAttribute('fill-opacity', '0');
      renderer.domElement.style.cursor = 'default';
      onZoneHoverRef.current?.(null);
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

      const bubbleW = 280;
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

      const by = Math.max(20, Math.min(window.innerHeight - 160, sy - 30));

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
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = hitboxes.map(h => h.mesh);
      const hits = raycaster.intersectObjects(meshes);

      if (hits.length > 0) {
        const region = (hits[0].object as any).userData.region;
        showBubble(region);
      } else {
        hideBubble();
      }
    }

    // Distinguish click from drag: record pointer position on mousedown
    let pointerDownX = 0;
    let pointerDownY = 0;
    const DRAG_THRESHOLD = 4; // pixels

    function onPointerDown(e: MouseEvent) {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    }

    function onCanvasClick(e: MouseEvent) {
      const dx = e.clientX - pointerDownX;
      const dy = e.clientY - pointerDownY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return; // was a drag

      if (hoveredRegion) {
        onZoneClickRef.current?.(hoveredRegion.id);
        hideBubble();
      } else {
        // Only reset if the click missed the body point cloud entirely
        const rect = renderer.domElement.getBoundingClientRect();
        const clickMouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(clickMouse, camera);
        if (humanPoints) {
          raycaster.params.Points = { threshold: 0.05 };
          const hits = raycaster.intersectObject(humanPoints, false);
          if (hits.length > 0) return; // clicked on body model, not empty space
        }
        onEmptyClickRef.current?.();
      }
    }

    renderer.domElement.addEventListener('mousedown', onPointerDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('mouseleave', hideBubble);

    /* animation loop */
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

      // Drive heartbeat pulse
      bodyMaterial.uniforms.uTime.value = performance.now() / 1000.0;

      controls.update();
      renderer.render(scene, camera);

      if (hoveredRegion) updateHoverBubble();
    }

    /* resize */
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      bodyMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      // Reapply view offset (aspect ratio is handled inside setViewOffset)
      camera.setViewOffset(2 * w, h, Math.round(0.70 * w), 0, w, h);
    }
    window.addEventListener('resize', onResize);

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousedown', onPointerDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      renderer.domElement.removeEventListener('mouseleave', hideBubble);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    cleanupRef.current = initScene();
    return () => cleanupRef.current?.();
  }, [initScene]);

  const containerStyle: React.CSSProperties = fullPage
    ? { position: 'absolute', inset: 0 }
    : { position: 'relative', width: '100%', height: '100%', minHeight: 500 };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Loading overlay — positioned where the body model appears (~30% from left) */}
      {!loaded && (
        <div style={{
          position: 'absolute',
          left: '30%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 5,
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            letterSpacing: '3px',
            color: 'rgba(0, 200, 210, 0.5)',
            animation: 'bm-pulse 1.2s ease-in-out infinite',
          }}>
            LOADING...
          </span>
        </div>
      )}

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

      {/* Hover bubble — system name + click hint only */}
      <div ref={bubbleRef} className="bm-hover-bubble">
        <span className="bubble-indicator" />
        <span className="bubble-label" />
        <div className="bubble-hint">Click to inspect</div>
      </div>
    </div>
  );
}
