import { getState, setState, resetState, subscribe } from './state.js';
import {
  calculateSGPA, totalCredits, getRiskSummary, getSubjectRisk,
  getAcademicHealth, getBestImprovements,
  getDifficultyCreditsMatrix, getStudyPlan
} from './engine.js';
import { getDifficulty, RISK } from './utils.js';

export function renderDashboard(container) {
  function render() {
    const state = getState();
    const { subjects, targetSGPA, studyHoursPerWeek } = state;

    if (subjects.length === 0) {
      container.innerHTML = `<div class="p-8 text-center"><p class="text-gray-500 dark:text-gray-400">No subjects found. Please go back and add subjects.</p></div>`;
      return;
    }

    const currentSGPA = calculateSGPA(subjects);
    const totCredits = totalCredits(subjects);
    const risk = getRiskSummary(subjects, targetSGPA);
    const health = getAcademicHealth(subjects, targetSGPA);
    const improvements = getBestImprovements(subjects, targetSGPA);
    const matrix = getDifficultyCreditsMatrix(subjects, targetSGPA);
    const studyPlan = getStudyPlan(subjects, studyHoursPerWeek);

    const progressRatio = Math.min((currentSGPA / targetSGPA) * 100, 100);
    let progressColor = 'bg-rose-500';
    if (progressRatio >= 95) progressColor = 'bg-emerald-500';
    else if (progressRatio >= 85) progressColor = 'bg-amber-500';

    const gap = targetSGPA - currentSGPA;
    const situationText = gap > 0 
      ? `You need approximately +${gap.toFixed(2)} SGPA to reach your target.`
      : `Congratulations! You are on track to meet or exceed your target.`;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 dark:text-gray-100">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">🚀 Dashboard</h1>
          <div class="flex gap-3">
            <button id="btn-edit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm text-sm font-medium transition-colors">
              Edit Subjects
            </button>
            <button id="btn-reset" class="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 rounded-md shadow-sm text-sm font-medium transition-colors">
              Reset
            </button>
          </div>
        </div>

        <!-- Section 1 & 2: Overview & Situation -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">📊 Semester Overview</h2>
            <div class="flex justify-between items-end mb-2">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Expected SGPA</p>
                <p class="text-4xl font-bold text-gray-900 dark:text-white">${currentSGPA.toFixed(2)}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Target SGPA</p>
                <p class="text-4xl font-bold text-gray-900 dark:text-white">${targetSGPA.toFixed(2)}</p>
              </div>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
              <div class="${progressColor} h-4 rounded-full transition-all duration-500" style="width: ${progressRatio}%"></div>
            </div>
            <div class="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Credits: ${totCredits}</span>
              <span class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Subjects: ${subjects.length}</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">🎯 Your Situation</h2>
            <p class="text-gray-700 dark:text-gray-300 font-medium mb-4">${situationText}</p>
            <div class="space-y-3">
              <div class="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg text-rose-700 dark:text-rose-400">
                <span>🔴 High Risk</span>
                <span class="font-bold">${risk.counts.high}</span>
              </div>
              <div class="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg text-amber-700 dark:text-amber-400">
                <span>🟡 Medium Risk</span>
                <span class="font-bold">${risk.counts.medium}</span>
              </div>
              <div class="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg text-emerald-700 dark:text-emerald-400">
                <span>🟢 Safe</span>
                <span class="font-bold">${risk.counts.low}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Section 3: Academic Health -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">🏥 Academic Health</h2>
            <div class="flex items-center gap-6 mb-6">
              <div class="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-gray-100 dark:border-gray-700">
                <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" stroke-width="8" class="text-gray-200 dark:text-gray-700"></circle>
                  <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" stroke-width="8" class="${health.tailwind} transition-all duration-1000" stroke-dasharray="276" stroke-dashoffset="${276 - (276 * health.score) / 100}"></circle>
                </svg>
                <div class="text-center">
                  <span class="text-2xl font-bold block ${health.tailwind}">${health.score}</span>
                </div>
              </div>
              <div>
                <p class="text-xl font-bold ${health.tailwind}">${health.healthLabel}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Score out of 100</p>
              </div>
            </div>
            <div class="space-y-3 text-sm">
              <div>
                <div class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"><span>Target Proximity</span><span>${health.breakdown.sgpaScore}/40</span></div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${(health.breakdown.sgpaScore/40)*100}%"></div></div>
              </div>
              <div>
                <div class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"><span>Risk Control</span><span>${health.breakdown.riskScore}/20</span></div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${(health.breakdown.riskScore/20)*100}%"></div></div>
              </div>
              <div>
                <div class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"><span>Improvement Headroom</span><span>${health.breakdown.potentialScore}/20</span></div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${(health.breakdown.potentialScore/20)*100}%"></div></div>
              </div>
              <div>
                <div class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"><span>Grade Balance</span><span>${health.breakdown.balanceScore}/20</span></div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${(health.breakdown.balanceScore/20)*100}%"></div></div>
              </div>
            </div>
          </div>

          <!-- Section 5: Best Opportunities -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">🔥 Best Opportunities</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ${improvements.recommended.changes.length > 0 
                ? \`Improving these \${improvements.recommended.changes.length} subjects could get you to \${improvements.recommended.projectedSGPA.toFixed(2)} SGPA.\` 
                : \`You are already hitting your target! Keep it up.\`}
            </p>
            <div class="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              ${improvements.opportunities.slice(0, 5).map(opp => `
                <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center border border-gray-100 dark:border-gray-700">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">${opp.subjectName}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Upgrade ${opp.fromGrade} → ${opp.toGrade}</p>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                      +${opp.impact.toFixed(2)} SGPA
                    </span>
                  </div>
                </div>
              `).join('')}
              ${improvements.opportunities.length === 0 ? '<p class="text-sm text-gray-500">No further upgrades possible.</p>' : ''}
            </div>
          </div>
        </div>

        <!-- Section 4: Subject Cards Grid -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">📚 Subject Priorities</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${subjects.map(sub => {
              const riskLevel = getSubjectRisk(sub, targetSGPA);
              const r = RISK[riskLevel];
              const diff = getDifficulty(sub.difficulty);
              const pScore = matrix.find(m => m.id === sub.id).priorityScore;
              return `
                <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow relative">
                  <div class="absolute top-4 right-4 ${r.tailwind}">${r.emoji}</div>
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-6 truncate" title="${sub.name}">${sub.name}</h3>
                  <div class="flex gap-2 mb-3">
                    <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded font-medium">${sub.credits} CR</span>
                    <span class="px-2 py-0.5 bg-${diff.color}-100 dark:bg-${diff.color}-900/30 text-${diff.color}-700 dark:text-${diff.color}-300 text-xs rounded font-medium">${diff.label}</span>
                    <span class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded font-medium">Grade: ${sub.expectedGrade}</span>
                  </div>
                  <div class="mt-2">
                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Priority Score</span>
                      <span>${pScore.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${Math.min((pScore/10)*100, 100)}%"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Section 6: Difficulty × Credits Matrix -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-x-auto">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">🎯 Difficulty vs Credits</h2>
            <div class="relative w-full min-w-[400px] h-64 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 pl-2 pb-2 mb-6 mt-4">
              <div class="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">Difficulty</div>
              <div class="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">Credits</div>
              
              <!-- Y-axis labels -->
              <div class="absolute left-[-45px] top-[10%] text-xs text-gray-500 text-right w-10">Hard</div>
              <div class="absolute left-[-45px] top-[50%] -translate-y-1/2 text-xs text-gray-500 text-right w-10">Med</div>
              <div class="absolute left-[-45px] bottom-[10%] text-xs text-gray-500 text-right w-10">Easy</div>

              <!-- X-axis labels -->
              ${[1,2,3,4,5,6].map(c => `<div class="absolute bottom-[-20px] text-xs text-gray-500" style="left: ${((c-1)/5)*100}%">${c}</div>`).join('')}

              <!-- Data Points -->
              ${matrix.map(m => {
                const x = ((m.credits - 1) / 5) * 100;
                let yPos = 50;
                if (m.difficulty === 'hard') yPos = 10;
                else if (m.difficulty === 'easy') yPos = 90;
                
                // Add slight jitter for identical points to prevent complete overlap (optional visual tweak, keep simple for now)
                const rColor = m.risk === 'high' ? 'bg-rose-500' : m.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
                
                return `
                  <div class="absolute w-4 h-4 rounded-full ${rColor} border-2 border-white dark:border-gray-800 transform -translate-x-1/2 -translate-y-1/2 shadow-sm cursor-pointer group hover:z-10" style="left: ${x}%; top: ${yPos}%;">
                    <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                      ${m.name} (${m.credits}CR, ${m.expectedGrade})
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            ${matrix.length > 0 ? (() => {
              const highestPriority = [...matrix].sort((a,b)=>b.priorityScore-a.priorityScore)[0];
              return `<p class="text-sm font-medium text-indigo-600 dark:text-indigo-400">Focus first: ${highestPriority.name}</p>`;
            })() : ''}
          </div>

          <!-- Section 7: Study Time Allocation -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">📅 Study Time Allocation</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Study time is weighted toward subjects where improvement has the greatest impact. (Total: ${studyHoursPerWeek} hrs/week)
            </p>
            <div class="space-y-4">
              ${studyPlan.map((plan, i) => {
                const priorityClass = i < 2 ? 'text-rose-500' : (i < 4 ? 'text-amber-500' : 'text-emerald-500');
                const emoji = i < 2 ? '🔥' : (i < 4 ? '🟡' : '🟢');
                const percent = (plan.hours / studyHoursPerWeek) * 100;
                return `
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="font-medium text-gray-800 dark:text-gray-200 truncate pr-4" title="${plan.name}">${emoji} ${plan.name}</span>
                      <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">${plan.hours.toFixed(1)} hrs</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-indigo-500 h-2 rounded-full" style="width: ${percent}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Simulator Mount Point -->
        <div id="simulator-mount" class="mt-6"></div>
      </div>
    `;

    // Event Listeners
    container.querySelector('#btn-edit').addEventListener('click', () => {
      setState({ view: 'wizard', wizardStep: 2 });
    });

    container.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
        resetState();
      }
    });

    // Re-render the simulator into the new mount point
    const simMount = container.querySelector('#simulator-mount');
    if (simMount && typeof window.__renderSimulator === 'function') {
      window.__renderSimulator(simMount);
    }
  }

  // Initial render
  render();

  // Subscribe to changes — re-render on any state update
  subscribe(render);
}
