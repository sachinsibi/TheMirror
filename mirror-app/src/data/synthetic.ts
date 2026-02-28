// Synthetic data for James, 52, 90-day dataset
// All data is fabricated for demo purposes

export const USER = {
  name: 'James',
  chronologicalAge: 52,
  biologicalAge: 57.2,
  lastEpigeneticTest: '2026-01-16',
  dunedinPace: 1.12,
  paceRange: { low: 1.08, high: 1.16 },
};

export const DATA_SOURCES = {
  wearable: {
    connected: true,
    device: 'Oura Ring Gen 3',
    lastSync: '2h ago',
    stale: false,
    hrv: 42,
    sleepEfficiency: 84,
    restingHR: 58,
    data: {
      hrv: Array.from({ length: 90 }, (_, i) => ({
        day: i,
        value: 38 + Math.sin(i * 0.2) * 8 + (Math.random() - 0.5) * 4,
      })),
      sleepStages: { deep: 1.4, rem: 1.8, light: 3.2, awake: 0.4 },
    },
  },
  cgm: {
    connected: true,
    device: 'Dexcom G7',
    lastSync: 'live',
    stale: false,
    currentGlucose: 94,
    variabilityScore: 18,
    data: {
      today: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 85 + Math.sin((i - 7) * 0.5) * 25 + (Math.random() - 0.5) * 8,
      })),
    },
  },
  epigenetic: {
    connected: true,
    provider: 'TruDiagnostic',
    lastTest: '2026-01-16',
    daysAgo: 43,
    daysUntilNext: 47,
    biologicalAge: 57.2,
    dunedinPace: 1.12,
    organAges: {
      metabolic: 60.1,
      cardiovascular: 55.8,
      immune: 58.3,
      hepatic: 54.9,
    },
    history: [
      { date: '2025-07-10', biologicalAge: 58.4, pace: 1.19 },
      { date: '2025-10-14', biologicalAge: 57.8, pace: 1.15 },
      { date: '2026-01-16', biologicalAge: 57.2, pace: 1.12 },
    ],
  },
};

export const ORGAN_SCORES = {
  current: {
    metabolic: { pace: 1.28, color: '#F59E0B' },    // accelerating
    cardiovascular: { pace: 1.08, color: '#D4A96A' }, // mild
    immune: { pace: 1.18, color: '#C9956F' },         // moderate
    hepatic: { pace: 0.97, color: '#14B8A6' },        // decelerating
  },
  postMealWalks: {
    metabolic: { pace: 1.04, color: '#2DD4C0' },
    cardiovascular: { pace: 0.99, color: '#14B8A6' },
    immune: { pace: 1.08, color: '#A8A29E' },
    hepatic: { pace: 0.92, color: '#14B8A6' },
  },
  dietaryChanges: {
    metabolic: { pace: 1.12, color: '#D4A96A' },
    cardiovascular: { pace: 1.03, color: '#A8A29E' },
    immune: { pace: 1.05, color: '#A8A29E' },
    hepatic: { pace: 0.95, color: '#14B8A6' },
  },
  combined: {
    metabolic: { pace: 0.98, color: '#14B8A6' },
    cardiovascular: { pace: 0.96, color: '#14B8A6' },
    immune: { pace: 1.02, color: '#A8A29E' },
    hepatic: { pace: 0.89, color: '#2DD4C0' },
  },
};

export const INTERVENTIONS = [
  {
    id: 'current',
    name: 'Current habits',
    delta: null,
    pace: 1.12,
    paceRange: { low: 1.08, high: 1.16 },
    organScores: ORGAN_SCORES.current,
  },
  {
    id: 'post-meal-walks',
    name: 'Post-meal walks',
    delta: '↓ up to 1.3 yr',
    pace: 1.04,
    paceRange: { low: 1.01, high: 1.07 },
    organScores: ORGAN_SCORES.postMealWalks,
    evidence: {
      grade: 'STRONG RCT',
      study: 'Henson et al. (2023) – Nature Metabolism',
      sampleSize: '1,847 participants',
      population: 'Adults 45–70, pre-diabetic range',
      summary: '10-min post-meal walks reduced postprandial glucose excursions by 28% vs. seated rest, with direct downstream effects on DunedinPACE.',
      ci: '95% CI: 22–34% reduction',
    },
  },
  {
    id: 'dietary-changes',
    name: 'Dietary changes',
    delta: '↓ up to 0.9 yr',
    pace: 1.07,
    paceRange: { low: 1.03, high: 1.11 },
    organScores: ORGAN_SCORES.dietaryChanges,
    evidence: {
      grade: 'MODERATE RCT',
      study: 'Fontana et al. (2022) – Cell Metabolism',
      sampleSize: '624 participants',
      population: 'Adults 40–65, BMI 25–35',
      summary: 'Caloric restriction with Mediterranean diet pattern reduced biological age by 2.3 years over 12 months.',
      ci: '95% CI: 1.1–3.5 year reduction',
    },
  },
];

export const SCOREBOARD_HABITS = [
  {
    id: 'post-meal-walks',
    name: 'Post-meal walking',
    impact: 1.3,
    impactLabel: '↓ up to 1.3 yr',
    evidence: 'STRONG RCT',
    effort: 'Low effort · High impact',
    icon: 'walk',
    interventionId: 'post-meal-walks',
  },
  {
    id: 'sleep-consistency',
    name: 'Sleep consistency',
    impact: 0.9,
    impactLabel: '↓ up to 0.9 yr',
    evidence: 'STRONG RCT',
    effort: 'Medium effort · High impact',
    icon: 'moon',
    interventionId: 'current',
  },
  {
    id: 'dietary-changes',
    name: 'Dietary changes',
    impact: 0.8,
    impactLabel: '↓ up to 0.8 yr',
    evidence: 'MODERATE RCT',
    effort: 'Medium effort · Medium impact',
    icon: 'salad',
    interventionId: 'dietary-changes',
  },
  {
    id: 'zone2-cardio',
    name: 'Zone 2 cardio',
    impact: 0.6,
    impactLabel: '↓ up to 0.6 yr',
    evidence: 'MODERATE RCT',
    effort: 'High effort · Medium impact',
    icon: 'heart',
    interventionId: 'current',
  },
  {
    id: 'time-restricted-eating',
    name: 'Time-restricted eating',
    impact: 0.4,
    impactLabel: '↓ up to 0.4 yr',
    evidence: 'PRELIMINARY',
    effort: 'Low effort · Low impact',
    icon: 'clock',
    interventionId: 'current',
  },
];

export const WEEKLY_TREND = {
  direction: 'improving',
  headline: 'This week vs last: inflammatory load dropped 8%.',
  driver: 'Sleep consistency drove it.',
  sparkline: [1.18, 1.16, 1.15, 1.14, 1.13, 1.13, 1.12, 1.12, 1.11, 1.12,
              1.13, 1.12, 1.11, 1.12, 1.11, 1.10, 1.11, 1.12, 1.11, 1.10,
              1.09, 1.10, 1.11, 1.10, 1.09, 1.10, 1.11, 1.12, 1.11, 1.12],
};
