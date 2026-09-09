# ✈️ GradePilot

**Student Academic Command Center** — not just a calculator, a decision-making tool.

Enter your subjects once, set a target SGPA, and GradePilot tells you **what to focus on** to get there.

## Features

### 🧮 Marks Calculator & Exam Target Engine (V2)
- Input actual marks for Continuous Assessment (**CA**), **Midterm**, and **End Term**
- Pre-configured assessment schemes (`20/30/50`, `25/25/50`, `40/60`, `30/70`, Custom)
- Real-time projected percentage (0–100%) and automatic grade mapping
- **"What do I need in End Term?"**: Tells you the exact marks out of 50/60/70 required on your final exam to secure an **O**, **A+**, **A**, or **B+**

### ⚡ 1-Click Fast Setup & Quick Chips
- **1-Click Semester Presets**: Load ready-made semester packages (B.Tech CSE Sem 3, Engineering Core) in 1 second
- **Popular Subject Chips**: Instant `+` buttons for Math, DSA, OS, Python, DBMS, Physics, EVS with pre-configured credits & difficulty
- Fast keyboard entry with Enter-to-add

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
3. Add your subjects (or click a 1-click preset), set your target, launch the dashboard

```bash
# Serve locally
npx serve . -l 3000
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
- [x] **V2** — Fast 1-click setup, CA + Midterm + EndTerm marks calculator & exam target engine
- [ ] **V3** — Multi-semester CGPA planner & projection
- [ ] **V4** — PWA (installable, offline-capable)

## License

MIT
