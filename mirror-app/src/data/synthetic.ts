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
      neurological: 56.4,
      cardiovascular: 55.8,
      metabolic: 60.1,
      endocrine: 57.0,
      immune: 58.3,
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
    neurological:   { pace: 1.14, color: '#D4A96A' },  // moderate — poor deep sleep
    cardiovascular: { pace: 1.08, color: '#D4A96A' },   // mild
    metabolic:      { pace: 1.28, color: '#F59E0B' },   // accelerating
    endocrine:      { pace: 1.10, color: '#D4A96A' },   // moderate — circadian disruption
    immune:         { pace: 1.18, color: '#C9956F' },   // moderate
  },
  postMealWalks: {
    neurological:   { pace: 1.10, color: '#D4A96A' },
    cardiovascular: { pace: 0.99, color: '#14B8A6' },
    metabolic:      { pace: 1.04, color: '#2DD4C0' },
    endocrine:      { pace: 1.02, color: '#A8A29E' },
    immune:         { pace: 1.08, color: '#A8A29E' },
  },
  dietaryChanges: {
    neurological:   { pace: 1.10, color: '#D4A96A' },
    cardiovascular: { pace: 1.03, color: '#A8A29E' },
    metabolic:      { pace: 1.12, color: '#D4A96A' },
    endocrine:      { pace: 1.04, color: '#A8A29E' },
    immune:         { pace: 1.05, color: '#A8A29E' },
  },
  sleepConsistency: {
    neurological:   { pace: 0.98, color: '#14B8A6' },  // biggest beneficiary — sleep architecture
    cardiovascular: { pace: 1.03, color: '#A8A29E' },
    metabolic:      { pace: 1.16, color: '#D4A96A' },
    endocrine:      { pace: 1.01, color: '#A8A29E' },   // circadian rhythm improves
    immune:         { pace: 1.06, color: '#A8A29E' },
  },
  zone2Cardio: {
    neurological:   { pace: 1.08, color: '#D4A96A' },
    cardiovascular: { pace: 0.97, color: '#14B8A6' },
    metabolic:      { pace: 1.10, color: '#D4A96A' },
    endocrine:      { pace: 1.06, color: '#A8A29E' },
    immune:         { pace: 1.06, color: '#A8A29E' },
  },
  timeRestrictedEating: {
    neurological:   { pace: 1.11, color: '#D4A96A' },
    cardiovascular: { pace: 1.06, color: '#A8A29E' },
    metabolic:      { pace: 1.14, color: '#D4A96A' },
    endocrine:      { pace: 1.03, color: '#A8A29E' },   // meal timing → hormonal rhythm
    immune:         { pace: 1.11, color: '#D4A96A' },
  },
  combined: {
    neurological:   { pace: 0.94, color: '#14B8A6' },
    cardiovascular: { pace: 0.96, color: '#14B8A6' },
    metabolic:      { pace: 0.98, color: '#14B8A6' },
    endocrine:      { pace: 0.95, color: '#14B8A6' },
    immune:         { pace: 1.02, color: '#A8A29E' },
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
    chartPace: 0.47, // produces -1.3yr at 24mo: (59.44-1.3-57.2)/2
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
    chartPace: 0.67, // produces -0.9yr at 24mo
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
  {
    id: 'sleep-consistency',
    name: 'Sleep consistency',
    delta: '↓ up to 0.9 yr',
    pace: 1.06,
    chartPace: 0.67, // produces -0.9yr at 24mo
    paceRange: { low: 1.03, high: 1.09 },
    organScores: ORGAN_SCORES.sleepConsistency,
    evidence: {
      grade: 'STRONG RCT',
      study: 'Carroll et al. (2023) – Nature Aging',
      sampleSize: '1,204 participants',
      population: 'Adults 40–65 with variable sleep schedules',
      summary: 'Regularising sleep to a consistent 7–8h window reduced DunedinPACE by 0.05 points and inflammatory markers by 22%.',
      ci: '95% CI: 0.03–0.07 pace reduction',
    },
  },
  {
    id: 'zone2-cardio',
    name: 'Zone 2 cardio',
    delta: '↓ up to 0.6 yr',
    pace: 1.07,
    chartPace: 0.82, // produces -0.6yr at 24mo
    paceRange: { low: 1.03, high: 1.10 },
    organScores: ORGAN_SCORES.zone2Cardio,
    evidence: {
      grade: 'MODERATE RCT',
      study: 'Lavie et al. (2022) – JAMA Cardiology',
      sampleSize: '892 participants',
      population: 'Adults 45–70, sedentary baseline',
      summary: '150 min/week of low-intensity aerobic exercise reduced cardiovascular biological age by 1.2 years and lowered resting DunedinPACE.',
      ci: '95% CI: 0.6–1.8 year cardiovascular age reduction',
    },
  },
  {
    id: 'time-restricted-eating',
    name: 'Time-restricted eating',
    delta: '↓ up to 0.4 yr',
    pace: 1.09,
    chartPace: 0.92, // produces -0.4yr at 24mo
    paceRange: { low: 1.06, high: 1.12 },
    organScores: ORGAN_SCORES.timeRestrictedEating,
    evidence: {
      grade: 'PRELIMINARY',
      study: 'Sutton et al. (2023) – Cell',
      sampleSize: '411 participants',
      population: 'Adults 40–60, metabolic syndrome',
      summary: 'Eating within an 8-hour window improved insulin sensitivity and showed preliminary effects on epigenetic aging rate at 90 days.',
      ci: '95% CI: 0.1–0.6 yr reduction (preliminary)',
    },
  },
  {
    id: 'strength-training',
    name: 'Strength training',
    delta: '↓ up to 0.5 yr',
    pace: 1.08,
    chartPace: 0.87,
    paceRange: { low: 1.04, high: 1.11 },
    organScores: ORGAN_SCORES.zone2Cardio,
    evidence: {
      grade: 'MODERATE RCT',
      study: 'Peterson et al. (2023) – Aging Cell',
      sampleSize: '703 participants',
      population: 'Adults 45–70, sedentary to moderately active',
      summary: 'Twice-weekly resistance training over 12 months reduced epigenetic age acceleration and improved muscle-metabolic coupling.',
      ci: '95% CI: 0.2–0.8 yr reduction',
    },
  },
  {
    id: 'stress-reduction',
    name: 'Stress reduction',
    delta: '↓ up to 0.3 yr',
    pace: 1.10,
    chartPace: 0.94,
    paceRange: { low: 1.07, high: 1.13 },
    organScores: ORGAN_SCORES.sleepConsistency,
    evidence: {
      grade: 'PRELIMINARY',
      study: 'Epel et al. (2022) – PNAS',
      sampleSize: '290 participants',
      population: 'Adults 40–65 with elevated perceived stress',
      summary: 'Mindfulness-based stress reduction over 8 weeks lowered cortisol reactivity and showed early signals of reduced DunedinPACE.',
      ci: '95% CI: 0.05–0.15 pace reduction (preliminary)',
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
    interventionId: 'sleep-consistency',
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
    interventionId: 'zone2-cardio',
  },
  {
    id: 'time-restricted-eating',
    name: 'Time-restricted eating',
    impact: 0.4,
    impactLabel: '↓ up to 0.4 yr',
    evidence: 'PRELIMINARY',
    effort: 'Low effort · Low impact',
    icon: 'clock',
    interventionId: 'time-restricted-eating',
  },
  {
    id: 'strength-training',
    name: 'Strength training',
    impact: 0.5,
    impactLabel: '↓ up to 0.5 yr',
    evidence: 'MODERATE RCT',
    effort: 'High effort · Medium impact',
    icon: 'heart',
    interventionId: 'strength-training',
  },
  {
    id: 'stress-reduction',
    name: 'Stress reduction',
    impact: 0.3,
    impactLabel: '↓ up to 0.3 yr',
    evidence: 'PRELIMINARY',
    effort: 'Medium effort · Low impact',
    icon: 'heart',
    interventionId: 'stress-reduction',
  },
];

export const WEEKLY_TREND = {
  direction: 'improving',
  headline: 'Inflammatory load dropped 8%.',
  driver: 'Sleep consistency drove it.',
  summary: 'Overall, this was a positive week. Your recovery metrics improved meaningfully and your glucose control held steady on most days. The main drag was late-night eating on three evenings, which elevated overnight glucose and partially offset your sleep gains. If you can push dinner earlier by 90 minutes, next week could show a further reduction in your aging pace.',
  sparkline: [1.18, 1.16, 1.15, 1.14, 1.13, 1.13, 1.12, 1.12, 1.11, 1.12,
              1.13, 1.12, 1.11, 1.12, 1.11, 1.10, 1.11, 1.12, 1.11, 1.10,
              1.09, 1.10, 1.11, 1.10, 1.09, 1.10, 1.11, 1.12, 1.11, 1.12],
  positives: [
    'Sleep held to 7–8h on 5 of 7 nights — most consistent stretch in 30 days.',
    'HRV up to 44ms from 39ms last week — strongest recovery signal this month.',
    'Glucose stayed under 130mg/dL post-meal on 4 days.',
    'Resting HR held at 58–59bpm for the first 5 days.',
  ],
  concerns: [
    'Late dinners (past 9pm) on 3 nights elevated overnight glucose by ~12mg/dL.',
    'Active minutes down 18% — no walks logged Tuesday or Wednesday.',
    'Resting HR rose to 61bpm Friday–Saturday, likely stress or meal-timing related.',
  ],
};
