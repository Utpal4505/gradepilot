import { SELECTABLE_GRADES } from './utils.js';
import { getState, updateSubject, resetSimulations } from './state.js';
import { calculateSGPA, calculateSGPAImpact } from './engine.js';

export function renderSimulator(container) {
  if (!container) return;
  updateUI(container);
}

function updateUI(container) {
  const state = getState();
  const subjects = state.subjects;

  if (!subjects || subjects.length === 0) {
    container.innerHTML = '<div class="p-6 text-slate-500 dark:text-slate-400 text-center">No subjects available to simulate.</div>';
    return;
  }

  const currentSGPA = calculateSGPA(subjects, false);
  const simulatedSGPA = calculateSGPA(subjects, true);
  
  const deltaValue = simulatedSGPA - currentSGPA;
  const isPositive = deltaValue > 0.005; // avoid floating point jitter
  const isNegative = deltaValue < -0.005;
  const delta = Math.abs(deltaValue).toFixed(2);
  
  let deltaClass = 'text-slate-500 dark:text-slate-400';
  if (isPositive) deltaClass = 'text-emerald-500 dark:text-emerald-400';
  else if (isNegative) deltaClass = 'text-rose-500 dark:text-rose-400';
  
  const deltaSign = isPositive ? '+' : (isNegative ? '-' : '');

  const hasAnySimulation = subjects.some(s => s.simulatedGrade && s.simulatedGrade !== s.expectedGrade);

  let html = `
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full transition-colors duration-200">
      
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
          <span>😈</span> What-If Simulator
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm">
          Play with grades and see how your SGPA changes instantly
        </p>
      </div>

      <!-- Subjects List -->
      <div class="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
        ${subjects.map(sub => {
          const simulated = sub.simulatedGrade || sub.expectedGrade;
          const isSimulated = sub.simulatedGrade && sub.simulatedGrade !== sub.expectedGrade;
          
          let impactHTML = '';
          if (isSimulated) {
            const impactValue = calculateSGPAImpact(sub, sub.expectedGrade, simulated, subjects);
            const impPositive = impactValue > 0;
            const impNegative = impactValue < 0;
            const impClass = impPositive 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
              : (impNegative 
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' 
                  : 'text-slate-500 bg-slate-50 dark:bg-slate-700/50');
            const impSign = impPositive ? '+' : '';
            impactHTML = \`<span class="ml-auto text-xs font-semibold px-2 py-1 rounded-md \${impClass}">\${impSign}\${impactValue.toFixed(2)}</span>\`;
          }
          
          return \`
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border \${isSimulated ? 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50' : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'} transition-all duration-200">
              
              <!-- Subject Info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-800 dark:text-slate-200 truncate">\${sub.name}</div>
              </div>
              
              <!-- Simulation Controls -->
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="flex items-center justify-center w-10">
                  <span class="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-md shadow-sm">
                    \${sub.expectedGrade}
                  </span>
                </div>
                
                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
                
                <select data-id="\${sub.id}" class="sim-select bg-white dark:bg-slate-800 border \${isSimulated ? 'border-indigo-300 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 focus:ring-indigo-500' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-slate-500'} text-sm rounded-lg font-semibold focus:outline-none focus:ring-2 shadow-sm py-1.5 pl-3 pr-8 cursor-pointer transition-colors duration-200">
                  \${SELECTABLE_GRADES.map(g => \`
                    <option value="\${g.grade}" \${g.grade === simulated ? 'selected' : ''}>
                      \${g.grade}
                    </option>
                  \`).join('')}
                </select>
                
                <div class="w-14 flex justify-end shrink-0">
                  \${impactHTML}
                </div>
              </div>
              
            </div>
          \`;
        }).join('')}
      </div>

      <!-- Footer Summary -->
      <div class="pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
        <div class="flex flex-col">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">SGPA Impact</span>
          <div class="flex items-baseline gap-2">
            \${hasAnySimulation ? \`<span class="text-xl font-bold text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600">\${currentSGPA.toFixed(2)}</span>
            <span class="text-lg text-slate-400 dark:text-slate-500">→</span>\` : ''}
            <span class="text-3xl font-extrabold text-slate-800 dark:text-white transition-all duration-300">\${simulatedSGPA.toFixed(2)}</span>
            \${hasAnySimulation ? \`<span class="text-sm font-bold \${deltaClass} ml-1">(\${deltaSign}\${delta})</span>\` : ''}
          </div>
        </div>
        
        <button id="sim-reset-btn" class="\${!hasAnySimulation ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center gap-2" \${!hasAnySimulation ? 'disabled' : ''}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Reset All
        </button>
      </div>
      
    </div>
  `;

  // Render HTML
  container.innerHTML = html;

  // Attach Event Listeners
  const selects = container.querySelectorAll('.sim-select');
  selects.forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const val = e.target.value;
      const sub = subjects.find(s => s.id === id);
      if (sub) {
        const simulatedGrade = (val === sub.expectedGrade) ? null : val;
        updateSubject(id, { simulatedGrade });
      }
    });
  });

  const resetBtn = container.querySelector('#sim-reset-btn');
  if (resetBtn && hasAnySimulation) {
    resetBtn.addEventListener('click', () => {
      resetSimulations();
    });
  }
}
