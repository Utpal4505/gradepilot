// ──────────────────────────────────────────────
//  GradePilot · state.js
//  Central state management + localStorage
// ──────────────────────────────────────────────

import { uid, SEMESTER_PRESETS, ASSESSMENT_SCHEMES } from './utils.js';

const STORAGE_KEY = 'gradepilot';

/** Default fresh state */
function defaultState() {
  return {
    view: 'wizard',        // 'wizard' | 'dashboard'
    activeTab: 'overview', // 'overview' | 'marks'
    wizardStep: 1,         // 1 | 2 | 3
    mode: 'semester',      // 'semester' | 'cgpa'
    subjects: [],          // Array<Subject>
    targetSGPA: 9.0,
    studyHoursPerWeek: 16,
    previousSemesters: [], // For V3 CGPA planner
    darkMode: null,        // null = follow system
  };
}

/**
 * Subject shape:
 * {
 *   id: string,
 *   name: string,
 *   credits: number (1-6),
 *   difficulty: 'easy' | 'medium' | 'hard',
 *   assessments: { ca: bool, midterm: bool, endterm: bool },
 *   assessmentScheme: '20-30-50' | '25-25-50' | '40-60' | '30-70' | 'custom',
 *   marks: {
 *     ca: { scored: number|null, max: number },
 *     midterm: { scored: number|null, max: number },
 *     endterm: { scored: number|null, max: number, target: number|null }
 *   },
 *   useMarksCalc: boolean,
 *   expectedGrade: string ('A+', 'A', etc.),
 *   simulatedGrade: string | null  (for what-if)
 * }
 */

// ── Subscribers ──────────────────────────────

const listeners = new Set();

/** Subscribe to state changes. Returns unsubscribe function. */
export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Notify all subscribers */
function notify() {
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error('State subscriber error:', e); }
  }
}

// ── State object ─────────────────────────────

let state = defaultState();

/** Get current state (read-only snapshot) */
export function getState() {
  return state;
}

/** Update state with partial changes and persist */
export function setState(partial) {
  state = { ...state, ...partial };
  persist();
  notify();
}

/** Update a specific subject by ID */
export function updateSubject(id, changes) {
  state = {
    ...state,
    subjects: state.subjects.map(s =>
      s.id === id ? { ...s, ...changes } : s
    ),
  };
  persist();
  notify();
}

/** Create a new complete Subject object with defaults */
export function createSubject(partial = {}) {
  const schemeKey = partial.assessmentScheme || '20-30-50';
  const scheme = ASSESSMENT_SCHEMES[schemeKey] || ASSESSMENT_SCHEMES['20-30-50'];

  return {
    id: partial.id || uid(),
    name: partial.name || '',
    credits: Number(partial.credits) || 3,
    difficulty: partial.difficulty || 'medium',
    assessments: partial.assessments || { ca: true, midterm: true, endterm: true },
    assessmentScheme: schemeKey,
    marks: partial.marks || {
      ca: { scored: null, max: scheme.caMax },
      midterm: { scored: null, max: scheme.midtermMax },
      endterm: { scored: null, max: scheme.endtermMax, target: null },
    },
    useMarksCalc: partial.useMarksCalc || false,
    expectedGrade: partial.expectedGrade || 'A',
    simulatedGrade: partial.simulatedGrade || null,
    examDate: partial.examDate || null,
  };
}

/** Add a subject */
export function addSubject(subject) {
  const complete = createSubject(subject);
  state = {
    ...state,
    subjects: [...state.subjects, complete],
  };
  persist();
  notify();
}

/** Replace all subjects with a preset template */
export function loadPreset(presetId) {
  const preset = SEMESTER_PRESETS.find(p => p.id === presetId);
  if (!preset) return false;

  const newSubjects = preset.subjects.map(s => createSubject(s));
  state = {
    ...state,
    subjects: newSubjects,
  };
  persist();
  notify();
  return true;
}

/** Update specific mark component for a subject */
export function updateSubjectMarks(id, component, data) {
  const sub = state.subjects.find(s => s.id === id);
  if (!sub) return;

  const currentMarks = sub.marks || {
    ca: { scored: null, max: 20 },
    midterm: { scored: null, max: 30 },
    endterm: { scored: null, max: 50, target: null },
  };

  const updatedComponent = {
    ...currentMarks[component],
    ...data,
  };

  const newMarks = {
    ...currentMarks,
    [component]: updatedComponent,
  };

  updateSubject(id, {
    marks: newMarks,
    useMarksCalc: true, // User engaged with marks calculator for this subject
  });
}

/** Remove a subject by ID */
export function removeSubject(id) {
  state = {
    ...state,
    subjects: state.subjects.filter(s => s.id !== id),
  };
  persist();
  notify();
}

/** Reset all simulated grades */
export function resetSimulations() {
  state = {
    ...state,
    subjects: state.subjects.map(s => ({ ...s, simulatedGrade: null })),
  };
  persist();
  notify();
}

/** Full reset — clears everything */
export function resetState() {
  state = defaultState();
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

// ── Persistence ──────────────────────────────

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

/** Load state from localStorage. Returns true if state was restored. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    // Merge with defaults so new fields are picked up
    state = { ...defaultState(), ...saved };
    return true;
  } catch (e) {
    console.warn('Failed to load state:', e);
    return false;
  }
}

/** Check if user has completed the wizard (has subjects) */
export function hasData() {
  return state.subjects.length > 0 && state.view === 'dashboard';
}
