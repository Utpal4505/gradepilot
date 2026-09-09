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
    expectedGrade: 'A'
  };

  const values = subjectToEdit || defaultValues;

  contentDiv.innerHTML = `
    <div class="space-y-6">
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add your courses</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Add your subjects in seconds. You only need the name, credits, and difficulty.</p>
      </div>

      <!-- Quick 1-Click Templates -->
      <div class="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-4">
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <span>⚡</span> 1-Click Semester Presets
          </span>
          <span class="text-[11px] text-indigo-500 dark:text-indigo-400">Skip typing entirely</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${SEMESTER_PRESETS.map(p => `
            <button type="button" class="preset-btn text-left p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-white dark:bg-gray-800 hover:border-indigo-500 hover:shadow-xs transition-all" data-preset="${p.id}">
              <div class="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-100">${p.name}</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">${p.description}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Quick Fill Suggestions -->
      <div>
        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          💡 Quick-Fill Common Subjects:
        </label>
        <div class="flex flex-wrap gap-1.5">
          ${POPULAR_SUBJECTS.map(ps => `
            <button type="button" class="chip-fill-btn text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center gap-1.5 shadow-2xs"
              data-name="${ps.name}" data-credits="${ps.credits}">
              <span class="text-indigo-500 font-bold">+</span>
              <span class="font-medium">${ps.name}</span>
              <span class="text-gray-400 text-[10px]">(${ps.credits} CR)</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Ultra-Clean Subject Form (Just 3 Simple Inputs) -->
      <form id="subject-form" class="space-y-4 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            ${subjectToEdit ? '✏️ Edit Subject' : '➕ Subject Details'}
          </span>
          ${subjectToEdit ? '<span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Editing selected subject</span>' : ''}
        </div>

        <!-- 1. Name -->
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Subject Name
          </label>
          <input type="text" id="subj-name" required value="${values.name}"
            class="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3.5 py-2.5 border text-sm font-medium"
            placeholder="e.g. Mathematics, Operating Systems, Physics">
        </div>
        
        <!-- 2. Credits & 3. Difficulty in a single clean row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <!-- Credits -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Credits
              </label>
              <span class="text-[11px] text-gray-400">Usually 2, 3, or 4</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                ${[2, 3, 4].map(cr => `
                  <button type="button" class="credit-pill px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${Number(values.credits) === cr ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}" data-cr="${cr}">
                    ${cr}
                  </button>
                `).join('')}
              </div>
              <input type="number" id="subj-credits" required min="1" max="10" value="${values.credits}"
                class="w-16 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white text-center shadow-xs focus:border-indigo-500 focus:ring-indigo-500 py-1.5 border text-sm font-bold">
            </div>
          </div>

          <!-- Difficulty -->
          <div>
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Difficulty Level
            </label>
            <div class="flex gap-1.5">
              ${[
                { key: 'easy', label: 'Easy', emoji: '🟢', bg: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
                { key: 'medium', label: 'Medium', emoji: '🟡', bg: 'bg-amber-50 text-amber-700 border-amber-500' },
                { key: 'hard', label: 'Hard', emoji: '🔴', bg: 'bg-rose-50 text-rose-700 border-rose-500' },
              ].map(d => {
                const isSelected = values.difficulty === d.key;
                return `
                  <button type="button" class="diff-btn flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${isSelected ? d.bg + ' border-2 shadow-xs' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300'}" data-key="${d.key}">
                    <span>${d.emoji}</span>
                    <span>${d.label}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Optional Accordion for Advanced Settings (Tucked away so beginners aren't confused) -->
        <div class="pt-2">
          <button type="button" id="btn-toggle-advanced" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1">
            <span id="adv-arrow">▶</span> ⚙️ Optional: Exam Scheme & Target Grade
          </button>
          
          <div id="advanced-panel" class="hidden mt-3 p-3.5 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Target Grade</label>
                <select id="subj-grade" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-2.5 py-1.5 border text-xs font-medium">
                  ${SELECTABLE_GRADES.map(g => `<option value="${g.grade}" ${g.grade === values.expectedGrade ? 'selected' : ''}>${g.grade} (${g.label})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Exam Weighting Pattern</label>
                <select id="subj-scheme" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-2.5 py-1.5 border text-xs font-medium">
                  ${Object.entries(ASSESSMENT_SCHEMES).map(([key, s]) => `
                    <option value="${key}" ${key === (values.assessmentScheme || '20-30-50') ? 'selected' : ''}>${s.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            <p class="text-[11px] text-gray-400">Don't worry if you don't know your scheme yet—the standard college pattern (CA + Midterm + End Term) is pre-configured.</p>
          </div>
        </div>

        <div class="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
          ${subjectToEdit ? `<button type="button" id="btn-cancel-edit" class="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 transition-colors">Cancel</button>` : ''}
          <button type="submit" class="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-1.5">
            <span>${subjectToEdit ? '✓' : '+'}</span>
            <span>${subjectToEdit ? 'Save Changes' : 'Add Course (Press Enter)'}</span>
          </button>
        </div>
      </form>

      <!-- Added Subjects List with 1-Click Inline Difficulty Switcher -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📚</span> Your Courses (${state.subjects.length})
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Click Easy / Med / Hard directly on any subject to adjust it:</p>
          </div>
          ${state.subjects.length > 0 ? `
            <button type="button" id="btn-clear-subjects" class="text-xs text-rose-600 dark:text-rose-400 hover:underline">
              Clear All
            </button>
          ` : ''}
        </div>

        <div class="space-y-2.5" id="subject-list">
          ${state.subjects.length === 0 ? `
            <div class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40">
              <span class="text-2xl block mb-1">📖</span>
              <p class="text-gray-600 dark:text-gray-300 text-sm font-semibold">No courses added yet</p>
              <p class="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Click a 1-click preset above or type a name to begin!</p>
            </div>
          ` : ''}
          ${state.subjects.map(s => {
            return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs gap-3">
              <!-- Subject details -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h5 class="font-bold text-gray-900 dark:text-white text-sm truncate">${s.name}</h5>
                  <span class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">${s.credits} Credits</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">Target Grade: <strong class="text-gray-700 dark:text-gray-300">${s.expectedGrade}</strong></div>
              </div>

              <!-- 1-Click Inline Difficulty Selector on the Card -->
              <div class="flex items-center gap-2">
                <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-900">
                  <button type="button" class="inline-diff-btn px-2 py-1 text-[11px] font-bold rounded-md transition-all ${s.difficulty === 'easy' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}" data-id="${s.id}" data-diff="easy">
                    Easy
                  </button>
                  <button type="button" class="inline-diff-btn px-2 py-1 text-[11px] font-bold rounded-md transition-all ${s.difficulty === 'medium' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}" data-id="${s.id}" data-diff="medium">
                    Med
                  </button>
                  <button type="button" class="inline-diff-btn px-2 py-1 text-[11px] font-bold rounded-md transition-all ${s.difficulty === 'hard' ? 'bg-rose-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}" data-id="${s.id}" data-diff="hard">
                    Hard
                  </button>
                </div>

                <button class="delete-btn text-gray-400 hover:text-rose-600 p-1 rounded transition-colors" data-id="${s.id}" title="Remove subject">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
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
  
  // Difficulty button listeners on the form
  contentDiv.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedDiff = btn.dataset.key;
      contentDiv.querySelectorAll('.diff-btn').forEach(b => {
        const k = b.dataset.key;
        if (k === selectedDiff) {
          const colors = k === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : (k === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-500' : 'bg-rose-50 text-rose-700 border-rose-500');
          b.className = `diff-btn flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${colors} border-2 shadow-xs`;
        } else {
          b.className = `diff-btn flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300`;
        }
      });
    });
  });

  // Credit pills listeners
  contentDiv.querySelectorAll('.credit-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const cr = btn.dataset.cr;
      const input = contentDiv.querySelector('#subj-credits');
      if (input) input.value = cr;
      contentDiv.querySelectorAll('.credit-pill').forEach(b => {
        if (b.dataset.cr === cr) {
          b.className = 'credit-pill px-3 py-1.5 text-xs font-bold rounded-lg border transition-all bg-indigo-600 text-white border-indigo-600 shadow-xs';
        } else {
          b.className = 'credit-pill px-3 py-1.5 text-xs font-bold rounded-lg border transition-all bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300';
        }
      });
    });
  });

  // Toggle Advanced Panel
  const toggleAdvBtn = contentDiv.querySelector('#btn-toggle-advanced');
  const advPanel = contentDiv.querySelector('#advanced-panel');
  const advArrow = contentDiv.querySelector('#adv-arrow');
  if (toggleAdvBtn && advPanel) {
    toggleAdvBtn.addEventListener('click', () => {
      const isHidden = advPanel.classList.toggle('hidden');
      advArrow.textContent = isHidden ? '▶' : '▼';
    });
  }

  // Preset button listeners
  contentDiv.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.preset;
      loadPreset(presetId);
    });
  });

  // Quick fill chips: Pre-fills the input box so the user can easily adjust difficulty or credits before adding!
  contentDiv.querySelectorAll('.chip-fill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const credits = btn.dataset.credits;
      const nameInput = contentDiv.querySelector('#subj-name');
      const creditsInput = contentDiv.querySelector('#subj-credits');

      if (nameInput) {
        nameInput.value = name;
        nameInput.focus();
      }
      if (creditsInput) {
        creditsInput.value = credits;
        // highlight matching credit pill
        contentDiv.querySelectorAll('.credit-pill').forEach(b => {
          if (b.dataset.cr === credits) {
            b.className = 'credit-pill px-3 py-1.5 text-xs font-bold rounded-lg border transition-all bg-indigo-600 text-white border-indigo-600 shadow-xs';
          } else {
            b.className = 'credit-pill px-3 py-1.5 text-xs font-bold rounded-lg border transition-all bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300';
          }
        });
      }
    });
  });

  // 1-Click Inline Difficulty Switcher on cards!
  contentDiv.querySelectorAll('.inline-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const diff = btn.dataset.diff;
      updateSubject(id, { difficulty: diff });
    });
  });

  // Clear all subjects listener
  const clearBtn = contentDiv.querySelector('#btn-clear-subjects');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all courses from the list?')) {
        setState({ subjects: [] });
      }
    });
  }

  // Form Submission
  const form = contentDiv.querySelector('#subject-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = contentDiv.querySelector('#subj-name');
    const name = nameInput.value.trim();
    const credits = parseInt(contentDiv.querySelector('#subj-credits').value, 10) || 3;
    const expectedGrade = contentDiv.querySelector('#subj-grade')?.value || 'A';
    const assessmentScheme = contentDiv.querySelector('#subj-scheme')?.value || '20-30-50';

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

  contentDiv.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeSubject(e.currentTarget.dataset.id);
      if (editingSubjectId === e.currentTarget.dataset.id) {
        editingSubjectId = null;
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
