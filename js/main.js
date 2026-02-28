// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1015);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('container').appendChild(renderer.domElement);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.zoomSpeed = 1.2;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 1, 0);

// Custom shader for cyan point cloud effect
const vertexShader = `
    attribute float intensity;
    varying float vIntensity;
    uniform float uPixelRatio;
    uniform float uPointSize;

    void main() {
        vIntensity = intensity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        gl_PointSize = uPointSize * uPixelRatio * (3.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    varying float vIntensity;

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) discard;

        // Cyan/teal color matching the template
        vec3 baseColor = vec3(0.0, 0.75, 0.85);
        vec3 color = baseColor * (0.6 + vIntensity * 0.6);

        float alpha = smoothstep(0.5, 0.15, dist) * (0.7 + vIntensity * 0.3);

        gl_FragColor = vec4(color, alpha);
    }
`;

const material = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uPointSize: { value: 2.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

// Function to sample points from mesh surface
function samplePointsFromMesh(geometry, numPoints) {
    const positions = [];
    const intensities = [];

    const posAttr = geometry.getAttribute('position');
    const indexAttr = geometry.getIndex();

    // Get all triangles
    const triangles = [];
    const areas = [];
    let totalArea = 0;

    if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
            const a = indexAttr.getX(i);
            const b = indexAttr.getX(i + 1);
            const c = indexAttr.getX(i + 2);

            const vA = new THREE.Vector3().fromBufferAttribute(posAttr, a);
            const vB = new THREE.Vector3().fromBufferAttribute(posAttr, b);
            const vC = new THREE.Vector3().fromBufferAttribute(posAttr, c);

            const area = new THREE.Triangle(vA, vB, vC).getArea();
            triangles.push({ vA, vB, vC });
            areas.push(area);
            totalArea += area;
        }
    } else {
        for (let i = 0; i < posAttr.count; i += 3) {
            const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i);
            const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
            const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

            const area = new THREE.Triangle(vA, vB, vC).getArea();
            triangles.push({ vA, vB, vC });
            areas.push(area);
            totalArea += area;
        }
    }

    // Sample points weighted by triangle area
    for (let i = 0; i < numPoints; i++) {
        // Pick a random triangle weighted by area
        let r = Math.random() * totalArea;
        let triIndex = 0;
        for (let j = 0; j < areas.length; j++) {
            r -= areas[j];
            if (r <= 0) {
                triIndex = j;
                break;
            }
        }

        const tri = triangles[triIndex];

        // Random point on triangle using barycentric coordinates
        let u = Math.random();
        let v = Math.random();
        if (u + v > 1) {
            u = 1 - u;
            v = 1 - v;
        }
        const w = 1 - u - v;

        const x = tri.vA.x * w + tri.vB.x * u + tri.vC.x * v;
        const y = tri.vA.y * w + tri.vB.y * u + tri.vC.y * v;
        const z = tri.vA.z * w + tri.vB.z * u + tri.vC.z * v;

        positions.push(x, y, z);
        intensities.push(0.4 + Math.random() * 0.6);
    }

    return {
        positions: new Float32Array(positions),
        intensities: new Float32Array(intensities)
    };
}

// Load the GLB model
const loader = new THREE.GLTFLoader();
let humanPoints = null;

loader.load(
    'low-poly_male_body.glb',
    function (gltf) {
        console.log('Model loaded successfully');

        // Find the mesh in the loaded model
        let combinedGeometry = new THREE.BufferGeometry();
        const allPositions = [];
        const allIntensities = [];

        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                console.log('Found mesh:', child.name);

                // Get world matrix for proper positioning
                child.updateWorldMatrix(true, false);
                const geometry = child.geometry.clone();
                geometry.applyMatrix4(child.matrixWorld);

                // Sample points from this mesh
                const numPoints = 80000; // Adjust for density
                const sampled = samplePointsFromMesh(geometry, numPoints);

                for (let i = 0; i < sampled.positions.length; i++) {
                    allPositions.push(sampled.positions[i]);
                }
                for (let i = 0; i < sampled.intensities.length; i++) {
                    allIntensities.push(sampled.intensities[i]);
                }
            }
        });

        if (allPositions.length === 0) {
            console.error('No mesh found in the model');
            return;
        }

        // Create point cloud geometry
        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
        pointGeometry.setAttribute('intensity', new THREE.Float32BufferAttribute(allIntensities, 1));

        // Center the geometry
        pointGeometry.computeBoundingBox();
        const center = new THREE.Vector3();
        pointGeometry.boundingBox.getCenter(center);

        const size = new THREE.Vector3();
        pointGeometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit nicely in view
        const scale = 2.5 / maxDim;

        // Create the points object
        humanPoints = new THREE.Points(pointGeometry, material);
        humanPoints.scale.set(scale, scale, scale);
        humanPoints.position.set(-center.x * scale, -center.y * scale + 1, -center.z * scale);

        scene.add(humanPoints);

        // Update camera target
        controls.target.set(0, 1, 0);
        controls.update();

        console.log('Point cloud created with', allPositions.length / 3, 'points');
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading model:', error);
    }
);

// Animation
let time = 0;
let isInteracting = false;

function animate() {
    requestAnimationFrame(animate);

    time += 0.016;

    // Subtle auto-rotation when not interacting
    if (humanPoints && !isInteracting) {
        humanPoints.rotation.y += 0.002;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Interaction tracking
controls.addEventListener('start', () => isInteracting = true);
controls.addEventListener('end', () => isInteracting = false);

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});

// Fade hint
setTimeout(() => {
    const hint = document.getElementById('controls-hint');
    if (hint) hint.style.opacity = '0';
}, 5000);

// Start animation
animate();
