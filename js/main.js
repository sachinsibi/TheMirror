// =============================================================
// CONFIGURATION
// =============================================================

const PALETTE = {
    amber:      '#F59E0B',
    warmGray:   '#A8A29E',
    teal:       '#14B8A6',
    accentBlue: '#25a1e8',
};

// Sphere colours: green = positive, yellow = moderate, amber = negative
const STATUS_COLORS = {
    positive: '#4ae616',
    moderate: '#eaea08',
    negative: '#f5700b',
};

// offset: fraction of bbox size from centre (y ±0.5 = top/bottom of bbox)
const BODY_REGIONS = [
    {
        id: 'neurological', label: 'NEUROLOGICAL',
        description: 'Brain & Nervous System',
        offset: [0, 0.43, 0.02],
        color: STATUS_COLORS.positive,
        organ: '3D_model/organs/human_brain.glb',
    },
    {
        id: 'cardiovascular', label: 'CARDIOVASCULAR',
        description: 'Heart & Circulatory System',
        offset: [0.08, 0.26, 0.06],
        color: STATUS_COLORS.positive,
        organ: '3D_model/organs/human_heart.glb',
    },
    {
        id: 'respiratory', label: 'RESPIRATORY',
        description: 'Lungs & Airways',
        offset: [-0.07, 0.22, 0.05],
        color: STATUS_COLORS.moderate,
        organ: '3D_model/organs/human_lungs.glb',
    },
    {
        id: 'digestive', label: 'DIGESTIVE',
        description: 'Stomach & Intestines',
        offset: [0.06, 0.155, 0.06],
        color: STATUS_COLORS.positive,
        organ: '3D_model/organs/human_stomach.glb',
    },
    {
        id: 'hepatic', label: 'HEPATIC',
        description: 'Liver & Biliary System',
        offset: [-0.10, 0.14, 0.05],
        color: STATUS_COLORS.positive,
        organ: '3D_model/organs/human_liver.glb',
    },
    {
        id: 'excretory', label: 'EXCRETORY',
        description: 'Kidneys & Urinary System',
        offset: [0, 0.07, -0.10],
        color: STATUS_COLORS.positive,
        organ: '3D_model/organs/human_kidney.glb',
    },
    {
        id: 'hormonal', label: 'HORMONAL',
        description: 'Endocrine & Glandular System',
        offset: [0, -0.01, 0.05],
        color: STATUS_COLORS.negative,
        organ: '3D_model/organs/human_immune.glb',
    },
    {
        id: 'musculoskeletal', label: 'MUSCULOSKELETAL',
        description: 'Muscles, Bones & Joints',
        offset: [0.24, 0.29, 0],
        color: STATUS_COLORS.moderate,
        organ: '3D_model/organs/human_muscle.glb',
    },
];

const SYNTHETIC_DATA = {
    neurological: {
        metrics: [
            { label: 'Brain Age',       value: '32',  unit: 'years',  status: 'optimal'  },
            { label: 'Cognitive Score',  value: '94',  unit: '/ 100',  status: 'optimal'  },
            { label: 'Neural Density',   value: 'HIGH',unit: '',       status: 'optimal'  },
            { label: 'Reaction Time',    value: '215', unit: 'ms',     status: 'normal'   },
            { label: 'Memory Index',     value: '88',  unit: '/ 100',  status: 'optimal'  },
        ],
        summary: 'Neural pathways show excellent connectivity and minimal age-related degradation.',
    },
    cardiovascular: {
        metrics: [
            { label: 'Heart Rate',        value: '68',     unit: 'bpm',       status: 'optimal'  },
            { label: 'Blood Pressure',    value: '118/76', unit: 'mmHg',      status: 'optimal'  },
            { label: 'Ejection Fraction', value: '62',     unit: '%',         status: 'optimal'  },
            { label: 'VO\u2082 Max',      value: '45',     unit: 'mL/kg/min', status: 'normal'   },
            { label: 'Arterial Stiffness',value: 'LOW',    unit: '',          status: 'optimal'  },
        ],
        summary: 'Cardiovascular function is within optimal range with strong ejection fraction.',
    },
    respiratory: {
        metrics: [
            { label: 'Lung Capacity',      value: '5.8', unit: 'L',     status: 'optimal' },
            { label: 'O\u2082 Saturation', value: '98',  unit: '%',     status: 'optimal' },
            { label: 'FEV1 / FVC',         value: '0.82',unit: '',      status: 'normal'  },
            { label: 'Peak Flow',           value: '580', unit: 'L/min', status: 'normal'  },
            { label: 'Resp. Rate',          value: '14',  unit: '/min',  status: 'optimal' },
        ],
        summary: 'Respiratory function shows healthy lung capacity and efficient gas exchange.',
    },
    digestive: {
        metrics: [
            { label: 'Gut Microbiome',     value: 'DIVERSE', unit: '',   status: 'optimal' },
            { label: 'Transit Time',        value: '28',      unit: 'hrs', status: 'normal'  },
            { label: 'Enzyme Activity',     value: 'HIGH',    unit: '',   status: 'optimal' },
            { label: 'Inflammation',        value: 'LOW',     unit: '',   status: 'optimal' },
            { label: 'Nutrient Absorption', value: '92',      unit: '%',  status: 'optimal' },
        ],
        summary: 'Digestive system shows healthy microbiome diversity and enzyme function.',
    },
    hormonal: {
        metrics: [
            { label: 'Testosterone',        value: '620', unit: 'ng/dL',     status: 'normal'  },
            { label: 'Cortisol',            value: '12',  unit: '\u03BCg/dL', status: 'normal'  },
            { label: 'Thyroid (TSH)',       value: '2.1', unit: 'mIU/L',     status: 'optimal' },
            { label: 'Insulin Sensitivity', value: 'HIGH',unit: '',          status: 'optimal' },
            { label: 'Growth Hormone',      value: '3.2', unit: 'ng/mL',     status: 'normal'  },
        ],
        summary: 'Endocrine panel shows balanced hormone levels within normal limits.',
    },
    musculoskeletal: {
        metrics: [
            { label: 'Bone Density',  value: '1.2',  unit: 'g/cm\u00B2', status: 'optimal' },
            { label: 'Muscle Mass',   value: '38',   unit: 'kg',          status: 'normal'  },
            { label: 'Grip Strength', value: '48',   unit: 'kg',          status: 'optimal' },
            { label: 'Flexibility',   value: 'GOOD', unit: '',            status: 'normal'  },
            { label: 'Joint Health',  value: '92',   unit: '/ 100',       status: 'optimal' },
        ],
        summary: 'Strong musculoskeletal framework with above-average bone density.',
    },
    excretory: {
        metrics: [
            { label: 'GFR',            value: '105', unit: 'mL/min', status: 'optimal' },
            { label: 'Creatinine',     value: '0.9', unit: 'mg/dL',  status: 'optimal' },
            { label: 'BUN',            value: '14',  unit: 'mg/dL',  status: 'optimal' },
            { label: 'Uric Acid',      value: '5.2', unit: 'mg/dL',  status: 'normal'  },
            { label: 'Albumin/Creat.', value: '<30', unit: 'mg/g',   status: 'optimal' },
        ],
        summary: 'Kidney function is excellent with optimal filtration rates.',
    },
    hepatic: {
        metrics: [
            { label: 'ALT',        value: '22',  unit: 'U/L',  status: 'optimal' },
            { label: 'AST',        value: '25',  unit: 'U/L',  status: 'optimal' },
            { label: 'Bilirubin',  value: '0.8', unit: 'mg/dL', status: 'optimal' },
            { label: 'Albumin',    value: '4.2', unit: 'g/dL',  status: 'optimal' },
            { label: 'Fibro Score',value: 'F0',  unit: '',      status: 'optimal' },
        ],
        summary: 'Liver function tests are within normal range with no signs of fibrosis.',
    },
};

// =============================================================
// SCENE SETUP
// =============================================================

const container = document.getElementById('container');

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x0a1015);

const camera = new THREE.PerspectiveCamera(
    60, container.clientWidth / container.clientHeight, 0.1, 1000,
);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lights (for fallback; point-cloud shader ignores them)
scene.add(new THREE.AmbientLight(0x406080, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.05;
controls.rotateSpeed    = 0.8;
controls.zoomSpeed      = 1.2;
controls.minDistance     = 1;
controls.maxDistance     = 10;
controls.target.set(0, 1, 0);

// =============================================================
// SHADERS (shared between body + organ point clouds)
// =============================================================

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

function makePointMaterial(pointSize, fade) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uPointSize:  { value: pointSize },
            uFade:       { value: fade },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
    });
}

const bodyMaterial  = makePointMaterial(2.0, 1.0);
const organMaterial = makePointMaterial(1.5, 1.0);

// =============================================================
// POINT-SAMPLING HELPER
// =============================================================

function samplePointsFromMesh(geometry, numPoints) {
    const positions = [], intensities = [];
    const posAttr   = geometry.getAttribute('position');
    const indexAttr  = geometry.getIndex();
    const triangles = [], areas = [];
    let totalArea = 0;

    const readTri = (a, b, c) => {
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
        let r = Math.random() * totalArea, idx = 0;
        for (let j = 0; j < areas.length; j++) { r -= areas[j]; if (r <= 0) { idx = j; break; } }
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
        positions:   new Float32Array(positions),
        intensities: new Float32Array(intensities),
    };
}

/** Load a GLB and return a Points object rendered as cyan particle cloud */
function glbToPointCloud(path, numPoints, material, callback) {
    loader.load(path, function (gltf) {
        const allPos = [], allInt = [];
        gltf.scene.traverse(function (child) {
            if (!child.isMesh) return;
            child.updateWorldMatrix(true, false);
            const geo = child.geometry.clone();
            geo.applyMatrix4(child.matrixWorld);
            const s = samplePointsFromMesh(geo, numPoints);
            for (let i = 0; i < s.positions.length; i++)   allPos.push(s.positions[i]);
            for (let i = 0; i < s.intensities.length; i++) allInt.push(s.intensities[i]);
        });
        if (!allPos.length) { callback(null); return; }

        const ptGeo = new THREE.BufferGeometry();
        ptGeo.setAttribute('position',  new THREE.Float32BufferAttribute(allPos, 3));
        ptGeo.setAttribute('intensity', new THREE.Float32BufferAttribute(allInt, 1));
        ptGeo.computeBoundingBox();

        const ctr = new THREE.Vector3(), sz = new THREE.Vector3();
        ptGeo.boundingBox.getCenter(ctr);
        ptGeo.boundingBox.getSize(sz);
        const maxD = Math.max(sz.x, sz.y, sz.z);
        const sc   = 1.8 / maxD;

        const points = new THREE.Points(ptGeo, material);
        points.scale.setScalar(sc);
        points.position.set(-ctr.x * sc, -ctr.y * sc, -ctr.z * sc);
        callback(points);
    },
    undefined,
    function () { callback(null); });
}

// =============================================================
// LOAD HUMAN BODY → POINT CLOUD + HITBOXES
// =============================================================

const loader     = new THREE.GLTFLoader();
let humanPoints  = null;
const hitboxes   = [];   // { mesh, region }

loader.load(
    '3D_model/low-poly_male_body.glb',
    function (gltf) {
        const allPos = [], allInt = [];
        gltf.scene.traverse(function (child) {
            if (!child.isMesh) return;
            child.updateWorldMatrix(true, false);
            const geo = child.geometry.clone();
            geo.applyMatrix4(child.matrixWorld);
            const s = samplePointsFromMesh(geo, 25000);
            for (let i = 0; i < s.positions.length; i++)   allPos.push(s.positions[i]);
            for (let i = 0; i < s.intensities.length; i++) allInt.push(s.intensities[i]);
        });
        if (!allPos.length) { console.error('No mesh found'); return; }

        const ptGeo = new THREE.BufferGeometry();
        ptGeo.setAttribute('position',  new THREE.Float32BufferAttribute(allPos, 3));
        ptGeo.setAttribute('intensity', new THREE.Float32BufferAttribute(allInt, 1));

        ptGeo.computeBoundingBox();
        const center = new THREE.Vector3();
        ptGeo.boundingBox.getCenter(center);
        const size = new THREE.Vector3();
        ptGeo.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale  = 2.5 / maxDim;

        humanPoints = new THREE.Points(ptGeo, bodyMaterial);
        humanPoints.scale.set(scale, scale, scale);
        humanPoints.position.set(
            -center.x * scale,
            -center.y * scale + 1,
            -center.z * scale,
        );
        scene.add(humanPoints);
        controls.target.set(0, 1, 0);
        controls.update();

        createMarkers(center, size);
    },
    function (xhr) { console.log((xhr.loaded / xhr.total * 100).toFixed(0) + '% loaded'); },
    function (err) { console.error('Error loading model:', err); },
);

// =============================================================
// MARKERS — visible glowing spheres as region hotspots
// =============================================================

// Shared sphere geometry — small indicator dots
const SPHERE_RADIUS = 0.017;
const sphereGeo     = new THREE.SphereGeometry(SPHERE_RADIUS, 12, 8);
const glowGeo       = new THREE.SphereGeometry(SPHERE_RADIUS * 1.9, 12, 8);

function createMarkers(bboxCenter, bboxSize) {
    BODY_REGIONS.forEach(function (region) {
        const [ox, oy, oz] = region.offset;

        // Outer glow shell
        const glowMat = new THREE.MeshBasicMaterial({
            color:       new THREE.Color(region.color),
            transparent: true,
            opacity:     0.22,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);

        // Core sphere (solid, for raycasting)
        const coreMat = new THREE.MeshBasicMaterial({
            color:       new THREE.Color(region.color),
            transparent: true,
            opacity:     0.95,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
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
        group.userData.region = region;
        core.userData.region  = region;

        humanPoints.add(group);
        hitboxes.push({ mesh: core, group, region });
    });
}

// =============================================================
// HOVER BUBBLE  (single tooltip, shown on region hover)
// =============================================================

const hoverBubble = document.getElementById('hover-bubble');
const hbIndicator = document.getElementById('hb-indicator');
const hbLabel     = document.getElementById('hb-label');
const hbDesc      = document.getElementById('hb-desc');
const hbLine      = document.getElementById('hb-line');
const hbDot       = document.getElementById('hb-dot');

let hoveredRegion = null;
let hideTimer     = null;

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
const _worldPos = new THREE.Vector3();
const _screen   = new THREE.Vector3();

renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('click', onCanvasClick);
renderer.domElement.addEventListener('mouseleave', function () { scheduleHide(); });

hoverBubble.addEventListener('mouseenter', function () { cancelHide(); });
hoverBubble.addEventListener('mouseleave', function () { scheduleHide(); });
hoverBubble.addEventListener('click', function () {
    if (hoveredRegion) openDetail(hoveredRegion);
});

function onMouseMove(event) {
    if (detailOpen) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    // Only raycast against sphere cores (not the glow shells)
    const meshes = hitboxes.map(function (h) { return h.mesh; });
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
        // Nearest sphere wins (sorted by distance by default)
        var region = hits[0].object.userData.region;
        cancelHide();
        showBubble(region);
    } else {
        scheduleHide();
    }
}

function onCanvasClick() {
    if (hoveredRegion && !detailOpen) openDetail(hoveredRegion);
}

function showBubble(region) {
    hoveredRegion = region;

    hbIndicator.style.color      = region.color;
    hbIndicator.style.background = region.color;
    hbLabel.textContent          = region.label;
    hbDesc.textContent           = region.description;

    hoverBubble.classList.add('visible');
    renderer.domElement.style.cursor = 'pointer';
}

function hideBubble() {
    hoveredRegion = null;
    hoverBubble.classList.remove('visible');
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

/** Position the bubble + SVG line near the hovered region's 3D anchor */
function updateHoverBubble() {
    if (!hoveredRegion) return;
    const hb = hitboxes.find(function (h) { return h.region.id === hoveredRegion.id; });
    if (!hb) return;

    hb.mesh.getWorldPosition(_worldPos);
    _screen.copy(_worldPos).project(camera);

    const rect = renderer.domElement.getBoundingClientRect();
    const sx   = ( _screen.x * 0.5 + 0.5) * rect.width  + rect.left;
    const sy   = (-_screen.y * 0.5 + 0.5) * rect.height + rect.top;

    // Bubble offset: place to the right if anchor is left-of-center, else left
    const bubbleW = 220;
    const gap     = 60;
    const midX    = rect.left + rect.width / 2;
    let bx, lineStartX;

    if (sx < midX) {
        bx         = sx + gap;
        lineStartX = bx;
    } else {
        bx         = sx - gap - bubbleW;
        lineStartX = bx + bubbleW;
    }

    const by = Math.max(20, Math.min(window.innerHeight - 120, sy - 30));

    hoverBubble.style.left = bx + 'px';
    hoverBubble.style.top  = by + 'px';

    // SVG line from bubble edge to body anchor
    hbLine.setAttribute('x1', lineStartX);
    hbLine.setAttribute('y1', by + 22);
    hbLine.setAttribute('x2', sx);
    hbLine.setAttribute('y2', sy);
    hbLine.setAttribute('stroke', hoveredRegion.color);
    hbLine.setAttribute('stroke-opacity', '0.45');

    hbDot.setAttribute('cx', sx);
    hbDot.setAttribute('cy', sy);
    hbDot.setAttribute('fill', hoveredRegion.color);
    hbDot.setAttribute('fill-opacity', '0.7');
}

// =============================================================
// DETAIL OVERLAY — organ point cloud + synthetic data
// =============================================================

const detailOverlay  = document.getElementById('detail-overlay');
const detailTitle    = document.getElementById('detail-title');
const detailDesc     = document.getElementById('detail-desc');
const detailSummary  = document.getElementById('detail-summary');
const dataContainer  = document.getElementById('data-container');
const organCanvas    = document.getElementById('organ-canvas');
const organLoading   = document.getElementById('organ-loading');
const organUnavail   = document.getElementById('organ-unavailable');
const detailCloseBtn = document.getElementById('detail-close');

let organRenderer, organScene, organCamera, organControls;
let currentOrgan = null;
let detailOpen   = false;
let targetFade   = 1.0;

function initOrganRenderer() {
    if (organRenderer) return;
    organRenderer = new THREE.WebGLRenderer({ canvas: organCanvas, antialias: true, alpha: true });
    organRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    organRenderer.setClearColor(0x000000, 0);

    organScene  = new THREE.Scene();
    organCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
    organCamera.position.set(0, 0, 2.5);

    // Lights for the organ scene (even though it's a point cloud,
    // lights don't affect ShaderMaterial — kept for any future PBR fallback)
    organScene.add(new THREE.AmbientLight(0x607080, 0.8));

    organControls = new THREE.OrbitControls(organCamera, organCanvas);
    organControls.enableDamping  = true;
    organControls.dampingFactor  = 0.08;
    organControls.autoRotate     = true;
    organControls.autoRotateSpeed = 2.0;
}

function openDetail(region) {
    initOrganRenderer();
    detailOpen = true;
    targetFade = 0.15;
    hideBubble();

    // Header
    detailTitle.textContent = region.label;
    detailTitle.style.color = region.color;
    detailDesc.textContent  = region.description;

    // Data metrics
    const data = SYNTHETIC_DATA[region.id];
    dataContainer.innerHTML = '';
    if (data) {
        data.metrics.forEach(function (m) {
            const row = document.createElement('div');
            row.className = 'data-row';
            row.innerHTML =
                '<span class="data-label">' + m.label + '</span>' +
                '<span>' +
                    '<span class="data-value status-' + m.status + '">' + m.value + '</span>' +
                    '<span class="data-unit">' + m.unit + '</span>' +
                '</span>';
            dataContainer.appendChild(row);
        });
        detailSummary.textContent = '// ' + data.summary;
    }

    // Organ point cloud
    clearOrganScene();
    organLoading.classList.remove('hidden');
    organUnavail.classList.add('hidden');

    if (region.organ) {
        glbToPointCloud(region.organ, 10000, organMaterial, function (points) {
            clearOrganScene();
            organLoading.classList.add('hidden');
            if (points) {
                currentOrgan = points;
                organScene.add(points);
                resizeOrganRenderer();
            } else {
                organUnavail.classList.remove('hidden');
            }
        });
    } else {
        organLoading.classList.add('hidden');
        organUnavail.classList.remove('hidden');
    }

    detailOverlay.classList.remove('hidden');
}

function closeDetail() {
    detailOpen = false;
    targetFade = 1.0;
    detailOverlay.classList.add('hidden');
    clearOrganScene();
}

function clearOrganScene() {
    if (!organScene) return;
    if (currentOrgan) { organScene.remove(currentOrgan); currentOrgan = null; }
}

function resizeOrganRenderer() {
    if (!organRenderer) return;
    var c = document.getElementById('organ-container');
    var w = c.clientWidth, h = c.clientHeight;
    organRenderer.setSize(w, h);
    organCamera.aspect = w / h;
    organCamera.updateProjectionMatrix();
}

detailCloseBtn.addEventListener('click', closeDetail);
detailOverlay.addEventListener('click', function (e) {
    if (e.target === detailOverlay) closeDetail();
});

// =============================================================
// ANIMATION
// =============================================================

let isInteracting = false;
controls.addEventListener('start', function () { isInteracting = true; });
controls.addEventListener('end',   function () { isInteracting = false; });

function animate() {
    requestAnimationFrame(animate);

    // Auto-rotate body
    // if (humanPoints && !isInteracting && !detailOpen) {
    //     humanPoints.rotation.y += 0.002;
    // }

    // Brighten marker on hover (no pulsing)
    hitboxes.forEach(function (h) {
        if (!h.group) return;
        var isHovered = hoveredRegion && hoveredRegion.id === h.region.id;
        h.mesh.material.opacity              = isHovered ? 1.0  : 0.95;
        h.group.children[0].material.opacity = isHovered ? 0.45 : 0.22;
    });

    // Smooth fade
    var cur = bodyMaterial.uniforms.uFade.value;
    if (Math.abs(cur - targetFade) > 0.005) {
        bodyMaterial.uniforms.uFade.value += (targetFade - cur) * 0.08;
    }

    controls.update();
    renderer.render(scene, camera);

    // Hover bubble tracking
    if (hoveredRegion) updateHoverBubble();

    // Organ renderer
    if (detailOpen && organRenderer && organScene) {
        organControls.update();
        organRenderer.render(organScene, organCamera);
    }
}

// =============================================================
// RESIZE
// =============================================================

window.addEventListener('resize', function () {
    var w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    bodyMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    if (detailOpen) resizeOrganRenderer();
});

// Fade controls hint
setTimeout(function () {
    var hint = document.getElementById('controls-hint');
    if (hint) hint.style.opacity = '0';
}, 6000);

// Start
animate();
