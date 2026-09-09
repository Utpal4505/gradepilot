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

/** Standard Assessment Schemes */
export const ASSESSMENT_SCHEMES = {
  '20-30-50': {
    name: 'Standard (CA: 20, Mid: 30, End: 50)',
    caMax: 20,
    midtermMax: 30,
    endtermMax: 50,
  },
  '25-25-50': {
    name: 'Balanced (CA: 25, Mid: 25, End: 50)',
    caMax: 25,
    midtermMax: 25,
    endtermMax: 50,
  },
  '40-60': {
    name: 'Internal / External (Int: 40, End: 60)',
    caMax: 40,
    midtermMax: 0,
    endtermMax: 60,
  },
  '30-70': {
    name: 'Internal / External (Int: 30, End: 70)',
    caMax: 30,
    midtermMax: 0,
    endtermMax: 70,
  },
  'custom': {
    name: 'Custom Breakdown',
    caMax: 20,
    midtermMax: 30,
    endtermMax: 50,
  }
};

/** Quick-Add Popular Subject Suggestions with default credits & difficulty */
export const POPULAR_SUBJECTS = [
  { name: 'Mathematics', credits: 4, difficulty: 'hard', expectedGrade: 'B+' },
  { name: 'Data Structures & Algorithms', credits: 4, difficulty: 'hard', expectedGrade: 'A' },
  { name: 'Operating Systems', credits: 3, difficulty: 'medium', expectedGrade: 'A' },
  { name: 'Python Programming', credits: 3, difficulty: 'easy', expectedGrade: 'A+' },
  { name: 'Database Management (DBMS)', credits: 3, difficulty: 'medium', expectedGrade: 'A' },
  { name: 'Computer Networks', credits: 3, difficulty: 'medium', expectedGrade: 'B+' },
  { name: 'Physics', credits: 3, difficulty: 'hard', expectedGrade: 'B' },
  { name: 'Environmental Studies', credits: 2, difficulty: 'easy', expectedGrade: 'A+' },
  { name: 'Soft Skills / Professional Comms', credits: 1, difficulty: 'easy', expectedGrade: 'O' }
];

/** Ready-made Semester Presets for 1-Click Setup */
export const SEMESTER_PRESETS = [
  {
    id: 'cs_sem3',
    name: '⚡ B.Tech Computer Science (Sem 3)',
    description: '6 Core CS Subjects • 19 Credits',
    subjects: [
      { name: 'Data Structures & Algorithms', credits: 4, difficulty: 'hard', expectedGrade: 'B+', marks: { ca: { scored: 16, max: 20 }, midterm: { scored: 22, max: 30 }, endterm: { scored: null, max: 50, target: 40 } } },
      { name: 'Discrete Mathematics', credits: 4, difficulty: 'hard', expectedGrade: 'B', marks: { ca: { scored: 14, max: 20 }, midterm: { scored: 18, max: 30 }, endterm: { scored: null, max: 50, target: 38 } } },
      { name: 'Operating Systems', credits: 3, difficulty: 'medium', expectedGrade: 'A', marks: { ca: { scored: 17, max: 20 }, midterm: { scored: 24, max: 30 }, endterm: { scored: null, max: 50, target: 41 } } },
      { name: 'Python & Object-Oriented Dev', credits: 3, difficulty: 'easy', expectedGrade: 'A+', marks: { ca: { scored: 19, max: 20 }, midterm: { scored: 27, max: 30 }, endterm: { scored: null, max: 50, target: 45 } } },
      { name: 'Computer Organization & Arch', credits: 3, difficulty: 'medium', expectedGrade: 'A', marks: { ca: { scored: 16, max: 20 }, midterm: { scored: 23, max: 30 }, endterm: { scored: null, max: 50, target: 39 } } },
      { name: 'Environmental Science', credits: 2, difficulty: 'easy', expectedGrade: 'A+', marks: { ca: { scored: 18, max: 20 }, midterm: { scored: 26, max: 30 }, endterm: { scored: null, max: 50, target: 44 } } },
    ]
  },
  {
    id: 'eng_core',
    name: '⚡ Engineering Common Core (5 Subjects)',
    description: 'Core Engineering • 17 Credits',
    subjects: [
      { name: 'Engineering Mathematics', credits: 4, difficulty: 'hard', expectedGrade: 'B+', marks: { ca: { scored: 15, max: 20 }, midterm: { scored: 21, max: 30 }, endterm: { scored: null, max: 50, target: 40 } } },
      { name: 'Applied Physics', credits: 4, difficulty: 'hard', expectedGrade: 'B', marks: { ca: { scored: 13, max: 20 }, midterm: { scored: 19, max: 30 }, endterm: { scored: null, max: 50, target: 36 } } },
      { name: 'Basic Electrical & Electronics', credits: 3, difficulty: 'medium', expectedGrade: 'A', marks: { ca: { scored: 16, max: 20 }, midterm: { scored: 23, max: 30 }, endterm: { scored: null, max: 50, target: 42 } } },
      { name: 'Engineering Graphics & CAD', credits: 3, difficulty: 'medium', expectedGrade: 'A', marks: { ca: { scored: 17, max: 20 }, midterm: { scored: 25, max: 30 }, endterm: { scored: null, max: 50, target: 40 } } },
      { name: 'Professional Communication', credits: 3, difficulty: 'easy', expectedGrade: 'A+', marks: { ca: { scored: 18, max: 20 }, midterm: { scored: 28, max: 30 }, endterm: { scored: null, max: 50, target: 45 } } },
    ]
  }
];

/** Calculate marks required in remaining exam (out of endtermMax) to achieve a target percentage/grade */
export function marksRequiredInEndTerm(currentTotalScored, currentMaxAttempted, totalCourseMax, endtermMax, targetGradeMinMarks) {
  // Target total marks needed out of totalCourseMax
  const targetTotal = (targetGradeMinMarks / 100) * totalCourseMax;
  const needed = targetTotal - currentTotalScored;

  if (needed <= 0) {
    return 0; // Already achieved with current marks
  }
  if (needed > endtermMax) {
    return null; // Mathematically impossible even with 100% on End Term
  }
  return round(needed, 1);
}
