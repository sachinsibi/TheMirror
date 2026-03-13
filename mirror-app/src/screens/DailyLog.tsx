import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, CheckCircle, Zap, Activity, Salad, BedDouble, Calendar } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makePointMaterial, glbToPointCloud } from '../utils/pointcloud';
import Card from '../components/ui/Card';

interface DailyLogProps {
  onNavigateToProjections: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MealCategory = 'whole' | 'mixed' | 'processed' | null;
type StressLevel = 1 | 2 | 3 | 4 | 5 | null;
type HydrationLevel = 'low' | 'ok' | 'good' | null;
type MissedExercise = 'none' | 'strength' | 'yoga' | 'other' | null;
type ModalCategory = 'fitness' | 'nutrition' | 'recovery' | null;

// ─── Synthetic wearable data (Oura + Dexcom) ─────────────────────────────────

const OURA_DATA = {
  totalSleep: '7h 23m',
  efficiency: 84,
  hrv: 42,
  restingHR: 58,
  activeCalories: 340,
  steps: 6200,
  detectedActivity: 'Light walk · 28 min',
};

const DEXCOM_DATA = {
  timeInRange: 81,
  peakGlucose: 142,
  variabilityScore: 'Low',
};

const CGM_MEAL_TIMING = {
  lastMealTime: '7:42 pm',
  firstMealTime: '8:15 am',
  overnightFast: '12h 33m',
  fastRating: 'Solid',
  fastTip: 'A 12.5h fast supports overnight metabolic repair. Pulling last meal 30 min earlier would push this into optimal range (13h+).',
};

// ─── Labels ───────────────────────────────────────────────────────────────────

const STRESS_LABELS: Record<number, string> = {
  1: 'Calm', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Overwhelmed',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceBadge({ label, auto }: { label: string; auto: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      fontFamily: 'Inter, sans-serif',
      background: 'rgba(20,184,166,0.1)',
      color: auto ? '#14B8A6' : '#5EEAD4',
      border: '1px solid rgba(20,184,166,0.2)',
    }}>
      {auto && <Zap size={9} />}
      {label}
    </span>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px 14px', borderRadius: 10,
      background: 'var(--color-bg-base)',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{sub}</div>}
    </div>
  );
}

// ─── 3D Hand point cloud ──────────────────────────────────────────────────────

function HandCloud({ onReady }: { onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
    // Side view — looking at the palm from the side
    camera.position.set(2.8, -1, 0.6);
    camera.lookAt(0, -0.6, 0);

    const controls = new OrbitControls(camera, canvas);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;

    const material = makePointMaterial(2.0, 0.55);
    const loader = new GLTFLoader();
    let disposed = false;

    glbToPointCloud(loader, '/models/hand.glb', 7000, material).then(points => {
      if (disposed || !points) return;

      // Bake centering transform into geometry buffer so rotation works
      const geo = points.geometry;
      const bake = new THREE.Matrix4();
      bake.compose(points.position.clone(), new THREE.Quaternion(), points.scale.clone());
      geo.applyMatrix4(bake);
      points.position.set(0, 0, 0);
      points.scale.setScalar(1);

      // Rotate 90° to the left (around the view axis)
      geo.rotateY(-Math.PI / 2);
      geo.rotateY(-Math.PI);
      geo.rotateX(Math.PI / 16);
      geo.rotateZ(Math.PI / 6);
      geo.rotateY(-Math.PI / 24);
      geo.rotateZ(-Math.PI / 24);

      points.scale.setScalar(1.5);

      scene.add(points);
      onReady();
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
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 0,
    }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}

// ─── Hub components ───────────────────────────────────────────────────────────

function formatHubDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function HubCenter({ mounted, date, onClick }: { mounted: boolean; date: Date; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${mounted ? 1 : 0.3})`,
        opacity: mounted ? 1 : 0,
        transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease',
        width: 110, height: 110, borderRadius: '50%',
        background: 'var(--color-bg-surface)',
        border: `2px solid ${hovered ? 'rgba(20,184,166,0.8)' : 'rgba(20,184,166,0.45)'}`,
        animation: 'hubPulse 2.8s ease-in-out infinite',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5, textAlign: 'center', padding: '0 8px' }}>
        {formatHubDate(date)}
      </div>
      <Calendar size={13} color="#14B8A6" style={{ marginTop: 4 }} />
    </div>
  );
}

// ─── Calendar popup ───────────────────────────────────────────────────────────

function CalendarPopup({ selectedDate, onSelect, onClose }: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next > today) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const isFuture = (day: number) => new Date(viewYear, viewMonth, day) > today;
  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const nextDisabled = new Date(viewYear, viewMonth + 1, 1) > today;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#131315',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px 24px',
          width: 300,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} disabled={nextDisabled} style={{ ...navBtnStyle, opacity: nextDisabled ? 0.3 : 1 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const future = isFuture(day);
            const selected = isSelected(day);
            const todayCell = isToday(day);
            return (
              <button
                key={idx}
                disabled={future}
                onClick={() => {
                  onSelect(new Date(viewYear, viewMonth, day));
                  onClose();
                }}
                style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: 8,
                  border: todayCell && !selected ? '1px solid rgba(20,184,166,0.4)' : '1px solid transparent',
                  background: selected ? 'rgba(20,184,166,0.2)' : 'transparent',
                  color: future ? 'var(--color-text-tertiary)'
                    : selected ? '#14B8A6'
                    : todayCell ? '#14B8A6'
                    : 'var(--color-text-primary)',
                  fontSize: 13, fontWeight: selected ? 700 : 400,
                  cursor: future ? 'default' : 'pointer',
                  opacity: future ? 0.3 : 1,
                  fontFamily: 'inherit',
                  transition: 'background 150ms ease',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Past log indicator note */}
        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.12)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          Select a past date to view or edit that day's log.
        </div>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--color-text-secondary)', fontSize: 20, lineHeight: 1,
  padding: '2px 8px', borderRadius: 6,
  fontFamily: 'inherit',
};

// ─── Arc geometry helpers ─────────────────────────────────────────────────────

const toRad = (deg: number) => deg * Math.PI / 180;

function arcPt(cx: number, cy: number, r: number, deg: number) {
  return { x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) };
}

function annularArc(cx: number, cy: number, r1: number, r2: number, startDeg: number, endDeg: number): string {
  const s1 = arcPt(cx, cy, r1, startDeg), e1 = arcPt(cx, cy, r1, endDeg);
  const s2 = arcPt(cx, cy, r2, startDeg), e2 = arcPt(cx, cy, r2, endDeg);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return [
    `M ${f(s1.x)} ${f(s1.y)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${f(e1.x)} ${f(e1.y)}`,
    `L ${f(e2.x)} ${f(e2.y)}`,
    `A ${r2} ${r2} 0 ${large} 0 ${f(s2.x)} ${f(s2.y)}`,
    'Z',
  ].join(' ');
}

// Arc layout constants
const CX = 350, CY = 275;
const R1 = 110, R2 = 245;       // inner / outer arc radii (thicker band)
const R_MID = (R1 + R2) / 2;   // 177.5 — label placement radius
const HUB_R = 55;               // hub circle radius (spoke starts here)
const GAP = 14;                 // degrees of gap between arcs

// Three arcs tiling a full 360° circle, each 120° (minus gap).
// Boundaries at 210°, 330°, 90° — gaps centered on each boundary.
// Arc midpoints: Fitness=270°, Recovery=30°(=390°), Nutrition=150°
const ARC_DEFS = [
  { label: 'Fitness',   category: 'fitness'   as ModalCategory, angle: 270, startDeg: 210 + GAP / 2, endDeg: 330 - GAP / 2, Icon: Activity,  autoCount: 2, total: 2 },
  { label: 'Nutrition', category: 'nutrition'  as ModalCategory, angle: 150, startDeg: 90 + GAP / 2,  endDeg: 210 - GAP / 2, Icon: Salad,     autoCount: 3, total: 3 },
  { label: 'Recovery',  category: 'recovery'   as ModalCategory, angle: 30,  startDeg: 330 + GAP / 2, endDeg: 450 - GAP / 2, Icon: BedDouble, autoCount: 1, total: 2 },
];

// ─── Hub SVG (arcs + spokes) ──────────────────────────────────────────────────

function HubSVG({ mounted, onNodeClick, progressMap }: {
  mounted: boolean;
  onNodeClick: (cat: ModalCategory) => void;
  progressMap: Record<string, number>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      viewBox="0 0 700 550"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {ARC_DEFS.map(({ category, angle }) => {
          const sp = arcPt(CX, CY, HUB_R, angle);
          const ep = arcPt(CX, CY, R1, angle);
          return (
            <linearGradient
              key={category}
              id={`spokeGrad_${category}`}
              x1={sp.x} y1={sp.y} x2={ep.x} y2={ep.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(20,184,166,0.9)" />
              <stop offset="100%" stopColor="rgba(20,184,166,0.35)" />
            </linearGradient>
          );
        })}
      </defs>

      {/* Spoke lines: hub edge → arc inner edge */}
      {ARC_DEFS.map(({ category, angle }, i) => {
        const sp = arcPt(CX, CY, HUB_R, angle);
        const ep = arcPt(CX, CY, R1, angle);
        const len = Math.sqrt((ep.x - sp.x) ** 2 + (ep.y - sp.y) ** 2);
        return (
          <line
            key={category}
            x1={sp.x} y1={sp.y} x2={ep.x} y2={ep.y}
            stroke={`url(#spokeGrad_${category})`}
            strokeWidth={2} strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={mounted ? 0 : len}
            style={{ transition: `stroke-dashoffset 600ms ease-out ${400 + i * 100}ms` }}
          />
        );
      })}

      {/* Arc segments */}
      {ARC_DEFS.map(({ category, startDeg, endDeg }, i) => {
        const isHov = hovered === category;
        const path = annularArc(CX, CY, R1, R2, startDeg, endDeg);
        return (
          <path
            key={category}
            d={path}
            fill={isHov ? 'rgba(20,184,166,0.14)' : '#131315'}
            stroke={isHov ? 'rgba(20,184,166,0.6)' : 'rgba(20,184,166,0.28)'}
            strokeWidth={1.5}
            style={{
              cursor: 'pointer',
              pointerEvents: 'all',
              opacity: mounted ? 1 : 0,
              transition: `opacity 600ms ease ${150 + i * 150}ms, fill 150ms ease, stroke 150ms ease`,
            }}
            onMouseEnter={() => setHovered(category)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNodeClick(category)}
          />
        );
      })}
    </svg>
  );
}

// ─── Arc content overlays (icons + labels, positioned at arc centres) ─────────

function ArcLabels({ mounted, onNodeClick, progressMap }: {
  mounted: boolean;
  onNodeClick: (cat: ModalCategory) => void;
  progressMap: Record<string, number>;
}) {
  return (
    <>
      {ARC_DEFS.map(({ label, category, angle, Icon, autoCount, total }, i) => {
        const x = CX + R_MID * Math.cos(toRad(angle));
        const y = CY + R_MID * Math.sin(toRad(angle));
        const progress = progressMap[category] ?? 0;
        return (
          <div
            key={category}
            onClick={() => onNodeClick(category)}
            style={{
              position: 'absolute',
              left: x, top: y,
              transform: `translate(-50%, -50%) scale(${mounted ? 1 : 0.4})`,
              opacity: mounted ? 1 : 0,
              transition: `transform 600ms cubic-bezier(0.34,1.56,0.64,1) ${200 + i * 150}ms, opacity 600ms ease ${200 + i * 150}ms`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              textAlign: 'center', width: 110,
              zIndex: 3, cursor: 'pointer',
              pointerEvents: 'all',
            }}
          >
            <Icon size={20} color="#14B8A6" strokeWidth={1.5} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{progress}/{total} logged</div>
            {/* <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{autoCount} auto-synced</div> */}
          </div>
        );
      })}
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface CategoryModalProps {
  category: ModalCategory;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  progress: number;
  total: number;
}

function CategoryModal({ category, onClose, children, title, progress, total }: CategoryModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (category) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [category]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  if (!category) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background 300ms ease, backdrop-filter 300ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: '80vh',
          overflowY: 'auto',
          background: '#131315',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 8,
              color: 'var(--color-text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${(progress / total) * 100}%`,
              background: '#14B8A6',
              transition: 'width 300ms ease',
            }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
            {progress}/{total} logged
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Modal section label ──────────────────────────────────────────────────────

function ModalSection({ title, badge, children }: { title: string; badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ── Toggle: set to true to show the 3D hand model, false to hide it ──────────
const ENABLE_HAND_MODEL = false;

export default function DailyLog({ onNavigateToProjections }: DailyLogProps) {
  // Form state
  const [stress, setStress] = useState<StressLevel>(null);
  const [meal, setMeal] = useState<MealCategory>(null);
  const [alcohol, setAlcohol] = useState<number | null>(null);
  const [walked, setWalked] = useState<boolean | null>(null);
  const [walkMinutes, setWalkMinutes] = useState(10);
  const [missedExercise, setMissedExercise] = useState<MissedExercise>(null);
  const [hydration, setHydration] = useState<HydrationLevel>(null);
  const [supplementFlag, setSupplementFlag] = useState<boolean | null>(null);
  const [supplementNote, setSupplementNote] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Hub state
  const [activeModal, setActiveModal] = useState<ModalCategory>(null);
  const [mounted, setMounted] = useState(false);
  const [modelReady, setModelReady] = useState(!ENABLE_HAND_MODEL);
  const [selectedDate, setSelectedDate] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Progress per category
  const fitnessFields = [walked, missedExercise];
  const nutritionFields = [meal, alcohol, hydration];
  const recoveryFields = [stress, supplementFlag];

  const fitnessProgress = fitnessFields.filter(f => f !== null).length;
  const nutritionProgress = nutritionFields.filter(f => f !== null).length;
  const recoveryProgress = recoveryFields.filter(f => f !== null).length;

  const totalFilled = fitnessProgress + nutritionProgress + recoveryProgress;
  const totalManual = 7;

  const handleSubmit = () => setSubmitted(true);

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Daily Log
        </h1>
        <Card style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <CheckCircle size={48} color="#14B8A6" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Day logged.
            </div>
            {walked && (
              <div style={{ fontSize: 14, color: '#14B8A6', marginBottom: 8 }}>
                Post-meal walk added. This is your #1 age-decelerating habit right now.
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Today's impact:{' '}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: walked ? '#14B8A6' : '#F59E0B' }}>
                {walked ? '−0.7' : '+1.1'} days
              </span>
              {' '}on biological age.
            </div>
          </div>

          <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'left' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>Today's data sources</div>
            <div>Auto-ingested: sleep, HRV, activity (Oura) · glucose & TIR (Dexcom)</div>
            <div style={{ marginTop: 4 }}>Manually logged: {totalFilled} of {totalManual} fields</div>
          </div>

          <div style={{ padding: '12px 20px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Aging pace updated: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>1.10×</span> (was 1.12×)
          </div>

          <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Day 4 of 5 logged this week.</span>
              <span style={{ fontSize: 12, color: '#5EEAD4' }}>One more to unlock your weekly insight.</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(d => (
                <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: d <= 4 ? '#14B8A6' : 'rgba(20,184,166,0.2)' }} />
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToProjections}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 20px', borderRadius: 8,
              background: 'var(--color-bg-raised)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Your biggest opportunity today: earlier dinner. Tap to learn why. <ChevronRight size={14} />
          </button>

          <button
            onClick={() => setSubmitted(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Edit log
          </button>
        </Card>
      </div>
    );
  }

  // ── Fitness modal content ───────────────────────────────────────────────────
  const FitnessContent = () => (
    <>
      {/* Exercise — AUTO */}
      <ModalSection title="Exercise" badge={<SourceBadge label="AUTO · Oura" auto />}>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Oura detected: <strong style={{ color: 'var(--color-text-secondary)' }}>{OURA_DATA.detectedActivity}</strong>
          &nbsp;·&nbsp;{OURA_DATA.steps.toLocaleString()} steps · {OURA_DATA.activeCalories} kcal
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <StatTile label="Steps" value={OURA_DATA.steps.toLocaleString()} />
          <StatTile label="Active Cal" value={`${OURA_DATA.activeCalories}`} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 10, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          Anything Oura may have missed?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['none', 'strength', 'yoga', 'other'] as MissedExercise[]).map(e => (
            <button
              key={e!}
              onClick={() => setMissedExercise(e)}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                border: missedExercise === e ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: missedExercise === e ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                color: missedExercise === e ? '#5EEAD4' : 'var(--color-text-secondary)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </ModalSection>

      {/* Post-meal walk — MANUAL */}
      <ModalSection title="Post-meal walk" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.15)', fontSize: 12, color: '#14B8A6' }}>
          #1 ranked age-decelerating habit right now
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[true, false].map(val => (
            <button
              key={String(val)}
              onClick={() => setWalked(val)}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                border: walked === val ? `1.5px solid ${val ? '#14B8A6' : 'rgba(255,255,255,0.1)'}` : '1px solid rgba(255,255,255,0.06)',
                background: walked === val ? (val ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.04)') : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 600,
                color: walked === val ? (val ? '#14B8A6' : 'var(--color-text-secondary)') : 'var(--color-text-tertiary)',
              }}
            >
              {val ? '✓ Yes' : '✗ No'}
            </button>
          ))}
        </div>
        {walked === true && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Duration</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20, 30].map(m => (
                <button
                  key={m}
                  onClick={() => setWalkMinutes(m)}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: walkMinutes === m ? '1.5px solid #14B8A6' : '1px solid rgba(255,255,255,0.06)',
                    background: walkMinutes === m ? 'rgba(20,184,166,0.1)' : 'transparent',
                    color: walkMinutes === m ? '#14B8A6' : 'var(--color-text-tertiary)',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}
      </ModalSection>
    </>
  );

  // ── Nutrition modal content ─────────────────────────────────────────────────
  const NutritionContent = () => (
    <>
      {/* Meal Quality — MANUAL */}
      <ModalSection title="Meal quality" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['whole', 'mixed', 'processed'] as MealCategory[]).map(cat => (
            <button
              key={cat!}
              onClick={() => setMeal(cat)}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: 10,
                border: meal === cat ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: meal === cat ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cat === 'whole' ? 'A' : cat === 'mixed' ? 'B' : 'C'}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: meal === cat ? '#5EEAD4' : 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{cat}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                {cat === 'whole' ? 'Mostly vegetables, legumes, whole grains'
                  : cat === 'mixed' ? 'Mix of whole and processed foods'
                    : 'Mostly processed or fast food'}
              </span>
            </button>
          ))}
        </div>
      </ModalSection>

      {/* Meal Timing — AUTO (Dexcom) */}
      <ModalSection title="Meal timing & overnight fast" badge={<SourceBadge label="AUTO · Dexcom" auto />}>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Detected via glucose inflection points · Dexcom G7 · live
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <StatTile label="Last meal" value={CGM_MEAL_TIMING.lastMealTime} sub="yesterday" />
          <StatTile label="First meal" value={CGM_MEAL_TIMING.firstMealTime} sub="this morning" />
          <StatTile label="Overnight fast" value={CGM_MEAL_TIMING.overnightFast} sub={CGM_MEAL_TIMING.fastRating} />
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)',
          fontSize: 13, color: 'var(--color-text-secondary)',
        }}>
          {CGM_MEAL_TIMING.fastTip}
        </div>
      </ModalSection>

      {/* Glucose — AUTO */}
      <ModalSection title="Glucose" badge={<SourceBadge label="AUTO · Dexcom" auto />}>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Synced from Dexcom G7 · live
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatTile label="Time in Range" value={`${DEXCOM_DATA.timeInRange}%`} sub="70–180 mg/dL" />
          <StatTile label="Peak Today" value={`${DEXCOM_DATA.peakGlucose} mg/dL`} />
          <StatTile label="Variability" value={DEXCOM_DATA.variabilityScore} sub="low = better" />
        </div>
      </ModalSection>

      {/* Alcohol — MANUAL */}
      <ModalSection title="Alcohol" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setAlcohol(n)}
              style={{
                flex: 1, padding: '14px 8px', borderRadius: 10, textAlign: 'center',
                border: alcohol === n ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: alcohol === n ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 18, fontWeight: 600,
                color: alcohol === n ? '#5EEAD4' : 'var(--color-text-secondary)',
              }}
            >
              {n === 3 ? '3+' : n}
            </button>
          ))}
        </div>
      </ModalSection>

      {/* Hydration — MANUAL */}
      <ModalSection title="Hydration" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['low', 'ok', 'good'] as HydrationLevel[]).map((h, i) => (
            <button
              key={h!}
              onClick={() => setHydration(h)}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                border: hydration === h ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: hydration === h ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>{i + 1}x</span>
              <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', color: hydration === h ? '#5EEAD4' : 'var(--color-text-secondary)' }}>{h}</span>
            </button>
          ))}
        </div>
      </ModalSection>
    </>
  );

  // ── Recovery modal content ──────────────────────────────────────────────────
  const RecoveryContent = () => (
    <>
      {/* Sleep — AUTO */}
      <ModalSection title="Sleep" badge={<SourceBadge label="AUTO · Oura" auto />}>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Synced from Oura Ring Gen 3 · 2 hours ago
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatTile label="Total Sleep" value={OURA_DATA.totalSleep} />
          <StatTile label="Efficiency" value={`${OURA_DATA.efficiency}%`} />
          <StatTile label="HRV" value={`${OURA_DATA.hrv} ms`} sub="avg overnight" />
          <StatTile label="Resting HR" value={`${OURA_DATA.restingHR} bpm`} />
        </div>
      </ModalSection>

      {/* Stress — MANUAL */}
      <ModalSection title="Stress / Mood" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ display: 'flex', gap: 8 }}>
          {([1, 2, 3, 4, 5] as StressLevel[]).map(n => (
            <button
              key={n!}
              onClick={() => setStress(n)}
              style={{
                flex: 1, padding: '12px 4px', borderRadius: 10, textAlign: 'center',
                border: stress === n ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: stress === n ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: stress === n ? '#5EEAD4' : 'var(--color-text-secondary)' }}>{n}</span>
              <span style={{ fontSize: 10, color: stress === n ? '#5EEAD4' : 'var(--color-text-tertiary)' }}>{STRESS_LABELS[n!]}</span>
            </button>
          ))}
        </div>
      </ModalSection>

      {/* Supplements — MANUAL */}
      <ModalSection title="Supplements / Meds" badge={<SourceBadge label="MANUAL" auto={false} />}>
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Anything unusual today — new supplement, medication, or missed dose?
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: supplementFlag ? 14 : 0 }}>
          {[false, true].map(val => (
            <button
              key={String(val)}
              onClick={() => setSupplementFlag(val)}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, textAlign: 'center',
                border: supplementFlag === val ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: supplementFlag === val ? 'rgba(20,184,166,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 600,
                color: supplementFlag === val ? '#5EEAD4' : 'var(--color-text-tertiary)',
              }}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {supplementFlag && (
          <input
            type="text"
            placeholder="What? (optional)"
            value={supplementNote}
            onChange={e => setSupplementNote(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8,
              background: 'var(--color-bg-base)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-primary)', fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}
      </ModalSection>

      {/* Notes */}
      <ModalSection title="Notes" badge={<SourceBadge label="OPTIONAL" auto={false} />}>
        <input
          type="text"
          placeholder="Travel day, stressed, ate late…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8,
            background: 'var(--color-bg-base)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-primary)', fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </ModalSection>
    </>
  );

  // Modal config
  const modalConfig: Record<string, { title: string; progress: number; total: number; content: React.ReactNode }> = {
    fitness: { title: 'Fitness', progress: fitnessProgress, total: 2, content: <FitnessContent /> },
    nutrition: { title: 'Nutrition', progress: nutritionProgress, total: 3, content: <NutritionContent /> },
    recovery: { title: 'Recovery', progress: recoveryProgress, total: 2, content: <RecoveryContent /> },
  };

  // ── Hub-and-spoke layout ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
      <style>{`
        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(20,184,166,0.15), 0 0 0px rgba(20,184,166,0); }
          50%       { box-shadow: 0 0 32px rgba(20,184,166,0.35), 0 0 60px rgba(20,184,166,0.10); }
        }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* 3D hand — only mounted when enabled */}
      {ENABLE_HAND_MODEL && <HandCloud onReady={() => setModelReady(true)} />}

      {/* Loading screen — only shown when hand model is enabled and loading */}
      {ENABLE_HAND_MODEL && !modelReady && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: '#0A0B0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            letterSpacing: '4px',
            color: 'rgba(20,184,166,0.7)',
            animation: 'loadingPulse 1.4s ease-in-out infinite',
          }}>
            LOADING...
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Daily Log
        </h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, color: '#14B8A6', lineHeight: 1 }}>14</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>day streak</div>
        </div>
      </div>

      {/* Hub container */}
      <div style={{
        position: 'relative',
        width: 700, height: 550,
        margin: '0 auto',
        marginTop: 48,
      }}>
        {/* SVG: spokes + arc segments */}
        <HubSVG
          mounted={mounted}
          onNodeClick={setActiveModal}
          progressMap={{ fitness: fitnessProgress, nutrition: nutritionProgress, recovery: recoveryProgress }}
        />

        {/* Center date circle */}
        <HubCenter mounted={mounted} date={selectedDate} onClick={() => setCalendarOpen(true)} />

        {/* Arc content overlays */}
        <ArcLabels
          mounted={mounted}
          onNodeClick={setActiveModal}
          progressMap={{ fitness: fitnessProgress, nutrition: nutritionProgress, recovery: recoveryProgress }}
        />
      </div>

      {/* Modal */}
      {activeModal && (
        <CategoryModal
          category={activeModal}
          onClose={() => setActiveModal(null)}
          title={modalConfig[activeModal].title}
          progress={modalConfig[activeModal].progress}
          total={modalConfig[activeModal].total}
        >
          {modalConfig[activeModal].content}
        </CategoryModal>
      )}

      {/* Calendar popup */}
      {calendarOpen && (
        <CalendarPopup
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
}
