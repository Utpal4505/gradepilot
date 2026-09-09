import { getState, setState, addSubject, removeSubject, updateSubject, subscribe } from './state.js';
import { uid, SELECTABLE_GRADES, TARGET_OPTIONS, DIFFICULTY } from './utils.js';

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
    assessments: { ca: true, midterm: true, endterm: true },
    expectedGrade: 'A+'
  };

  const values = subjectToEdit || defaultValues;

  contentDiv.innerHTML = `
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add your subjects</h3>
    <p class="text-gray-500 dark:text-gray-400 mb-6">Tell us about your courses this semester.</p>

    <form id="subject-form" class="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
        <input type="text" id="subj-name" required value="${values.name}" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" placeholder="e.g. Data Structures">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
          <input type="number" id="subj-credits" required min="1" max="6" value="${values.credits}" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Grade</label>
          <select id="subj-grade" class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
            ${SELECTABLE_GRADES.map(g => `<option value="${g.grade}" ${g.grade === values.expectedGrade ? 'selected' : ''}>${g.grade} - ${g.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
        <div class="flex flex-wrap gap-2">
          ${Object.entries(DIFFICULTY).map(([key, diff]) => {
            const isSelected = values.difficulty === key;
            const baseClasses = 'px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors';
            const colors = isSelected 
              ? `bg-${diff.color}-100 text-${diff.color}-800 border-2 border-${diff.color}-500 dark:bg-${diff.color}-900/30 dark:text-${diff.color}-300` 
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            return `<div class="diff-btn ${baseClasses} ${colors}" data-key="${key}">${diff.label}</div>`;
          }).join('')}
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assessments</label>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" id="chk-ca" ${values.assessments.ca ? 'checked' : ''} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"> CA
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" id="chk-midterm" ${values.assessments.midterm ? 'checked' : ''} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"> Midterm
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" id="chk-endterm" ${values.assessments.endterm ? 'checked' : ''} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"> End Term
          </label>
        </div>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        ${subjectToEdit ? `<button type="button" id="btn-cancel-edit" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>` : ''}
        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          ${subjectToEdit ? 'Update Subject' : 'Add Subject'}
        </button>
      </div>
    </form>

    <div class="mt-8">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Added Subjects (${state.subjects.length})</h4>
      <div class="space-y-3" id="subject-list">
        ${state.subjects.length === 0 ? '<p class="text-gray-500 dark:text-gray-400 text-sm italic">No subjects added yet.</p>' : ''}
        ${state.subjects.map(s => {
          const diff = DIFFICULTY[s.difficulty];
          return `
          <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div>
              <div class="flex items-center gap-2">
                <h5 class="font-semibold text-gray-900 dark:text-white">${s.name}</h5>
                <span class="px-2 py-0.5 text-xs rounded-full bg-${diff.color}-100 text-${diff.color}-800 dark:bg-${diff.color}-900/30 dark:text-${diff.color}-300">${diff.label}</span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${s.credits} Credits • Target: ${s.expectedGrade}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="edit-btn text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium px-2 py-1" data-id="${s.id}">Edit</button>
              <button class="delete-btn text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 text-sm font-medium px-2 py-1" data-id="${s.id}">Delete</button>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Local form state for difficulty
  let selectedDiff = values.difficulty;
  
  contentDiv.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedDiff = e.target.dataset.key;
      contentDiv.querySelectorAll('.diff-btn').forEach(b => {
        const k = b.dataset.key;
        const d = DIFFICULTY[k];
        if (k === selectedDiff) {
          b.className = `diff-btn px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors bg-${d.color}-100 text-${d.color}-800 border-2 border-${d.color}-500 dark:bg-${d.color}-900/30 dark:text-${d.color}-300`;
        } else {
          b.className = `diff-btn px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600`;
        }
      });
    });
  });

  const form = contentDiv.querySelector('#subject-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contentDiv.querySelector('#subj-name').value.trim();
    const credits = parseInt(contentDiv.querySelector('#subj-credits').value, 10);
    const expectedGrade = contentDiv.querySelector('#subj-grade').value;
    const assessments = {
      ca: contentDiv.querySelector('#chk-ca').checked,
      midterm: contentDiv.querySelector('#chk-midterm').checked,
      endterm: contentDiv.querySelector('#chk-endterm').checked
    };

    if (!name) return;

    if (subjectToEdit) {
      updateSubject(editingSubjectId, {
        name, credits, difficulty: selectedDiff, assessments, expectedGrade, simulatedGrade: null
      });
      editingSubjectId = null;
    } else {
      addSubject({
        id: uid(),
        name, credits, difficulty: selectedDiff, assessments, expectedGrade, simulatedGrade: null
      });
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
