// ──────────────────────────────────────────────
//  GradePilot · utils.js
//  Grade constants, mappings & helpers
// ──────────────────────────────────────────────

/** 10-point Indian grading scale */
export const GRADES = [
  { grade: 'O',  points: 10, minMarks: 90, label: 'Outstanding' },
  { grade: 'A+', points: 9,  minMarks: 80, label: 'Excellent' },
  { grade: 'A',  points: 8,  minMarks: 70, label: 'Very Good' },
  { grade: 'B+', points: 7,  minMarks: 60, label: 'Good' },
  { grade: 'B',  points: 6,  minMarks: 50, label: 'Above Average' },
  { grade: 'C',  points: 5,  minMarks: 40, label: 'Average' },
  { grade: 'F',  points: 0,  minMarks: 0,  label: 'Fail' },
];

/** All selectable grades (excluding F for target pickers) */
export const SELECTABLE_GRADES = GRADES.filter(g => g.grade !== 'F');

/** Difficulty levels with multipliers for Priority Score */
export const DIFFICULTY = {
  easy:   { label: 'Easy',   multiplier: 1, color: 'emerald' },
  medium: { label: 'Medium', multiplier: 2, color: 'amber' },
  hard:   { label: 'Hard',   multiplier: 3, color: 'rose' },
};

/** Default target SGPA options */
export const TARGET_OPTIONS = [7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

/** Assessment types */
export const ASSESSMENT_TYPES = [
  { key: 'ca',      label: 'CA (Continuous Assessment)' },
  { key: 'midterm',  label: 'Midterm' },
  { key: 'endterm',  label: 'End Term' },
];

/** Max grade points possible */
export const MAX_GRADE_POINTS = 10;

// ── Mapping helpers ──────────────────────────

/** Grade string → grade points (e.g. 'A+' → 9) */
export function gradeToPoints(grade) {
  const found = GRADES.find(g => g.grade === grade);
  return found ? found.points : 0;
}

/** Grade points → grade string (e.g. 9 → 'A+') */
export function pointsToGrade(points) {
  // Find the grade whose points match (exact)
  const found = GRADES.find(g => g.points === points);
  return found ? found.grade : 'F';
}

/** Marks (0-100) → grade string */
export function marksToGrade(marks) {
  for (const g of GRADES) {
    if (marks >= g.minMarks) return g.grade;
  }
  return 'F';
}

/** Get the next higher grade (e.g. 'A' → 'A+') — returns null if already max */
export function nextGradeUp(grade) {
  const idx = GRADES.findIndex(g => g.grade === grade);
  if (idx <= 0) return null; // already at O or not found
  return GRADES[idx - 1].grade;
}

/** Get all possible upgrades from a given grade */
export function possibleUpgrades(grade) {
  const idx = GRADES.findIndex(g => g.grade === grade);
  if (idx <= 0) return [];
  return GRADES.slice(0, idx).map(g => g.grade);
}

/** Generate a unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Clamp a number between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Round to N decimal places */
export function round(val, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

/** Get difficulty config by key */
export function getDifficulty(key) {
  return DIFFICULTY[key] || DIFFICULTY.medium;
}

/** Risk thresholds — how we classify subject risk relative to target */
export const RISK = {
  high:   { label: 'High Risk',   emoji: '🔴', color: 'rose',    tailwind: 'text-rose-500' },
  medium: { label: 'Medium Risk', emoji: '🟡', color: 'amber',   tailwind: 'text-amber-500' },
  low:    { label: 'Safe',        emoji: '🟢', color: 'emerald', tailwind: 'text-emerald-500' },
};
