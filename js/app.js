// ──────────────────────────────────────────────
//  GradePilot · app.js
//  Main application controller & view routing
// ──────────────────────────────────────────────

import { getState, setState, loadState, subscribe } from './state.js';
import { renderWizard } from './wizard.js';
import { renderDashboard } from './dashboard.js';
import { renderSimulator } from './simulator.js';

// ── DOM References ───────────────────────────

const app = document.getElementById('app');
const themeToggle = document.getElementById('theme-toggle');

// ── Theme Management ─────────────────────────

function initTheme() {
  const state = getState();

  if (state.darkMode === true) {
    document.documentElement.classList.add('dark');
  } else if (state.darkMode === false) {
    document.documentElement.classList.remove('dark');
  } else {
    // Follow system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  setState({ darkMode: isDark });
}

// ── View Rendering ───────────────────────────

let currentView = null;

function render() {
  const state = getState();
  const view = state.view || 'wizard';

  // Only re-render the full view if the view type changed
  // Individual modules handle their own re-renders via subscribe()
  if (currentView === view) return;
  currentView = view;

  // Clear container with a fade transition
  app.classList.remove('animate-fade-in');
  // Force reflow to restart animation
  void app.offsetWidth;
  app.classList.add('animate-fade-in');

  if (view === 'wizard') {
    app.innerHTML = '';
    const wizardContainer = document.createElement('div');
    wizardContainer.id = 'wizard-root';
    app.appendChild(wizardContainer);
    renderWizard(wizardContainer);
  } else if (view === 'dashboard') {
    app.innerHTML = '';

    // Register simulator renderer globally so dashboard can remount it after re-renders
    window.__renderSimulator = renderSimulator;

    // Dashboard container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'dashboard-root';
    app.appendChild(dashboardContainer);
    renderDashboard(dashboardContainer);
  }
}

// ── Initialization ───────────────────────────

function init() {
  // Restore saved state
  const restored = loadState();

  // Set up theme
  initTheme();

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = getState();
    if (state.darkMode === null) {
      document.documentElement.classList.toggle('dark', e.matches);
    }
  });

  // Theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Subscribe to state changes for view routing
  subscribe((state) => {
    const view = state.view || 'wizard';
    if (view !== currentView) {
      render();
    }
  });

  // Initial render
  render();

  console.log(
    '%c✈️ GradePilot%c — Your semester, your strategy',
    'font-size: 16px; font-weight: bold; color: #6366f1;',
    'font-size: 14px; color: #64748b;'
  );
}

// Launch!
init();
