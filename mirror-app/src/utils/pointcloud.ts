import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ─── shaders ─── */
export const vertexShader = `
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

export const fragmentShader = `
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

export function makePointMaterial(pointSize: number, fade: number) {
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

/* ─── yield the main thread for one frame ─── */
function yieldFrame(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/* ─── build triangle list from geometry (synchronous, fast) ─── */
interface Triangle { vA: THREE.Vector3; vB: THREE.Vector3; vC: THREE.Vector3; area: number }

function buildTriangles(geometry: THREE.BufferGeometry) {
  const posAttr = geometry.getAttribute('position');
  const indexAttr = geometry.getIndex();
  const triangles: Triangle[] = [];
  let totalArea = 0;

  const readTri = (a: number, b: number, c: number) => {
    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b);
    const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c);
    const area = new THREE.Triangle(vA, vB, vC).getArea();
    triangles.push({ vA, vB, vC, area });
    totalArea += area;
  };

  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 3)
      readTri(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2));
  } else {
    for (let i = 0; i < posAttr.count; i += 3)
      readTri(i, i + 1, i + 2);
  }
  return { triangles, totalArea };
}

/* ─── sample N points from a pre-built triangle list ─── */
function sampleChunk(
  triangles: Triangle[],
  totalArea: number,
  count: number,
  outPos: number[],
  outInt: number[],
) {
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalArea;
    let idx = 0;
    for (let j = 0; j < triangles.length; j++) {
      r -= triangles[j].area;
      if (r <= 0) { idx = j; break; }
    }
    const t = triangles[idx];
    let u = Math.random(), v = Math.random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    outPos.push(
      t.vA.x * w + t.vB.x * u + t.vC.x * v,
      t.vA.y * w + t.vB.y * u + t.vC.y * v,
      t.vA.z * w + t.vB.z * u + t.vC.z * v,
    );
    outInt.push(0.4 + Math.random() * 0.6);
  }
}

/* ─── synchronous version (kept for compat) ─── */
export function samplePointsFromMesh(geometry: THREE.BufferGeometry, numPoints: number) {
  const { triangles, totalArea } = buildTriangles(geometry);
  const positions: number[] = [];
  const intensities: number[] = [];
  sampleChunk(triangles, totalArea, numPoints, positions, intensities);
  return {
    positions: new Float32Array(positions),
    intensities: new Float32Array(intensities),
  };
}

/* ─── async version: yields every CHUNK_SIZE points so the UI stays responsive ─── */
const CHUNK_SIZE = 2000;

async function samplePointsAsync(
  geometry: THREE.BufferGeometry,
  numPoints: number,
): Promise<{ positions: Float32Array; intensities: Float32Array }> {
  const { triangles, totalArea } = buildTriangles(geometry);
  const positions: number[] = [];
  const intensities: number[] = [];

  for (let done = 0; done < numPoints; done += CHUNK_SIZE) {
    const count = Math.min(CHUNK_SIZE, numPoints - done);
    sampleChunk(triangles, totalArea, count, positions, intensities);
    if (done + CHUNK_SIZE < numPoints) await yieldFrame();
  }

  return {
    positions: new Float32Array(positions),
    intensities: new Float32Array(intensities),
  };
}

/* ─── async glbToPointCloud — non-blocking ─── */
export async function glbToPointCloud(
  loader: GLTFLoader,
  path: string,
  numPoints: number,
  material: THREE.ShaderMaterial,
): Promise<THREE.Points | null> {
  return new Promise((resolve) => {
    loader.load(
      path,
      async (gltf) => {
        // Collect geometries (fast, synchronous)
        const geos: THREE.BufferGeometry[] = [];
        gltf.scene.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          child.updateWorldMatrix(true, false);
          const geo = (child as THREE.Mesh).geometry.clone();
          geo.applyMatrix4(child.matrixWorld);
          geos.push(geo);
        });

        if (!geos.length) { resolve(null); return; }

        // Sample each mesh async (non-blocking, yields between chunks)
        const perMesh = Math.ceil(numPoints / geos.length);
        const allPos: number[] = [];
        const allInt: number[] = [];
        for (const geo of geos) {
          const s = await samplePointsAsync(geo, perMesh);
          for (let i = 0; i < s.positions.length; i++) allPos.push(s.positions[i]);
          for (let i = 0; i < s.intensities.length; i++) allInt.push(s.intensities[i]);
        }

        if (!allPos.length) { resolve(null); return; }

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
        resolve(points);
      },
      undefined,
      () => resolve(null),
    );
  });
}
