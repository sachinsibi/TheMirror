import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makePointMaterial, glbToPointCloud } from '../../utils/pointcloud';

interface OrganViewerProps {
  organPath: string;
  color: string;
}

export default function OrganViewer({ organPath }: OrganViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);

    const parent = canvas.parentElement!;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 100);
    camera.position.set(0, 0, 2.5);

    scene.add(new THREE.AmbientLight(0x607080, 0.8));

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    const material = makePointMaterial(1.5, 1.0);
    const loader = new GLTFLoader();
    let disposed = false;

    glbToPointCloud(loader, organPath, 10000, material).then(points => {
      if (disposed) return;
      if (points) scene.add(points);
      setLoading(false);
    });

    let animId: number;
    function animate() {
      if (disposed) return;
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      renderer.setSize(pw, ph);
      camera.aspect = pw / ph;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [organPath]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
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
    </div>
  );
}
