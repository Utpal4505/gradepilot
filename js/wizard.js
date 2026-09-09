import { getState, setState, addSubject, removeSubject, updateSubject, loadPreset, subscribe } from './state.js';
import { uid, SELECTABLE_GRADES, TARGET_OPTIONS, DIFFICULTY, SEMESTER_PRESETS, POPULAR_SUBJECTS, ASSESSMENT_SCHEMES } from './utils.js';

let isSubscribed = false;
let editingSubjectId = null;

export function renderWizard(container) {
  if (!isSubscribed) {
    subscribe(() => _render(container));
    isSubscribed = true;
  }
  _render(container);
}

function _render(container) {
  const state = getState();
  const step = state.wizardStep || 1;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Header / Progress -->
      <div class="mb-8">
        <h2 class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Step ${step} of 3</h2>
        <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: ${(step / 3) * 100}%"></div>
        </div>
      </div>

      <!-- Step Content -->
      <div id="wizard-content" class="bg-white dark:bg-gray-800 shadow rounded-xl p-6 transition-all">
      </div>

      <!-- Navigation -->
      <div class="mt-6 flex justify-between items-center" id="wizard-nav">
      </div>
    </div>
  `;

  const contentDiv = container.querySelector('#wizard-content');
  const navDiv = container.querySelector('#wizard-nav');

  if (step === 1) renderStep1(contentDiv, navDiv, state);
  if (step === 2) renderStep2(contentDiv, navDiv, state);
  if (step === 3) renderStep3(contentDiv, navDiv, state);
}

function renderStep1(contentDiv, navDiv, state) {
  contentDiv.innerHTML = `
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">What do you want to plan?</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div id="mode-semester" class="cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${state.mode === 'semester' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}">
        <div class="text-4xl mb-2">📅</div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">This Semester</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Plan and track your current semester subjects and target SGPA.</p>
      </div>
      <div class="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed">
        <div class="text-4xl mb-2">🎓</div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Overall CGPA</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Coming soon in V3</p>
      </div>
    </div>
  `;

  contentDiv.querySelector('#mode-semester').addEventListener('click', () => {
    setState({ mode: 'semester' });
  });

  navDiv.innerHTML = `
    <div></div>
    <button id="btn-next" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">Next</button>
  `;
  
  navDiv.querySelector('#btn-next').addEventListener('click', () => {
    setState({ wizardStep: 2 });
  });
}

function renderStep2(contentDiv, navDiv, state) {
  const isEditing = editingSubjectId !== null;
  let subjectToEdit = isEditing ? state.subjects.find(s => s.id === editingSubjectId) : null;
  
  if (isEditing && !subjectToEdit) {
     editingSubjectId = null;
  }

  const defaultValues = {
    name: '',
    credits: 3,
    difficulty: 'medium',
    assessmentScheme: '20-30-50',
    assessments: { ca: true, midterm: true, endterm: true },
    expectedGrade: 'A'
  };

  const values = subjectToEdit || defaultValues;

  contentDiv.innerHTML = `
    <div class="space-y-6">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add your subjects</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Use 1-click templates or quickly add subjects below.</p>
      </div>

      <!-- Quick 1-Click Templates -->
      <div class="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <span>⚡</span> 1-Click Quick Setup
          </span>
          <span class="text-xs text-indigo-500 dark:text-indigo-400">Loads a full semester in 1 second</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${SEMESTER_PRESETS.map(p => `
            <button type="button" class="preset-btn text-left p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-400 hover:shadow-sm transition-all" data-preset="${p.id}">
              <div class="font-semibold text-xs sm:text-sm text-indigo-900 dark:text-indigo-100">${p.name}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${p.description}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Quick Add Chips -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Or Quick-Add Popular Subjects (1-Click):
        </label>
        <div class="flex flex-wrap gap-1.5">
          ${POPULAR_SUBJECTS.map(ps => `
            <button type="button" class="chip-add-btn text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center gap-1"
              data-name="${ps.name}" data-credits="${ps.credits}" data-difficulty="${ps.difficulty}" data-grade="${ps.expectedGrade}">
              <span>+</span>
              <span>${ps.name}</span>
              <span class="opacity-60 text-[10px]">(${ps.credits}CR)</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Manual Subject Form -->
      <form id="subject-form" class="space-y-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/70 dark:bg-gray-800/50 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            ${subjectToEdit ? '✏️ Edit Subject' : '➕ Custom Subject Form'}
          </span>
          ${subjectToEdit ? '<span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Editing active subject</span>' : ''}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
          <input type="text" id="subj-name" required value="${values.name}" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm" placeholder="e.g. Mathematics, Operating Systems">
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
            <input type="number" id="subj-credits" required min="1" max="8" value="${values.credits}" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Grade</label>
            <select id="subj-grade" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm">
              ${SELECTABLE_GRADES.map(g => `<option value="${g.grade}" ${g.grade === values.expectedGrade ? 'selected' : ''}>${g.grade} (${g.label})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Scheme</label>
            <select id="subj-scheme" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border text-sm">
              ${Object.entries(ASSESSMENT_SCHEMES).map(([key, s]) => `
                <option value="${key}" ${key === (values.assessmentScheme || '20-30-50') ? 'selected' : ''}>${s.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
          <div class="flex flex-wrap gap-2">
            ${Object.entries(DIFFICULTY).map(([key, diff]) => {
              const isSelected = values.difficulty === key;
              const baseClasses = 'px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all';
              const colors = isSelected 
                ? `bg-${diff.color}-100 text-${diff.color}-800 border-2 border-${diff.color}-500 dark:bg-${diff.color}-900/40 dark:text-${diff.color}-300 shadow-sm` 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
              return `<button type="button" class="diff-btn ${baseClasses} ${colors}" data-key="${key}">${diff.label}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          ${subjectToEdit ? `<button type="button" id="btn-cancel-edit" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">Cancel</button>` : ''}
          <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
            ${subjectToEdit ? 'Update Subject' : '+ Add Subject (Enter)'}
          </button>
        </div>
      </form>

      <!-- Added Subjects List -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📚</span> Added Subjects (${state.subjects.length})
          </h4>
          ${state.subjects.length > 0 ? `
            <button type="button" id="btn-clear-subjects" class="text-xs text-rose-600 dark:text-rose-400 hover:underline">
              Clear All
            </button>
          ` : ''}
        </div>

        <div class="space-y-2.5" id="subject-list">
          ${state.subjects.length === 0 ? `
            <div class="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p class="text-gray-500 dark:text-gray-400 text-sm">No subjects added yet.</p>
              <p class="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Click a 1-click preset above or add one manually!</p>
            </div>
          ` : ''}
          ${state.subjects.map(s => {
            const diff = DIFFICULTY[s.difficulty] || DIFFICULTY.medium;
            return `
            <div class="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div class="min-w-0 flex-1 pr-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <h5 class="font-semibold text-gray-900 dark:text-white text-sm truncate">${s.name}</h5>
                  <span class="px-2 py-0.5 text-[11px] rounded-full font-medium bg-${diff.color}-100 text-${diff.color}-800 dark:bg-${diff.color}-900/30 dark:text-${diff.color}-300">${diff.label}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>${s.credits} Credits</span>
                  <span>•</span>
                  <span>Target: <strong class="text-gray-700 dark:text-gray-200">${s.expectedGrade}</strong></span>
                  <span>•</span>
                  <span class="text-indigo-600 dark:text-indigo-400">${s.assessmentScheme || '20-30-50'}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button class="edit-btn text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-medium px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" data-id="${s.id}">Edit</button>
                <button class="delete-btn text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 text-xs font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" data-id="${s.id}">Delete</button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Local form state for difficulty
  let selectedDiff = values.difficulty;
  
  contentDiv.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedDiff = btn.dataset.key;
      contentDiv.querySelectorAll('.diff-btn').forEach(b => {
        const k = b.dataset.key;
        const d = DIFFICULTY[k];
        if (k === selectedDiff) {
          b.className = `diff-btn px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all bg-${d.color}-100 text-${d.color}-800 border-2 border-${d.color}-500 dark:bg-${d.color}-900/40 dark:text-${d.color}-300 shadow-sm`;
        } else {
          b.className = `diff-btn px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all bg-white text-gray-600 border border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600`;
        }
      });
    });
  });

  // Preset button listeners
  contentDiv.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.preset;
      loadPreset(presetId);
    });
  });

  // Chip quick add listeners
  contentDiv.querySelectorAll('.chip-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const credits = Number(btn.dataset.credits) || 3;
      const difficulty = btn.dataset.difficulty || 'medium';
      const expectedGrade = btn.dataset.grade || 'A';
      addSubject({
        name,
        credits,
        difficulty,
        expectedGrade,
        assessmentScheme: '20-30-50'
      });
    });
  });

  // Clear all subjects listener
  const clearBtn = contentDiv.querySelector('#btn-clear-subjects');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all subjects from the list?')) {
        setState({ subjects: [] });
      }
    });
  }

  const form = contentDiv.querySelector('#subject-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = contentDiv.querySelector('#subj-name');
    const name = nameInput.value.trim();
    const credits = parseInt(contentDiv.querySelector('#subj-credits').value, 10);
    const expectedGrade = contentDiv.querySelector('#subj-grade').value;
    const assessmentScheme = contentDiv.querySelector('#subj-scheme').value;

    if (!name) return;

    if (subjectToEdit) {
      updateSubject(editingSubjectId, {
        name, credits, difficulty: selectedDiff, expectedGrade, assessmentScheme, simulatedGrade: null
      });
      editingSubjectId = null;
    } else {
      addSubject({
        name, credits, difficulty: selectedDiff, expectedGrade, assessmentScheme, simulatedGrade: null
      });
      // Clear input and focus back for lightning-fast entry of the next subject
      nameInput.value = '';
      nameInput.focus();
    }
  });

  if (subjectToEdit) {
    contentDiv.querySelector('#btn-cancel-edit').addEventListener('click', () => {
      editingSubjectId = null;
      setState({}); 
    });
  }

  contentDiv.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      editingSubjectId = e.target.dataset.id;
      setState({}); 
    });
  });

  contentDiv.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm('Delete this subject?')) {
        removeSubject(e.target.dataset.id);
        if (editingSubjectId === e.target.dataset.id) {
          editingSubjectId = null;
        }
      }
    });
  });

  navDiv.innerHTML = `
    <button id="btn-back" class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg font-medium transition-colors">Back</button>
    <button id="btn-next" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors ${state.subjects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${state.subjects.length === 0 ? 'disabled' : ''}>Next</button>
  `;

  navDiv.querySelector('#btn-back').addEventListener('click', () => {
    editingSubjectId = null;
    setState({ wizardStep: 1 });
  });
  
  navDiv.querySelector('#btn-next').addEventListener('click', () => {
    if (state.subjects.length > 0) {
      editingSubjectId = null;
      setState({ wizardStep: 3 });
    }
  });
}

function renderStep3(contentDiv, navDiv, state) {
  contentDiv.innerHTML = `
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set your Target SGPA</h3>
    <p class="text-gray-500 dark:text-gray-400 mb-6">The entire app revolves around this target.</p>
    
    <div class="mb-8">
      <div class="flex flex-wrap gap-3 mb-6">
        ${TARGET_OPTIONS.map(opt => `
          <button class="target-btn px-4 py-2 rounded-full font-medium transition-colors border-2 ${state.targetSGPA === opt ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-400 dark:text-indigo-300' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}" data-val="${opt}">
            ${opt.toFixed(1)}
          </button>
        `).join('')}
      </div>
      
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Target</label>
        <input type="number" id="custom-target" step="0.01" min="0" max="10" value="${state.targetSGPA}" class="w-full sm:w-1/2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
      </div>
    </div>
  `;

  contentDiv.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = parseFloat(e.target.dataset.val);
      setState({ targetSGPA: val });
    });
  });

  const customInput = contentDiv.querySelector('#custom-target');
  customInput.addEventListener('change', (e) => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      if (val < 0) val = 0;
      if (val > 10) val = 10;
      setState({ targetSGPA: val });
    }
  });

  navDiv.innerHTML = `
    <button id="btn-back" class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg font-medium transition-colors">Back</button>
    <button id="btn-launch" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/30">
      Launch Dashboard 🚀
    </button>
  `;

  navDiv.querySelector('#btn-back').addEventListener('click', () => {
    setState({ wizardStep: 2 });
  });
  
  navDiv.querySelector('#btn-launch').addEventListener('click', () => {
    setState({ view: 'dashboard', wizardStep: 1 });
  });
}
