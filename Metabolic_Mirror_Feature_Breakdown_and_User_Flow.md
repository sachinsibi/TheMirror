# Metabolic Mirror — Updated Feature Breakdown & User Flow
## Human-Centric Design Document · Advance Health 2026

---

## Screen 1: Home / Verdict

**Primary job:** Orient. "Where am I right now and what does it mean for today?"

### Features

**Pace of Aging Display**
- DunedinPACE number — large, color-coded amber→teal
- Biological age vs chronological age delta ("Body age: 57 · Calendar age: 52")
- Status sentence — one line, empowerment framing ("You're aging faster than you need to. Here's what's driving it.")
- Uncertainty range displayed with a soft visual halo around the pace number — uncertainty is *felt*, not just stated in secondary text
- Uncertainty range also in secondary text ("estimated range: 1.02x–1.10x") for users who want the detail

**Today's Aging Impact Card**
- Score replaced with human-readable framing: "Today added roughly 1.1 days to your biological age. Yesterday added 0.7."
- Days framing — concrete and personal, not an abstract 0–100 score
- "Today is working for / against you" — empowerment framing, no blame
- Single driver callout: "Late dinner is the main factor today."

**Your Story This Week — Narrative Card**
- Auto-generated 2–3 sentence plain language narrative below the impact card
- Converts data into cause-and-effect story, not a chart
- Example: "Your sleep dropped below 6 hours on Tuesday and Wednesday. Your inflammatory load climbed 12% by Thursday. Your post-meal walks on Friday and Saturday have started pulling it back down."
- Pulls directly from bridge engine outputs — no new data required
- This is the human layer the rest of the app supports

**30-Day Trend Sparkline**
- Small, below the narrative card
- Direction indicator only — arrow + percentage change

**Quest / Badge Strip (opt-in, dismissable)**
- Appears below sparkline for users who haven't dismissed it
- Shows one active quest: "Log 5 days this week — Day 3 of 5"
- Subtle, not gamified in tone — fits clinical credibility

**Navigation**
- One primary CTA: "See What's Driving This" → Scoreboard
- Secondary CTA: "Log Today" — text link, not button
- Post-test nudge (conditional — appears only after a test date passes): "Your projection is ready to verify. See how accurate we were." → Profile

**Engagement Mechanism**
Days-added framing changes every day. The narrative card tells a new story each week. Quest strip creates a low-stakes daily pull. Post-test nudge appears at exactly the right moment — when the user has something meaningful to verify.

---

## Screen 2: Longevity Sandbox / What-If

**Primary job:** Decide. "What's my best move and what are my two futures?"

### Features

**Opening Anchor**
- Always visible before the chart loads: "James, 52 · Biological age: 57 · Aging 1.12x"
- Grounds the chart in a person, not a data set

**Default State — Never Cold**
- "Current habits" trajectory preloaded on open
- Amber line trending upward, labelled "This is your current path"
- Chart is never empty — urgency is present from the first frame

**Intervention Cards (3)**
- Card format, not buttons — each shows intervention name + projected delta teaser ("↓ up to 1.3 years")
- Cards invite natural comparison — users tap all three
- Each card tap animates the fan chart in real time

**Dual Trajectory Fan Chart**
- Amber line (current path) vs teal line (selected intervention)
- 50% confidence band (inner) + 90% confidence band (outer)
- Bands widen visibly over time — uncertainty is honest and visual
- Vertical dashed line at month 6 labelled "Your next test"
- Projected outcome shown as range only — never a point estimate ("Biological age: 54.5–55.1 in 6 months")

**Disease-Risk Translation**
- One line below the fan chart, translating the biological age delta into a concrete lived consequence
- Negative framing (current path): "At your current pace, you're on track to develop metabolic syndrome 4 years earlier than your calendar age suggests."
- Positive framing (with intervention): "With post-meal walks, you reduce your estimated 10-year diabetes risk by 18%."
- This makes long-term consequences feel immediate and personal

**Evidence Card (expandable per intervention)**
- Source study, sample size, population, confidence interval
- Plain language evidence grade: "Strong evidence (RCT, n>100)" / "Moderate evidence (RCT, n<50, extrapolated to single component)" / "Preliminary (observational)"
- Turns scientific weakness into trust advantage — no competitor does this

**"What if I do nothing?" Toggle**
- Returns chart to default amber state
- Labelled "Current path" — not "do nothing" which implies blame

**Engagement Mechanism**
Amber line trending upward by default creates immediate urgency. Three intervention cards invite natural curiosity-driven comparison — not notification-driven. Disease-risk translation makes abstract aging feel personally consequential. Evidence cards reward skeptical users.

---

## Screen 3: Habit Ranking / Scoreboard

**Primary job:** Understand. "What's causing this — and what can I actually do about it?"

### Features

**Weekly Trend Card (pinned top)**
- Direction + one concrete win + driver — three lines, no chart
- Example: "This week vs last week — Your inflammatory load dropped 8%. Sleep consistency drove it."
- Resets every 7 days with new language and a new win
- Never shows a losing week without reframing it: "Your inflammatory load climbed 6%. Earlier dinners this week could reverse it."

**#1 Opportunity (visually elevated)**
- Teal accent, projected impact shown as a range
- Framed as the lowest-friction, highest-impact action available right now
- Tapping links directly to Sandbox with this intervention preloaded

**#1 Risk (reframed as opportunity)**
- Amber accent — never red
- Always labelled "Your biggest opportunity:" not "Your biggest risk:"
- Example: "Your biggest opportunity: earlier dinners could decelerate aging by 0.2 years per year"

**Full Ranked List**
- Effort-to-impact ratio indicator per habit — replaces raw impact bars
  - Icon set: "High impact, low effort" / "High impact, high effort" / "Moderate impact, low effort"
  - Reframes the list as a menu of choices, not a report card
- Confidence tags per habit: high / moderate / emerging
- Evidence grade badge — expandable to show source
- Each habit links to Sandbox with that intervention preloaded

**Equity Acknowledgment (contextual)**
- Appears on habits tied to food access or environment
- One line: "Access to whole foods varies. Even small shifts count."
- Appears as a soft label, not a disclaimer — part of the design, not below it

**Engagement Mechanism**
Weekly trend card gives users a concrete reason to return every 7 days. Effort-to-impact ratio removes the blame dynamic from the ranked list. #1 opportunity updates as daily logs accumulate — ranking shifts with behavior. Habit → Sandbox link keeps users moving forward into the decision loop.

---

## Screen 4: Body Map

**Primary job:** Explore. "Which parts of me are aging fastest and what's driving it?"

### Features

**Persistent Verdict Banner (top)**
- Always visible regardless of navigation entry point
- "Current pace: 1.12x · Aging faster than calendar age"
- Collapsed, one line — doesn't compete with the visual below
- Solves the cold-entry problem from bottom nav

**Stylized SVG Body Silhouette**
- 4 tappable organ zones: metabolic, cardiovascular, immune, hepatic
- Color-coded by projected aging rate (amber→teal)
- No anatomical realism — stylized is intentional and cleaner

**Organ Detail Card (on tap)**
- Organ age displayed with tilde prefix: "Metabolic · ~61 years" — "~" is a deliberate design choice communicating estimation without a disclaimer
- Top contributing factor — one line
- 30-day trend: improving / stable / worsening
- Data source label: "Derived from glucose variability + diet quality"
- Wellness disclaimer baked into the label design, not a separate line
- CTA: "See habits affecting this" → Scoreboard filtered to relevant habits

**Engagement Mechanism**
Persistent banner means users always have context regardless of entry point. The "~" tilde on organ ages sets honest expectations without anxiety. Organ → Scoreboard → Sandbox navigation chain prevents dead-ending. Colors shift as daily logs accumulate — users return to watch their body map cool from amber toward teal.

---

## Screen 5: Daily Log

**Primary job:** Act. "What do I record right now — and does it matter?"

### Features

**Streak Counter (top)**
- "Day 14 of logging · Your longest streak" — small, above the form
- Loss aversion mechanism — subtle, not aggressive
- If streak is broken: "Streak reset. Day 1 again — your data still counts." Removes shame from missing a day.

**Log Inputs (all categorical — under 60 seconds to complete)**
- Meal category: tap cards (whole / mixed / processed) — not dropdowns, not free text
- Alcohol counter: 0, 1, 2, 3+ with one-tap interaction
- Stress slider: 1–5 with one-word labels (Calm · Low · Moderate · High · Overwhelmed)
- Post-meal walk: yes/no toggle → minute selector appears only if yes

**Submit Interaction**
- Pace nudge animation — the days-added number shifts visibly
- One-line feedback tied to what was just logged: "Post-meal walk added. This is your #1 age-decelerating habit right now."
- Positive feedback always leads — never "you avoided a bad habit," always "you did something good"

**Post-Submit Prompt**
- One line, one tap: "Your biggest opportunity today: earlier dinner. Tap to learn why." → Scoreboard
- Pulls users into the main flow rather than letting them close the app

**Quest Progress (if active)**
- Below the submit button — small badge update: "Day 3 of 5 logged this week. Two more to unlock your weekly insight."
- One line. Never interrupts the log flow.

**Engagement Mechanism**
Streak counter activates loss aversion. Shame-free streak reset removes the most common abandonment trigger in health apps. Post-submit feedback provides immediate reward tied to a specific action. Post-submit prompt continues the flow. Quest progress makes logging feel purposeful beyond the immediate moment.

---

## Screen 6: Profile

**Primary job:** Trust. "Why should I believe this — and is it working?"

### Features

**James's Baseline Card**
- Chronological age, biological age at last test, DunedinPACE score, test date, lab platform (EPICv2)
- Static — the anchor point everything else is measured against

**Projected vs Actual Comparison Card (dynamic)**
- Before second test: "Your next test on [date] will show how accurate our projection was. We're on record."
  - "We're on record" — signals confidence and accountability, not hedging
- After second test: Last projected biological age vs actual result, displayed side by side
  - If accurate: "We projected 55.1. Your result: 54.8. The model is calibrated to you."
  - If off: "We projected 55.1. Your result: 56.2. Here's what we missed and why." — radical transparency
- This is the single most trust-building moment in the entire product

**Data Commitment (3 bullet points, plain language)**
- You own your data. Full deletion within 30 days including backups.
- End-to-end encryption. Real-time metrics computed on your device.
- Never shared with insurers, employers, or government agencies. Ever.

**Clock Methodology Note**
- "We use GrimAge + DunedinPACE — the two clocks with the strongest mortality prediction and intervention response evidence."
- One line. No jargon beyond the clock names.

**Wellness Disclaimer**
- "Metabolic Mirror is a wellness tool. It does not diagnose disease or replace clinical care."
- Present but not dominant — part of the screen design, not a popup

**Engagement Mechanism**
"We're on record" framing builds anticipation before the second test — gives users a reason to return at the 3–6 month mark. Post-test accuracy card makes the model's performance personally meaningful. Radical transparency on misses builds more trust than silence would.

---

## Engagement Loop Summary

| Loop | Cadence | Screen | Mechanism |
|------|---------|--------|-----------|
| Days-added framing | Every day | Home | Concrete daily consequence — not abstract score |
| Weekly narrative reset | Every 7 days | Home | New story, new cause-and-effect |
| Streak protection | Every day | Daily Log | Loss aversion — shame-free reset removes abandonment trigger |
| Post-submit reward | Every day | Daily Log | Immediate feedback tied to specific logged action |
| Quest progress | Every day | Daily Log + Home | Purposeful logging with milestone payoff |
| Weekly trend reset | Every 7 days | Scoreboard | New language, new win, new #1 opportunity |
| Habit ranking shift | As logs accumulate | Scoreboard | Rankings update with behavior — users check back |
| Sandbox curiosity | On demand | Sandbox | Three interventions + disease-risk translation invite comparison |
| Organ → habit loop | On demand | Body Map → Scoreboard → Sandbox | Navigation chain prevents dead ends |
| Post-test verification | Every 3–6 months | Profile | Projected vs actual accuracy reveal — longest but most powerful loop |

**Three loop cadences mapped to three user archetypes:**
- Short loops (daily) → pre-diabetic who needs frequent reinforcement
- Medium loops (weekly + on demand) → optimiser who wants synthesis
- Long loop (quarterly) → clinician or data-driven user who trusts evidence over time

---

## User Flow

```
ENTRY
  └── Home / Verdict
        │
        ├── [Primary CTA] "See What's Driving This"
        │         └── Scoreboard
        │               ├── Weekly trend card (context — one win, one driver)
        │               ├── #1 Opportunity (teal) → tap habit
        │               │         └── Sandbox (intervention preloaded)
        │               │               ├── Amber line default (urgency from frame 1)
        │               │               ├── Select intervention → chart animates
        │               │               ├── Compare all 3 interventions
        │               │               ├── Disease-risk translation (personal consequence)
        │               │               └── Evidence card → trust
        │               └── #1 Risk → reframed as opportunity (amber, never red)
        │
        ├── [Secondary CTA] "Log Today"
        │         └── Daily Log
        │               ├── Streak counter (loss aversion, shame-free reset)
        │               ├── Log inputs (under 60 seconds)
        │               ├── Submit → pace nudge + one-line feedback
        │               ├── Post-submit prompt → Scoreboard
        │               └── Quest progress update
        │
        ├── [Post-test nudge — conditional, after test date passes]
        │         └── Profile
        │               ├── Projected vs actual accuracy card
        │               └── "We're on record" → trust anchor
        │
        └── [Bottom Nav] Explore freely
                  ├── Body Map
                  │     ├── Persistent verdict banner (context always present)
                  │     └── Organ tap → detail card
                  │               ├── "~" tilde on age estimates (honest, not anxious)
                  │               └── "See habits affecting this"
                  │                         └── Scoreboard (filtered to organ)
                  │                                   └── Sandbox (habit preloaded)
                  ├── Sandbox (direct)
                  │     └── Amber line preloaded by default (never cold, always urgent)
                  └── Profile
                        └── Projected vs actual card → longest engagement loop
```

---

## Core Journey — One Sentence Per Stage

| Stage | Screen | What the user feels |
|-------|--------|---------------------|
| **Orient** | Home | "I know exactly where I stand, what today cost me in days, and what story my body is telling this week." |
| **Understand** | Scoreboard | "I can see which habits are aging me, which are protecting me, and what's genuinely within my reach to change." |
| **Decide** | Sandbox | "I can see two futures diverging from a single choice — and I understand what's at stake in concrete health terms." |
| **Act** | Daily Log | "I did something specific today that moved the needle, and the app told me exactly why it mattered." |
| **Explore** | Body Map | "I understand which parts of my body are responding and I know which habits to pull on for each one." |
| **Trust** | Profile | "The system went on record with a prediction, and it proved itself — or told me honestly why it missed." |
