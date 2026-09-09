// ──────────────────────────────────────────────
//  GradePilot · export.js
//  Share, Export, and Backup System (Upgrade D)
// ──────────────────────────────────────────────

import { getState, setState } from './state.js';
import { calculateSGPA, totalCredits, getAcademicHealth, getStudyPlan, getPriorityRanking } from './engine.js';
import { getDaysRemaining } from './utils.js';

/** Generate clean formatted plain-text summary for sharing */
export function generateTextSummary() {
  const state = getState();
  const { subjects, targetSGPA, studyHoursPerWeek } = state;
  const currentSGPA = calculateSGPA(subjects);
  const credits = totalCredits(subjects);
  const health = getAcademicHealth(subjects, targetSGPA);
  const studyPlan = getStudyPlan(subjects, studyHoursPerWeek);
  const topPriority = getPriorityRanking(subjects)[0];

  let text = `✈️ GradePilot — Academic Command Center\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🎯 Target SGPA:   ${targetSGPA.toFixed(2)}\n`;
  text += `📊 Expected SGPA: ${currentSGPA.toFixed(2)}\n`;
  text += `🏥 Academic Health: ${health.score}/100 (${health.healthLabel})\n`;
  text += `📚 Total Credits: ${credits} across ${subjects.length} subjects\n\n`;

  if (topPriority) {
    text += `⚡ Focus First: ${topPriority.name} (${topPriority.credits} Credits, ${topPriority.difficulty.toUpperCase()})\n\n`;
  }

  text += `📅 Weekly Study Plan (${studyHoursPerWeek} hrs total):\n`;
  studyPlan.forEach((plan, i) => {
    const icon = i < 2 ? '🔥' : (i < 4 ? '🟡' : '🟢');
    const days = getDaysRemaining(plan.examDate);
    const dateStr = days !== null ? (days <= 0 ? ' [Exam Today!]' : ` [Exam in ${days}d]`) : '';
    text += `${icon} ${plan.name}: ${plan.hours.toFixed(1)} hrs/wk${dateStr}\n`;
  });

  text += `\n🚀 Plan your semester with GradePilot!`;
  return text;
}

/** Export all data to a downloadable JSON file */
export function exportDataAsJSON() {
  const state = getState();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `gradepilot-backup-${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/** Import state from an uploaded JSON file */
export function importDataFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && Array.isArray(imported.subjects)) {
        setState(imported);
        if (callback) callback(true);
      } else {
        alert('Invalid GradePilot backup file format.');
        if (callback) callback(false);
      }
    } catch (err) {
      alert('Error parsing JSON backup file.');
      if (callback) callback(false);
    }
  };
  reader.readAsText(file);
}

/** Render the Share/Export Modal */
export function renderExportModal(container) {
  const textSummary = generateTextSummary();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'export-modal-overlay';
  modalOverlay.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in';

  modalOverlay.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📤</span> Share & Export Semester Plan
        </h3>
        <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Option 1: Copy Text Summary -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            📋 Formatted Summary (WhatsApp / Notion)
          </label>
          <button id="copy-summary-btn" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs">
            <span>Copy Text</span>
          </button>
        </div>
        <textarea readonly rows="6" class="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none select-all">${textSummary}</textarea>
        <span id="copy-feedback" class="hidden text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">✓ Copied to clipboard!</span>
      </div>

      <!-- Option 2 & 3: Print / PDF & Backup -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button id="print-plan-btn" class="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex flex-col items-center justify-center gap-1 text-center">
          <span class="text-lg">🖨️</span>
          <span>Print / Save as PDF</span>
        </button>

        <button id="backup-json-btn" class="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex flex-col items-center justify-center gap-1 text-center">
          <span class="text-lg">💾</span>
          <span>Download Backup (JSON)</span>
        </button>
      </div>

      <!-- Option 4: Restore Backup -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>Restore from backup:</span>
        <label class="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          <span>Choose JSON File</span>
          <input type="file" id="import-json-input" accept=".json" class="hidden">
        </label>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Close handlers
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Copy handler
  const copyBtn = modalOverlay.querySelector('#copy-summary-btn');
  const feedback = modalOverlay.querySelector('#copy-feedback');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textSummary).then(() => {
      feedback.classList.remove('hidden');
      setTimeout(() => feedback.classList.add('hidden'), 2500);
    });
  });

  // Print handler
  modalOverlay.querySelector('#print-plan-btn').addEventListener('click', () => {
    closeModal();
    window.print();
  });

  // Backup handler
  modalOverlay.querySelector('#backup-json-btn').addEventListener('click', () => {
    exportDataAsJSON();
  });

  // Import handler
  const importInput = modalOverlay.querySelector('#import-json-input');
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importDataFromJSON(file, (success) => {
        if (success) closeModal();
      });
    }
  });
}
