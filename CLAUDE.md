# CLAUDE.md — Metabolic Mirror
## Project Reference · Advance Health Hackathon 2026

---

## What This Is

Metabolic Mirror is a health intelligence app that connects daily metabolic data to long-term biological aging. It answers the question no other product answers: **"Is what I did today making me age faster or slower?"**

It bridges three data sources into one continuous narrative:
- **Wearables** (HRV, sleep) — biophysical signal
- **CGM** (continuous glucose) — metabolic signal
- **Epigenetic reports** (biological age, organ ages, DunedinPACE) — ground truth checkpoint

The app has **four screens**. Nothing else exists.

---

## Design Philosophy

**Platform:** Desktop webapp. Single viewport optimized for laptop/monitor (1280–1440px). No mobile, no responsive breakpoints, no bottom nav. One screen size, maximum polish.

**Aesthetic:** WHOOP meets Notion meets a Bloomberg terminal. Dark, information-rich, restrained. Clinical credibility delivered with the restraint of luxury.

**Core Rules:**
- No red anywhere for any biological metric. Amber is the furthest warning state.
- Never alarm. Always orient. Every screen should leave the user feeling *more capable*, not more anxious.
- Synthesis first, complexity on demand. The default is a verdict, not a visualization.
- Every number that is a projection shows a range, never a point estimate.
- Evidence grade is always visible on any claim.

**Color Palette:**
- Backgrounds: `#0A0B0F` (base) → `#12131A` (surface) → `#1A1B25` (raised)
- Metric spectrum: `#F59E0B` (amber, accelerating) → `#A8A29E` (neutral) → `#14B8A6` (teal, decelerating)
- Accent: `#8B5CF6` (violet — CTAs, active states)
- Text: `#F1F5F9` (primary) / `#94A3B8` (secondary) / `#475569` (tertiary)

**Typography:**
- Primary: `Inter` (variable, 300–700)
- Monospace for live values: `JetBrains Mono`
- All ring/gauge numbers use `font-variant-numeric: tabular-nums` — values never shift layout on update

**Motion Principles:**
- Every animation earns its place by communicating something. No decoration.
- Key timings: 150ms (hover), 400ms (scenario toggle), 800ms (chart draw, body map entrance)
- Spring easing on gauge fills: `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot communicates arrival
- All animations respect `prefers-reduced-motion`

---

## Global Layout

**Shell:** Fixed left sidebar + scrollable main content area. No header bar. The sidebar is the only navigation.

**Left Sidebar (persistent, all screens)**
- Width: 240px
- Background: `--color-bg-surface` (`#12131A`)
- Right border: 1px solid `#1A1B25`
- Four nav items stacked vertically: Dashboard, Scoreboard, Sandbox, Profile
- Each item: 48px height, 20px horizontal padding
- Active state: `--color-bg-raised` fill + 3px violet left border + `--color-text-primary` label
- Inactive: transparent fill + `--color-text-tertiary` label
- Hover: `--color-bg-raised` fill, 150ms ease
- Icons: Phosphor or Lucide, 24px, left of label
- App logo/name at top of sidebar: "Metabolic Mirror" in `text-label-lg`, `--color-text-tertiary`

**Main Content Area**
- Fills remaining width (1040–1200px depending on viewport)
- Background: `--color-bg-base` (`#0A0B0F`)
- Padding: 48px vertical, 64px horizontal
- Max content width: 1040px, centered within the area
- All screens render here. Sidebar stays fixed while content scrolls if needed.

---

## Screen 1: Dashboard

**Job:** Orient. "How fast am I aging right now?"

This is the first thing the user sees. It must deliver a verdict in under 2 seconds of looking.

### Layout (desktop, 3-column grid)

The main content area (right of sidebar) uses a 12-column grid, 32px gutters, max content width 1040px, centered.

**Center column (cols 4–9) — the hero zone**

**1. Pace Gauge — the hero element**

A half-arc SVG gauge, centered in the column, dominant. This is the single most important visual in the app.

- The arc spans from amber (left, accelerating) through neutral gray (center, 1.0x) to teal (right, decelerating)
- A needle points to the user's current pace of aging (e.g. 1.12x)
- The needle has a soft glow matching its position color — amber glow if accelerating, teal glow if decelerating
- The arc fills with a conic gradient that brightens toward the needle position
- Below the arc, the pace number in large monospace: **1.12×**
- Below the number, uncertainty range in secondary text: `estimated range: 1.08×–1.16×`
- The needle animates on load using spring easing (800ms) — it overshoots slightly then settles, giving the number physical weight
- The arc itself draws left-to-right on mount (800ms, ease-out-expo)

**2. Verdict Sentence**

One line of plain English directly below the gauge. `text-body-lg`, `--color-text-secondary`, left-aligned.

> "You're aging 12% faster than your calendar age. Post-meal walks are your best lever."

This sentence is auto-generated from bridge engine outputs. Structure: [what's happening] + [what you can do]. Never stops at the problem.

**3. Data Source Indicators**

A horizontal row of three compact pills below the verdict:

| Pill | Content | Visual |
|:-----|:--------|:-------|
| Wearable | "Oura · synced 2h ago" | Teal dot = connected, amber dot = stale (>24h), gray dot = not connected |
| CGM | "Dexcom · live" | Same dot convention |
| Epigenetic | "TruDiagnostic · 43 days ago" | Same dot convention, plus a subtle progress ring showing days until next recommended test |

These pills serve two purposes: (a) show the user what's feeding the system, (b) build trust by being transparent about data freshness. Each pill is clickable → navigates to Profile with that source expanded.

### Visual Character

The Dashboard is *quiet*. Dark background, one dominant gauge, one sentence, three small pills. Generous negative space. The gauge is the only element with color saturation — everything else recedes. This makes the pace number impossible to ignore.

The gauge's glow effect (a soft radial gradient behind the needle, 12% opacity of the position color) gives it a subtle "living" quality — the number feels warm and present, not clinical.

---

## Screen 2: Intervention Scoreboard

**Job:** Understand. "What's causing this and what can I actually change?"

### Layout (single column, max-width 720px within content area)

**1. Weekly Trend Card (pinned top)**

A single card, full-width, `--color-bg-surface` background, `--radius-md`.

Content: direction + one concrete win + driver — three lines maximum.

> "This week vs last: inflammatory load dropped 8%. Sleep consistency drove it."

If it was a bad week, reframe: "Inflammatory load climbed 6%. Earlier dinners this week could reverse it."

A small sparkline (32px tall, no axes, no labels) sits to the right of the text showing the 30-day trend direction. Arrow indicator at the right end: ↓ teal (improving) / ↑ amber (worsening) / → gray (stable).

**2. #1 Opportunity Card (visually elevated)**

Teal left border accent (3px). Slightly larger than other cards. Contains:
- Habit name: "Post-meal walking"
- Projected impact as a range: "↓ up to 1.3 years biological age"
- Evidence badge: `STRONG RCT` in teal
- Effort indicator: "Low effort · High impact" — simple text tag
- Clicking → navigates to Sandbox with this intervention preloaded

**3. Ranked Habit List**

Below the #1 card, a stack of list rows. Each row:
- 56px height, `--color-bg-surface`, `--radius-md`
- Left: 32×32px circle icon container (`--color-bg-raised` fill)
- Center: habit name + impact bar (6px tall, teal or amber fill, animated width on mount at 400ms ease-out-expo)
- Right: evidence badge + chevron
- Each row clicks → Sandbox with that intervention preloaded

The impact bars are normalized: highest-impact habit = 100% width. This makes relative comparison instant.

**4. Evidence Badges**

Inline with each habit. Small pill: 22px height, 11px uppercase text, letter-spacing 0.1em.

| Grade | Background | Text |
|:------|:-----------|:-----|
| STRONG RCT | `#14B8A620` | `#14B8A6` |
| MODERATE RCT | `#F59E0B20` | `#F59E0B` |
| PRELIMINARY | `#94A3B820` | `#94A3B8` |

### Visual Character

This screen is denser than the Dashboard but still restrained. The #1 Opportunity card is the visual anchor — teal accent makes it pop against the dark surface. The ranked list below is calm and scannable. No charts, no graphs — just a ranked list of actions with clear impact indicators. The user should be able to scan the whole screen in 5 seconds and know their top 3 moves.

---

## Screen 3: Longevity Sandbox

**Job:** Decide. "What are my two futures?"

This is the most important screen in the app. This is where the pitch is won or lost.

### Layout (two-column within content area: chart left, body map + gauge right)

**1. Anchor Line**

Persistent at top, spanning full width: "James, 52 · Biological age: ~57 · Aging 1.12×"
Small, secondary text, left-aligned. Grounds everything below in a person, not a dataset.

**2. Three Intervention Cards (horizontal row)**

Card format, not buttons. Each card:
- `--color-bg-surface`, `--radius-md`, ~160px wide
- Intervention name (e.g. "Post-meal walks")
- Projected delta teaser: "↓ up to 1.3 yr"
- Selected state: violet border + violet background at 8% opacity
- Default: "Current habits" card is pre-selected. The chart is never empty on load.

**Left column (60% width) — analytical view:**

**3. Diverging Fan Chart — the centerpiece**

Full-width SVG area chart. This is the single most important visualization in the product.

**X-axis:** Months 0–24. Tick marks at 3, 6, 12, 24. Labels in `--text-label-sm`, `--color-text-tertiary`.
**Y-axis:** Biological Age. Horizontal grid lines only, 1px, `#1A1B25`.

**Current path (always visible):**
- Center line: 2px stroke, `#F59E0B` (amber)
- 50% confidence band: `#F59E0B` at 20% opacity
- 90% confidence band: `#F59E0B` at 8% opacity
- Trends upward — biological age climbing

**Intervention path (appears on card selection):**
- Center line: 2px stroke, `#14B8A6` (teal)
- 50% confidence band: `#14B8A6` at 20% opacity
- 90% confidence band: `#14B8A6` at 8% opacity
- Trends downward — biological age dropping

**Checkpoint line:** 1px dashed, `#2A2D40`, vertical at month 6. Label: "Next test" in 11px, `#475569`.

**Outcome callouts:** Floating labels at the end of each center line showing the projected range. Never a point estimate. Always "54.5–55.1" format.

**Animation:**
- On mount: current path draws left-to-right, 800ms, ease-out-expo
- On intervention card click: teal path draws in with 150ms stagger after amber (amber first, then intervention — the divergence is the narrative, the stagger makes it legible)
- On scenario toggle: 400ms crossfade between path fills
- Confidence bands widen visibly over time — 90% band at month 6 is ~3× the width at month 0

The emotional power is in the **divergence**. Two futures, from one decision, visible in a single glance. The gap between the amber line and the teal line is the entire value proposition rendered spatially.

**Right column (40% width) — visceral view:**

**4. Body Map Morph (below the chart)**

The stylized SVG body silhouette (400×600px) with 4 organ zones: metabolic (abdomen), cardiovascular (chest), immune (full body overlay), hepatic (right upper).

**Default state:** Zones are color-coded to current organ aging rates using the amber→teal spectrum at 30% opacity. Each zone breathes — opacity cycles 30%→45%→30% over 3s, each zone offset by 0.8s for an organic, non-synchronized feel.

**On intervention toggle:** Zones animate from current colors to projected colors. The transition takes 800ms with ease-out-expo. Zones that improve most shift the most dramatically (e.g. metabolic zone cooling from deep amber to teal). The breathing animation slows down slightly for zones that are decelerating — a subtle cue that the "engine" is cooling.

This is the visceral companion to the analytical fan chart above. The chart tells you the numbers. The body map makes you *feel* it.

**5. Pace Gauge (mini version)**

A smaller version of the Dashboard's pace gauge, positioned beside or below the body map.

- On intervention toggle: the needle animates from current pace to projected pace using spring easing (600ms)
- Shows the same number in monospace below: "1.12× → 1.02×" with a small teal arrow between them
- This echoes the Dashboard gauge in a satisfying way — the user sees the same instrument responding to their choices

**6. Evidence Card (expandable)**

Below the body map. Collapsed by default — one line showing the primary source study. Clickable to expand:
- Source study name and year
- Sample size and population
- Evidence grade badge
- One-sentence plain language summary of the finding
- Confidence interval from the study

### Visual Character

This screen is the most visually rich. The fan chart dominates the upper half with its glowing amber and teal bands. The body map below pulses gently. The mini pace gauge anchors the bottom. Together, they create a layered experience: analytical (chart) → visceral (body map) → concrete (gauge number).

The 3 intervention cards at the top invite clicking. Each click triggers a cascade: chart paths animate, body map zones shift color, gauge needle swings. The whole screen *responds* to the user's curiosity. This is not a static report — it's an instrument they play.

**Critical demo moment:** When the judge sees James toggle from "current habits" to "post-meal walks + dietary changes" and watches the teal line diverge downward, the body map cool from amber to teal, and the gauge needle swing from 1.12× to 1.02× — all in one fluid animation — that is the moment the pitch lands.

---

## Screen 4: Profile

**Job:** Connect and configure data sources.

### Layout (top to bottom)

### Layout (single column, max-width 720px within content area)

**1. User Identity Card**

Name, chronological age, last epigenetic test date. Simple, compact.

**2. Data Sources Section**

Three expandable cards, one per data source. Each card follows the same pattern:

**Wearable Card**
- Header: "Wearable" + connection status dot (teal/amber/gray) + device name ("Oura Ring Gen 3")
- Collapsed: last sync time + data summary ("HRV avg: 42ms · Sleep efficiency: 84%")
- Expanded: sync settings, device info, data being pulled (HRV, sleep stages, resting HR, activity)
- Connect/Disconnect button: violet accent

**CGM Card**
- Header: "CGM" + connection status dot + device name ("Dexcom G7")
- Collapsed: last reading time + current glucose + today's variability score
- Expanded: sync settings, device info, data being pulled (real-time glucose, daily variability, meal response curves)
- Connect/Disconnect button

**Epigenetic Report Card**
- Header: "Epigenetic Report" + status + provider name ("TruDiagnostic")
- Collapsed: last test date + biological age + DunedinPACE + days until next recommended test (with a subtle circular progress indicator)
- Expanded: upload area (drag-and-drop or file picker), test history timeline showing previous results as small dots on a horizontal line, each dot showing bio age on hover
- Next test recommendation: "Recommended retest: April 2026 (in 43 days)" — this creates a natural return trigger

**3. Data Flow Visualization**

A small, elegant diagram showing how the three sources feed into the system:

```
[Wearable] ──→
[CGM]      ──→  [ Metabolic Mirror Engine ]  ──→  [ Your Aging Trajectory ]
[Epigenetic] ─→
```

This is rendered as a subtle animated SVG — three input lines flowing into a central node, with small data particles (tiny dots) traveling along the lines at different speeds. Wearable and CGM particles flow continuously. Epigenetic particles pulse occasionally (representing periodic uploads). The central node glows softly in violet.

Purpose: makes the data architecture tangible and beautiful. Reinforces the "three sources, one narrative" value prop. Takes ~1 hour to build as an SVG animation.

### Visual Character

Profile is the most functional, least emotional screen. Clean, organized, utility-focused. The data flow visualization at the bottom is the one moment of visual delight — a small reminder that this isn't just settings, it's the nervous system of the product.

---

## Prototype Scope Notes

**What is real:**
- All data is synthetic (James, 52, 90-day dataset)
- Bridge engine runs client-side — lookup tables with interpolation, not ML
- Fan chart confidence bands are computed from temporal uncertainty function
- Body map colors are derived from composite organ scores

**What is simulated:**
- Wearable/CGM sync screens show realistic mock data, not live device connections
- Epigenetic upload is a wireframe or shows pre-loaded test results
- Data source indicators show pre-set connection states

**What judges should never be able to tell:**
- Whether data is real or synthetic
- Whether device connections are live or mocked
- The entire experience should feel like a working product connected to real sensors

---

## Technical Stack

| Component | Technology |
|:----------|:-----------|
| Frontend | React + TypeScript + Tailwind CSS |
| Visualization | Recharts (fan chart, sparklines) + D3.js (body map SVG, pace gauge) |
| Bridge Engine | JavaScript, client-side (~150 lines of projection math) |
| Data | JSON files imported at build time (synthetic) |
| Deployment | Vercel (single deploy, free tier) |

No backend. No database. No CORS. One deployable artifact.

---

## Navigation Flow

```
Dashboard ──→ Scoreboard ──→ Sandbox
    │              │              │
    └──→ Profile   └──→ Sandbox  └──→ (evidence cards expand inline)
              │
              └──→ (data source cards expand inline)
```

Primary flow: Dashboard → Scoreboard → Sandbox (fear → understanding → empowerment)
Secondary: any screen → Profile via left sidebar
Tertiary: Scoreboard habit click → Sandbox with that intervention preloaded

---

## Demo Script (90 seconds)

1. **Problem (10s):** James opens the app. Gauge reads 1.12×. Verdict: "You're aging 12% faster." Three source pills show all data connected.
2. **Understanding (20s):** Scoreboard shows #1 opportunity: post-meal walking. Evidence: Strong RCT. Impact bars rank his options.
3. **Decision (40s):** Sandbox. Three cards. James clicks "Post-meal walks + dietary changes." Fan chart animates — teal line diverges down. Body map cools from amber to teal. Gauge swings from 1.12× to 1.02×. One animation, entire value prop.
4. **Proof (20s):** Toggle back to "Current habits." Amber line trends up. Body map warms. Gauge swings back. The contrast is visceral. Two futures. One choice.

---

## Build Priority (if time runs short)

1. **Pace gauge + verdict** — the Dashboard must work
2. **Fan chart with diverging paths** — the Sandbox must animate
3. **Body map morph** — the visceral companion to the chart
4. **Scoreboard ranked list** — can be simplified to static cards
5. **Profile data sources** — can be reduced to a simple list with status dots
6. **Data flow animation in Profile** — cut first if time is tight

---

*Metabolic Mirror · CLAUDE.md · v1.0 · February 2026*
*Built for the Advance Health Hackathon. Four screens. One narrative. Two futures.*
