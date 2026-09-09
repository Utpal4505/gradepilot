import { getState, setState, resetState, subscribe } from './state.js';
import {
  calculateSGPA, totalCredits, getRiskSummary, getSubjectRisk,
  getAcademicHealth, getBestImprovements,
  getDifficultyCreditsMatrix, getStudyPlan
} from './engine.js';
import { getDifficulty, RISK } from './utils.js';
import { renderMarksCalculator } from './marks.js';

export function renderDashboard(container) {
  function render() {
    const state = getState();
    const { subjects, targetSGPA, studyHoursPerWeek, activeTab = 'overview' } = state;

    if (subjects.length === 0) {
      container.innerHTML = '<div class="p-8 text-center"><p class="text-slate-500 dark:text-slate-400">No subjects found. Please go back and add subjects.</p></div>';
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
      ? 'You need approximately <strong>+' + gap.toFixed(2) + ' SGPA</strong> to reach your target.'
      : '\u2705 Congratulations! You are on track to meet or exceed your target.';

    let html = '<div class="space-y-6">';

    // Header with title and actions
    html += '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">';
    html += '<div>';
    html += '<h1 class="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">\uD83D\uDE80 Academic Command Center</h1>';
    html += '<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Live Semester Strategy & Exam Target Engine</p>';
    html += '</div>';
    html += '<div class="flex gap-2">';
    html += '<button id="btn-edit" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-xs sm:text-sm shadow-xs flex items-center gap-1.5"><span>✏️</span> Edit Subjects</button>';
    html += '<button id="btn-reset" class="px-3.5 py-2 bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs sm:text-sm font-medium transition-colors">Reset</button>';
    html += '</div></div>';

    // Tabs Switcher
    const isOverview = activeTab === 'overview';
    const isMarks = activeTab === 'marks';

    html += '<div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-max">';
    html += '<button id="tab-overview" class="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ' +
      (isOverview ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900') + '">';
    html += '<span>📊</span> Overview & Strategy';
    html += '</button>';

    html += '<button id="tab-marks" class="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ' +
      (isMarks ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900') + '">';
    html += '<span>🧮</span> Marks & Exam Targets (V2)';
    html += '</button>';
    html += '</div>';

    if (isMarks) {
      // Marks Calculator View
      html += '<div id="marks-mount" class="mt-4"></div>';
    } else {
      // Overview View
      // Overview + Situation row
      html += '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">';

    // Overview card
    html += '<div class="col-span-1 lg:col-span-2 card p-6">';
    html += '<h2 class="text-lg font-semibold mb-6 flex items-center gap-2">\uD83D\uDCCA Semester Overview</h2>';
    html += '<div class="flex justify-between items-end mb-3">';
    html += '<div><p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Expected SGPA</p>';
    html += '<p class="text-4xl font-bold text-slate-900 dark:text-white">' + currentSGPA.toFixed(2) + '</p></div>';
    html += '<div class="text-right"><p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Target SGPA</p>';
    html += '<p class="text-4xl font-bold text-slate-900 dark:text-white">' + targetSGPA.toFixed(2) + '</p></div>';
    html += '</div>';
    html += '<div class="progress-bar mb-4"><div class="progress-bar-fill animate-progress ' + progressColor + '" style="width:' + progressRatio + '%"></div></div>';
    html += '<div class="flex gap-4 text-sm text-slate-500 dark:text-slate-400">';
    html += '<span class="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">' + totCredits + ' Credits</span>';
    html += '<span class="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">' + subjects.length + ' Subjects</span>';
    html += '</div></div>';

    // Situation card
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">\uD83C\uDFAF Your Situation</h2>';
    html += '<p class="text-slate-700 dark:text-slate-300 mb-4">' + situationText + '</p>';
    html += '<div class="space-y-3">';
    html += '<div class="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg text-rose-700 dark:text-rose-400"><span>\uD83D\uDD34 High Risk</span><span class="font-bold">' + risk.counts.high + '</span></div>';
    html += '<div class="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg text-amber-700 dark:text-amber-400"><span>\uD83D\uDFE1 Medium Risk</span><span class="font-bold">' + risk.counts.medium + '</span></div>';
    html += '<div class="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg text-emerald-700 dark:text-emerald-400"><span>\uD83D\uDFE2 Safe</span><span class="font-bold">' + risk.counts.low + '</span></div>';
    html += '</div></div>';

    html += '</div>'; // end grid

    // --- Section 3 & 5: Health + Opportunities ---
    html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">';

    // Academic Health
    const dashOffset = 276 - (276 * health.score) / 100;
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-6 flex items-center gap-2">\uD83C\uDFE5 Academic Health</h2>';
    html += '<div class="flex items-center gap-6 mb-6">';
    html += '<div class="relative w-24 h-24 flex-shrink-0">';
    html += '<svg viewBox="0 0 96 96" class="w-full h-full transform -rotate-90">';
    html += '<circle cx="48" cy="48" r="40" fill="none" stroke-width="8" class="stroke-slate-200 dark:stroke-slate-700"></circle>';
    html += '<circle cx="48" cy="48" r="40" fill="none" stroke-width="8" stroke-linecap="round" class="' + health.tailwind.replace('text-', 'stroke-') + '" stroke-dasharray="251" stroke-dashoffset="' + (251 - (251 * health.score) / 100) + '" style="transition: stroke-dashoffset 1s"></circle>';
    html += '</svg>';
    html += '<div class="absolute inset-0 flex items-center justify-center"><span class="text-2xl font-bold ' + health.tailwind + '">' + health.score + '</span></div>';
    html += '</div>';
    html += '<div><p class="text-xl font-bold ' + health.tailwind + '">' + health.healthLabel + '</p>';
    html += '<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Score out of 100</p></div>';
    html += '</div>';

    // Health breakdown bars
    const breakdowns = [
      { label: 'Target Proximity', val: health.breakdown.sgpaScore, max: 40 },
      { label: 'Risk Control', val: health.breakdown.riskScore, max: 20 },
      { label: 'Improvement Headroom', val: health.breakdown.potentialScore, max: 20 },
      { label: 'Grade Balance', val: health.breakdown.balanceScore, max: 20 },
    ];
    html += '<div class="space-y-3 text-sm">';
    for (const b of breakdowns) {
      const pct = (b.val / b.max) * 100;
      html += '<div>';
      html += '<div class="flex justify-between mb-1 text-slate-600 dark:text-slate-300"><span>' + b.label + '</span><span>' + b.val + '/' + b.max + '</span></div>';
      html += '<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div class="bg-primary-500 h-2 rounded-full" style="width:' + pct + '%"></div></div>';
      html += '</div>';
    }
    html += '</div></div>';

    // Best Opportunities
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">\uD83D\uDD25 Best Opportunities</h2>';

    if (improvements.recommended.changes.length > 0) {
      html += '<p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Improving these <strong>' + improvements.recommended.changes.length + '</strong> subjects could get you to <strong>' + improvements.recommended.projectedSGPA.toFixed(2) + ' SGPA</strong>.</p>';
    } else {
      html += '<p class="text-sm text-slate-600 dark:text-slate-400 mb-4">You are already hitting your target! Keep it up. \uD83C\uDF89</p>';
    }

    html += '<div class="space-y-3 max-h-64 overflow-y-auto pr-2">';
    const topOpps = improvements.opportunities.slice(0, 6);
    for (const opp of topOpps) {
      html += '<div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-700">';
      html += '<div><p class="font-semibold text-slate-900 dark:text-slate-100">' + opp.subjectName + '</p>';
      html += '<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">' + opp.fromGrade + ' \u2192 ' + opp.toGrade + '</p></div>';
      html += '<span class="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded">+' + opp.impact.toFixed(2) + ' SGPA</span>';
      html += '</div>';
    }
    if (topOpps.length === 0) {
      html += '<p class="text-sm text-slate-500">No further upgrades possible.</p>';
    }
    html += '</div></div>';

    html += '</div>'; // end grid

    // --- Section 4: Subject Cards ---
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-6 flex items-center gap-2">\uD83D\uDCDA Subject Priorities</h2>';
    html += '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">';

    for (const sub of subjects) {
      const riskLevel = getSubjectRisk(sub, targetSGPA);
      const r = RISK[riskLevel];
      const diff = getDifficulty(sub.difficulty);
      const matrixEntry = matrix.find(m => m.id === sub.id);
      const pScore = matrixEntry ? matrixEntry.priorityScore : 0;
      const pWidth = Math.min((pScore / 10) * 100, 100);

      html += '<div class="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-shadow relative card-hover">';
      html += '<div class="absolute top-4 right-4 ' + r.tailwind + '">' + r.emoji + '</div>';
      html += '<h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-2 pr-6 truncate" title="' + sub.name + '">' + sub.name + '</h3>';
      html += '<div class="flex flex-wrap gap-2 mb-3">';
      html += '<span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded font-medium">' + sub.credits + ' CR</span>';
      html += '<span class="px-2 py-0.5 bg-' + diff.color + '-100 dark:bg-' + diff.color + '-900/30 text-' + diff.color + '-700 dark:text-' + diff.color + '-300 text-xs rounded font-medium">' + diff.label + '</span>';
      html += '<span class="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-medium">Grade: ' + sub.expectedGrade + '</span>';
      html += '</div>';
      html += '<div class="mt-2">';
      html += '<div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1"><span>Priority Score</span><span>' + pScore.toFixed(2) + '</span></div>';
      html += '<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5"><div class="bg-primary-500 h-1.5 rounded-full" style="width:' + pWidth + '%"></div></div>';
      html += '</div></div>';
    }

    html += '</div></div>';

    // --- Section 6 & 7: Matrix + Study Plan ---
    html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">';

    // Difficulty × Credits Matrix
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">\uD83E\uDDE0 Difficulty \u00D7 Credits</h2>';
    html += '<div class="relative w-full h-64 border-l-2 border-b-2 border-slate-300 dark:border-slate-600 ml-12 mb-8 mt-4">';

    // Y-axis labels
    html += '<div class="absolute -left-12 top-[10%] text-xs text-slate-500 text-right w-10">Hard</div>';
    html += '<div class="absolute -left-12 top-[50%] -translate-y-1/2 text-xs text-slate-500 text-right w-10">Med</div>';
    html += '<div class="absolute -left-12 bottom-[10%] text-xs text-slate-500 text-right w-10">Easy</div>';

    // X-axis labels
    for (let c = 1; c <= 6; c++) {
      const xPos = ((c - 1) / 5) * 100;
      html += '<div class="absolute -bottom-6 text-xs text-slate-500" style="left:' + xPos + '%">' + c + '</div>';
    }

    // Data points
    for (const m of matrix) {
      const x = ((m.credits - 1) / 5) * 100;
      let yPos = 50;
      if (m.difficulty === 'hard') yPos = 10;
      else if (m.difficulty === 'easy') yPos = 90;

      const dotColor = m.risk === 'high' ? 'bg-rose-500' : m.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';

      html += '<div class="absolute w-5 h-5 rounded-full ' + dotColor + ' border-2 border-white dark:border-slate-800 transform -translate-x-1/2 -translate-y-1/2 shadow-sm cursor-pointer group hover:scale-125 hover:z-10 transition-transform" style="left:' + x + '%;top:' + yPos + '%">';
      html += '<div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">' + m.name + ' (' + m.credits + 'CR, ' + m.expectedGrade + ')</div>';
      html += '</div>';
    }

    html += '</div>'; // end matrix

    // Focus recommendation
    if (matrix.length > 0) {
      const sorted = [...matrix].sort((a, b) => b.priorityScore - a.priorityScore);
      html += '<p class="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">\uD83C\uDFAF Focus first: <strong>' + sorted[0].name + '</strong></p>';
    }
    html += '</div>';

    // Study Time Allocation
    html += '<div class="card p-6">';
    html += '<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">\uD83D\uDCC5 Study Time Allocation</h2>';
    html += '<p class="text-sm text-slate-600 dark:text-slate-400 mb-6">Study time is weighted toward subjects where improvement has the greatest impact. (Total: ' + studyHoursPerWeek + ' hrs/week)</p>';
    html += '<div class="space-y-4">';

    studyPlan.forEach((plan, i) => {
      const emoji = i < 2 ? '\uD83D\uDD25' : (i < 4 ? '\uD83D\uDFE1' : '\uD83D\uDFE2');
      const pct = (plan.hours / studyHoursPerWeek) * 100;
      const barColor = i < 2 ? 'bg-rose-500' : (i < 4 ? 'bg-amber-500' : 'bg-emerald-500');

      html += '<div>';
      html += '<div class="flex justify-between text-sm mb-1">';
      html += '<span class="font-medium text-slate-800 dark:text-slate-200 truncate pr-4" title="' + plan.name + '">' + emoji + ' ' + plan.name + '</span>';
      html += '<span class="text-slate-500 dark:text-slate-400 whitespace-nowrap">' + plan.hours.toFixed(1) + ' hrs</span>';
      html += '</div>';
      html += '<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div class="' + barColor + ' h-2 rounded-full" style="width:' + pct + '%"></div></div>';
      html += '</div>';
    });

      html += '</div></div>';
      html += '</div>'; // end grid

      // Simulator mount point (lives inside Overview)
      html += '<div id="simulator-mount" class="mt-6"></div>';
    } // end overview check

    html += '</div>'; // end wrapper

    container.innerHTML = html;

    // Event Listeners
    container.querySelector('#btn-edit').addEventListener('click', () => {
      setState({ view: 'wizard', wizardStep: 2 });
    });

    container.querySelector('#btn-reset').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
        resetState();
      }
    });

    // Tab Listeners
    container.querySelector('#tab-overview').addEventListener('click', () => {
      setState({ activeTab: 'overview' });
    });

    container.querySelector('#tab-marks').addEventListener('click', () => {
      setState({ activeTab: 'marks' });
    });

    // Mount sub-modules
    if (isMarks) {
      const marksMount = container.querySelector('#marks-mount');
      if (marksMount) {
        renderMarksCalculator(marksMount);
      }
    } else {
      const simMount = container.querySelector('#simulator-mount');
      if (simMount && typeof window.__renderSimulator === 'function') {
        window.__renderSimulator(simMount);
      }
    }
  }

  // Initial render
  render();

  // Subscribe to changes
  subscribe(render);
}
