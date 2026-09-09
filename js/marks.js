// ──────────────────────────────────────────────
//  GradePilot · marks.js
//  Marks Calculator & Exam Target Engine
// ──────────────────────────────────────────────

import { getState, updateSubjectMarks, updateSubject } from './state.js';
import { evaluateSubjectMarks } from './engine.js';
import { getDifficulty, ASSESSMENT_SCHEMES, round, getDaysRemaining } from './utils.js';

export function renderMarksCalculator(container) {
  if (!container) return;
  const state = getState();
  const subjects = state.subjects;

  if (!subjects || subjects.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p class="font-medium">No subjects found to calculate marks.</p>
        <p class="text-sm mt-1 text-slate-400">Add subjects first in setup.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="space-y-6">';

  // Header info banner
  html += `
    <div class="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            <span>🧮</span> Version 2 Marks Engine
          </span>
          <h2 class="text-2xl font-bold">Marks & Exam Target Analyzer</h2>
          <p class="text-violet-100 text-sm mt-1 max-w-2xl">
            Enter your current internal marks (CA & Midterm). GradePilot calculates your projected final score and shows exactly what marks you need on the End Term exam.
          </p>
        </div>
      </div>
    </div>
  `;

  // Subject Cards for Marks Breakdown
  html += '<div class="grid grid-cols-1 gap-6">';

  subjects.forEach(sub => {
    const evalData = evaluateSubjectMarks(sub);
    const diff = getDifficulty(sub.difficulty);
    const marks = sub.marks || {
      ca: { scored: null, max: 20 },
      midterm: { scored: null, max: 30 },
      endterm: { scored: null, max: 50, target: null }
    };

    const schemeKey = sub.assessmentScheme || '20-30-50';
    const scheme = ASSESSMENT_SCHEMES[schemeKey] || ASSESSMENT_SCHEMES['20-30-50'];

    const caScored = marks.ca.scored !== null ? marks.ca.scored : '';
    const midScored = marks.midterm.scored !== null ? marks.midterm.scored : '';
    const endTarget = marks.endterm.target !== null ? marks.endterm.target : (marks.endterm.scored !== null ? marks.endterm.scored : '');

    // Projected Grade styling
    let gradeBadgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    if (evalData.projectedGrade === 'O' || evalData.projectedGrade === 'A+') {
      gradeBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
    } else if (evalData.projectedGrade === 'A' || evalData.projectedGrade === 'B+') {
      gradeBadgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700';
    } else if (evalData.projectedGrade === 'B' || evalData.projectedGrade === 'C') {
      gradeBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
    } else {
      gradeBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700';
    }

    const completionPercent = evalData.totalCourseMax > 0 && evalData.totalProjectedMarks !== null
      ? Math.min(Math.round((evalData.totalProjectedMarks / evalData.totalCourseMax) * 100), 100)
      : 0;

    const daysLeft = getDaysRemaining(sub.examDate);
    let countdownPill = '';
    if (daysLeft !== null) {
      if (daysLeft < 0) {
        countdownPill = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-700">Exam completed</span>';
      } else if (daysLeft <= 2) {
        countdownPill = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 animate-pulse">🔥 In ' + daysLeft + ' days!</span>';
      } else if (daysLeft <= 7) {
        countdownPill = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">⏳ In ' + daysLeft + ' days</span>';
      } else {
        countdownPill = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">🗓️ In ' + daysLeft + ' days</span>';
      }
    }

    html += `
      <div class="card p-5 sm:p-6 transition-all duration-200 border border-slate-200 dark:border-slate-700">
        <!-- Subject Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">${sub.name}</h3>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                ${sub.credits} Credits
              </span>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-${diff.color}-100 text-${diff.color}-800 dark:bg-${diff.color}-900/30 dark:text-${diff.color}-300">
                ${diff.label}
              </span>
              ${countdownPill}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3 flex-wrap">
              <span>Attempted: <strong>${evalData.currentScored} / ${evalData.currentMax}</strong></span>
              <span>•</span>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <span>🗓️ Exam Date:</span>
                <input type="date" value="${sub.examDate || ''}" data-subid="${sub.id}"
                  class="exam-date-input text-xs px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              </label>
            </div>
          </div>

          <!-- Grade Summary Pill -->
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-xs text-slate-400 font-medium">Projected Total</div>
              <div class="text-sm font-bold text-slate-800 dark:text-slate-200">
                ${evalData.totalProjectedMarks !== null ? evalData.totalProjectedMarks : '—'} / ${evalData.totalCourseMax}
                <span class="text-xs text-slate-400 font-normal">(${evalData.projectedPercentage !== null ? evalData.projectedPercentage + '%' : '—'})</span>
              </div>
            </div>
            <div class="px-3 py-1.5 rounded-xl font-extrabold text-base ${gradeBadgeColor} shadow-xs">
              ${evalData.projectedGrade || sub.expectedGrade}
            </div>
          </div>
        </div>

        <!-- Marks Input Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
          <!-- CA Component -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                📝 Continuous (CA)
              </label>
              <span class="text-[11px] text-slate-400">Max: ${evalData.caMax}</span>
            </div>
            <div class="flex items-center gap-2">
              <input type="number" step="0.5" min="0" max="${evalData.caMax}" value="${caScored}"
                data-subid="${sub.id}" data-comp="ca"
                class="mark-input w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="0 - ${evalData.caMax}">
              <span class="text-xs font-bold text-slate-400">/ ${evalData.caMax}</span>
            </div>
          </div>

          <!-- Midterm Component -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                📖 Midterm Exam
              </label>
              <span class="text-[11px] text-slate-400">Max: ${evalData.midMax}</span>
            </div>
            <div class="flex items-center gap-2">
              <input type="number" step="0.5" min="0" max="${evalData.midMax}" value="${midScored}"
                data-subid="${sub.id}" data-comp="midterm"
                class="mark-input w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="0 - ${evalData.midMax}">
              <span class="text-xs font-bold text-slate-400">/ ${evalData.midMax}</span>
            </div>
          </div>

          <!-- End Term Target Component with Tactile Range Slider -->
          <div class="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1">
                <span>🎯</span> End Term (Target)
              </label>
              <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Max: ${evalData.endtermMax}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="number" step="0.5" min="0" max="${evalData.endtermMax}" value="${endTarget}"
                data-subid="${sub.id}" data-comp="endterm"
                class="mark-input endterm-num-input w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-900 text-indigo-950 dark:text-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Target / ${evalData.endtermMax}">
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">/ ${evalData.endtermMax}</span>
            </div>
            <!-- Tactile Range Slider -->
            <div class="pt-1">
              <input type="range" min="0" max="${evalData.endtermMax}" step="0.5" value="${endTarget || 0}"
                data-subid="${sub.id}"
                class="endterm-slider w-full h-1.5 bg-indigo-200 dark:bg-indigo-900/60 rounded-lg appearance-none cursor-pointer accent-indigo-600">
              <div class="flex justify-between text-[10px] text-indigo-400 mt-1">
                <span>0</span>
                <span>🛡️ Safe: ${Math.round(evalData.endtermMax * 0.3)}</span>
                <span>Max: ${evalData.endtermMax}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- What do I need in End Term: Target Engine -->
        <div class="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔮</span> What do you need in End Term? (out of ${evalData.endtermMax}):
            </span>
            <span class="text-[11px] text-slate-400">CA + Midterm: ${evalData.currentScored}/${evalData.currentMax}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            ${evalData.endtermRequirements.map(req => {
              let statusText = '';
              let chipClass = '';
              const isCurrent = req.isCurrentProjected;

              if (req.needed === null) {
                statusText = 'Unreachable';
                chipClass = 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-600 border-slate-200 dark:border-slate-700';
              } else if (req.needed === 0) {
                statusText = 'Secured 🎉';
                chipClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold';
              } else {
                statusText = `Need ${req.needed}`;
                chipClass = isCurrent
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              }

              return `
                <div class="p-2 rounded-lg border text-center transition-all ${chipClass}">
                  <div class="text-xs font-bold">${req.grade} (${req.minMarks}%)</div>
                  <div class="text-[11px] mt-0.5">${statusText}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>'; // end grid
  html += '</div>'; // end container

  container.innerHTML = html;

  // Attach event listeners for real-time marks inputs
  const inputs = container.querySelectorAll('.mark-input');
  inputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const subId = e.target.getAttribute('data-subid');
      const comp = e.target.getAttribute('data-comp');
      const rawVal = e.target.value.trim();
      const val = rawVal === '' ? null : Number(rawVal);

      if (comp === 'endterm') {
        updateSubjectMarks(subId, 'endterm', { target: val, scored: val });
      } else {
        updateSubjectMarks(subId, comp, { scored: val });
      }
    });
  });

  // Attach event listeners for tactile range sliders
  const sliders = container.querySelectorAll('.endterm-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const subId = e.target.getAttribute('data-subid');
      const val = Number(e.target.value);
      // Update the sister number input visually
      const numInput = container.querySelector(`.endterm-num-input[data-subid="${subId}"]`);
      if (numInput) numInput.value = val;
    });

    slider.addEventListener('change', (e) => {
      const subId = e.target.getAttribute('data-subid');
      const val = Number(e.target.value);
      updateSubjectMarks(subId, 'endterm', { target: val, scored: val });
    });
  });

  // Attach event listeners for exam date inputs
  const dateInputs = container.querySelectorAll('.exam-date-input');
  dateInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const subId = e.target.getAttribute('data-subid');
      const val = e.target.value || null;
      updateSubject(subId, { examDate: val });
    });
  });
}
