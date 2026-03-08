// Bridge Engine — client-side projection math
// Converts current pace + intervention deltas into 24-month biological age trajectories

export interface FanChartPoint {
  month: number;
  center: number;
  band50Low: number;
  band50High: number;
  band90Low: number;
  band90High: number;
}

// Temporal uncertainty grows as sqrt of time (biological age projection uncertainty)
function uncertainty(month: number, baseUncertainty = 0.3): number {
  return baseUncertainty * Math.sqrt(month / 12);
}

// Projection lookup table with interpolation
// pace: aging multiplier (1.0 = normal, 1.12 = 12% faster)
// biologicalAge: starting biological age
// returns array of monthly projections
export function projectTrajectory(
  startAge: number,
  pace: number,
  months: number = 24
): FanChartPoint[] {
  const points: FanChartPoint[] = [];

  for (let m = 0; m <= months; m++) {
    const yearsElapsed = m / 12;
    // Biological age accrues at 'pace' rate
    const center = startAge + yearsElapsed * pace;

    // Uncertainty widens over time
    const u50 = uncertainty(m, 0.25);
    const u90 = uncertainty(m, 0.55);

    points.push({
      month: m,
      center,
      band50Low: center - u50,
      band50High: center + u50,
      band90Low: center - u90,
      band90High: center + u90,
    });
  }

  return points;
}

// Generate current path (pace = 1.12x, trending up)
export function getCurrentPath(startAge: number): FanChartPoint[] {
  return projectTrajectory(startAge, 1.12);
}

// Generate intervention path (pace reduced)
export function getInterventionPath(
  startAge: number,
  interventionPace: number
): FanChartPoint[] {
  return projectTrajectory(startAge, interventionPace);
}

// Compute the verdict sentence
export function getVerdictSentence(pace: number): string {
  const pct = Math.round((pace - 1.0) * 100);
  if (pace >= 1.1) {
    return `You're aging ${pct}% faster than your calendar age. Post-meal walks are your best lever.`;
  } else if (pace >= 1.05) {
    return `You're aging ${pct}% faster than your calendar age. Sleep consistency is your next frontier.`;
  } else if (pace >= 1.0) {
    return `You're aging ${pct}% faster than your calendar age. You're nearly at baseline — keep it up.`;
  } else {
    const pctSlower = Math.round((1.0 - pace) * 100);
    return `You're aging ${pctSlower}% slower than your calendar age. Your interventions are working.`;
  }
}

// Map pace to color on amber→neutral→teal spectrum
export function paceToColor(pace: number): string {
  if (pace >= 1.15) return '#F59E0B';  // amber
  if (pace >= 1.1) return '#D4A96A';
  if (pace >= 1.05) return '#C9956F';
  if (pace >= 1.02) return '#B09080';
  if (pace >= 0.98) return '#A8A29E';  // neutral
  if (pace >= 0.95) return '#6DBDB4';
  return '#14B8A6';                    // teal
}

// Needle angle for gauge: pace 0.8 = far right (teal), 1.2 = far left (amber)
// Arc spans -90° (left/amber) to +90° (right/teal), center = 0° = 1.0x
export function paceToAngle(pace: number): number {
  const minPace = 0.8;
  const maxPace = 1.3;
  const t = Math.max(0, Math.min(1, (pace - minPace) / (maxPace - minPace)));
  // Left (amber, high pace) = -90°, Right (teal, low pace) = +90°
  return 180 - t * 180; // maps 0→180°, 1→0°  (amber=180°, teal=0°)
}
