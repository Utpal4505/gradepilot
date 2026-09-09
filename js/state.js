// ──────────────────────────────────────────────
//  GradePilot · state.js
//  Central state management + localStorage
// ──────────────────────────────────────────────

const STORAGE_KEY = 'gradepilot';

/** Default fresh state */
function defaultState() {
  return {
    view: 'wizard',        // 'wizard' | 'dashboard'
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

/** Add a subject */
export function addSubject(subject) {
  state = {
    ...state,
    subjects: [...state.subjects, subject],
  };
  persist();
  notify();
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
