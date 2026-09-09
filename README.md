# ✈️ GradePilot

**Student Academic Command Center** — not just a calculator, a decision-making tool.

Enter your subjects once, set a target SGPA, and GradePilot tells you **what to focus on** to get there.

## Features

### 📊 Semester Dashboard
- Expected vs Target SGPA with progress bar
- Risk analysis (high/medium/low per subject)
- Academic Health score (0-100)

### 🎯 Priority Score Algorithm
Ranks subjects by: `Credit × Difficulty × ImprovementPotential`

Tells you exactly where your next hour of study matters most.

### 🔥 Best Opportunities
Shows the minimal grade improvements needed to reach your target — not "study everything harder," but "improve *these* 3 subjects."

### 😈 What-If Simulator
Change grades and instantly see SGPA impact. Play with scenarios before committing to a strategy.

### 📅 Study Time Allocation
Weekly study hours weighted by priority. High-credit, difficult, low-grade subjects get more time.

### 🧠 Difficulty × Credits Matrix
Visual scatter plot showing where each subject falls. Focus first on subjects that are both high-credit and hard.

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **Tailwind CSS** — Via CDN, with custom animations
- **Vanilla JavaScript** — ES modules, no frameworks, no build tools

No backend. No database. No login. Data lives in `localStorage`.

## Getting Started

1. Clone the repo
2. Open `index.html` in a browser (or use a local server for ES modules)
3. Add your subjects, set your target, launch the dashboard

```bash
# Option 1: Direct open (may need a server for ES modules)
# Option 2: Use any static server
npx serve .
# or
python -m http.server 8000
```

## Grading Scale

Uses the standard Indian 10-point system:

| Grade | Points |
|-------|--------|
| O     | 10     |
| A+    | 9      |
| A     | 8      |
| B+    | 7      |
| B     | 6      |
| C     | 5      |
| F     | 0      |

## Roadmap

- [x] **V1** — Subject setup, SGPA engine, target analysis, priority recommendations
- [ ] **V2** — CA + Midterm + EndTerm marks → expected grade
- [ ] **V3** — CGPA planner across semesters
- [ ] **V4** — PWA (installable, offline-capable)

## License

MIT
