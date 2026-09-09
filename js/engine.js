// ──────────────────────────────────────────────
//  GradePilot · engine.js
//  SGPA calculation + Priority Score algorithm
// ──────────────────────────────────────────────

import {
  gradeToPoints, getDifficulty, MAX_GRADE_POINTS,
  GRADES, round, possibleUpgrades, RISK,
} from './utils.js';

// ── SGPA Calculation ─────────────────────────

/**
 * Calculate SGPA from an array of subjects.
 * Uses simulatedGrade if present, else expectedGrade.
 *
 * SGPA = Σ(credit_i × gradePoint_i) / Σ(credit_i)
 */
export function calculateSGPA(subjects, useSimulated = false) {
  if (!subjects.length) return 0;

  let totalWeighted = 0;
  let totalCredits = 0;

  for (const sub of subjects) {
    const grade = (useSimulated && sub.simulatedGrade) ? sub.simulatedGrade : sub.expectedGrade;
    const points = gradeToPoints(grade);
    totalWeighted += sub.credits * points;
    totalCredits += sub.credits;
  }

  return totalCredits > 0 ? round(totalWeighted / totalCredits) : 0;
}

/** Total credits across all subjects */
export function totalCredits(subjects) {
  return subjects.reduce((sum, s) => sum + s.credits, 0);
}

// ── SGPA Impact ──────────────────────────────

/**
 * Calculate how much SGPA changes if one subject's grade changes.
 * Returns the delta (positive = improvement).
 */
export function calculateSGPAImpact(subject, fromGrade, toGrade, subjects) {
  const total = totalCredits(subjects);
  if (total === 0) return 0;

  const fromPoints = gradeToPoints(fromGrade);
  const toPoints = gradeToPoints(toGrade);
  const delta = (subject.credits * (toPoints - fromPoints)) / total;

  return round(delta);
}

// ── Priority Score ───────────────────────────

/**
 * Priority = Credit × DifficultyMultiplier × ImprovementPotential
 *
 * ImprovementPotential = (maxPoints - currentPoints) / maxPoints
 * Normalized to 0-1 range.
 */
export function calculatePriorityScore(subject) {
  const currentPoints = gradeToPoints(subject.expectedGrade);
  const improvementPotential = (MAX_GRADE_POINTS - currentPoints) / MAX_GRADE_POINTS;
  const diffMultiplier = getDifficulty(subject.difficulty).multiplier;

  return round(subject.credits * diffMultiplier * improvementPotential, 3);
}

/**
 * Get all subjects ranked by priority score (highest first).
 */
export function getPriorityRanking(subjects) {
  return subjects
    .map(sub => ({
      ...sub,
      priorityScore: calculatePriorityScore(sub),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

// ── Best Improvement Opportunities ───────────

/**
 * Find the best grade improvements to reach (or approach) the target SGPA.
 *
 * For each subject, evaluate every possible one-step upgrade and rank by
 * SGPA impact. Returns the top opportunities.
 */
export function getBestImprovements(subjects, targetSGPA) {
  const currentSGPA = calculateSGPA(subjects);
  const gap = targetSGPA - currentSGPA;
  const opportunities = [];

  for (const sub of subjects) {
    const upgrades = possibleUpgrades(sub.expectedGrade);
    for (const toGrade of upgrades) {
      const impact = calculateSGPAImpact(sub, sub.expectedGrade, toGrade, subjects);
      if (impact > 0) {
        opportunities.push({
          subjectId: sub.id,
          subjectName: sub.name,
          credits: sub.credits,
          difficulty: sub.difficulty,
          fromGrade: sub.expectedGrade,
          toGrade,
          impact,
          priorityScore: calculatePriorityScore(sub),
        });
      }
    }
  }

  // Sort by impact descending, then by priority score
  opportunities.sort((a, b) => {
    if (b.impact !== a.impact) return b.impact - a.impact;
    return b.priorityScore - a.priorityScore;
  });

  return {
    currentSGPA,
    targetSGPA,
    gap: round(gap),
    opportunities,
    // Find the minimal set of one-step-up improvements to close the gap
    recommended: findMinimalImprovements(subjects, targetSGPA),
  };
}

/**
 * Greedy: find the smallest set of single-step-up improvements
 * that gets closest to the target. Each subject upgrades by exactly
 * one grade step at a time.
 */
function findMinimalImprovements(subjects, targetSGPA) {
  const currentSGPA = calculateSGPA(subjects);
  if (currentSGPA >= targetSGPA) return { changes: [], projectedSGPA: currentSGPA };

  // Build candidate one-step upgrades sorted by impact
  const candidates = [];
  for (const sub of subjects) {
    const upgrades = possibleUpgrades(sub.expectedGrade);
    // Only consider the next grade up (one step)
    if (upgrades.length > 0) {
      const nextGrade = upgrades[upgrades.length - 1]; // next step up
      const impact = calculateSGPAImpact(sub, sub.expectedGrade, nextGrade, subjects);
      candidates.push({
        subjectId: sub.id,
        subjectName: sub.name,
        fromGrade: sub.expectedGrade,
        toGrade: nextGrade,
        credits: sub.credits,
        impact,
        // Favor high-impact, low-difficulty changes
        efficiency: impact / getDifficulty(sub.difficulty).multiplier,
      });
    }
  }

  // Sort by efficiency (impact per difficulty unit) descending
  candidates.sort((a, b) => b.efficiency - a.efficiency);

  // Greedily pick improvements until we reach target
  const changes = [];
  let projected = currentSGPA;

  for (const cand of candidates) {
    if (projected >= targetSGPA) break;
    changes.push(cand);
    projected = round(projected + cand.impact);
  }

  return { changes, projectedSGPA: projected };
}

// ── Risk Assessment ──────────────────────────

/**
 * Classify a subject's risk level based on how far its grade drags
 * the SGPA below target.
 *
 * - High risk: grade points < target - 2 AND high priority score
 * - Medium risk: grade points < target
 * - Low risk: grade points >= target
 */
export function getSubjectRisk(subject, targetSGPA) {
  const points = gradeToPoints(subject.expectedGrade);
  const priority = calculatePriorityScore(subject);

  if (points < targetSGPA - 1.5 && priority > 2) return 'high';
  if (points < targetSGPA) return 'medium';
  return 'low';
}

/** Count subjects by risk level */
export function getRiskSummary(subjects, targetSGPA) {
  const counts = { high: 0, medium: 0, low: 0 };
  const byRisk = { high: [], medium: [], low: [] };

  for (const sub of subjects) {
    const risk = getSubjectRisk(sub, targetSGPA);
    counts[risk]++;
    byRisk[risk].push(sub);
  }

  return { counts, byRisk };
}

// ── Academic Health Score ─────────────────────

/**
 * Academic Health: 0-100 score based on:
 * - Current expected SGPA vs target (40%)
 * - Number of high-risk subjects (20%)
 * - Average improvement potential (20%)
 * - Credit-weighted grade balance (20%)
 */
export function getAcademicHealth(subjects, targetSGPA) {
  if (!subjects.length) return { score: 0, status: 'high' };

  const sgpa = calculateSGPA(subjects);
  const total = totalCredits(subjects);
  const riskSummary = getRiskSummary(subjects, targetSGPA);

  // 1. SGPA proximity to target (40 pts)
  const sgpaRatio = Math.min(sgpa / targetSGPA, 1);
  const sgpaScore = sgpaRatio * 40;

  // 2. Risk penalty (20 pts) — more high-risk = lower score
  const highRiskRatio = riskSummary.counts.high / subjects.length;
  const riskScore = (1 - highRiskRatio) * 20;

  // 3. Average improvement potential — lower is better (20 pts)
  const avgPotential = subjects.reduce((sum, s) => {
    const pts = gradeToPoints(s.expectedGrade);
    return sum + (MAX_GRADE_POINTS - pts) / MAX_GRADE_POINTS;
  }, 0) / subjects.length;
  const potentialScore = (1 - avgPotential) * 20;

  // 4. Credit-weighted grade balance (20 pts)
  //    Penalize if heavy-credit subjects have low grades
  let weightedLowGrade = 0;
  for (const sub of subjects) {
    const pts = gradeToPoints(sub.expectedGrade);
    if (pts < targetSGPA) {
      weightedLowGrade += sub.credits * (targetSGPA - pts);
    }
  }
  const maxPenalty = total * targetSGPA; // theoretical worst
  const balanceScore = Math.max(0, (1 - weightedLowGrade / maxPenalty)) * 20;

  const score = Math.round(sgpaScore + riskScore + potentialScore + balanceScore);

  let status;
  if (score >= 75) status = 'low';       // Healthy
  else if (score >= 50) status = 'medium'; // Needs attention
  else status = 'high';                    // At risk

  return {
    score,
    status,
    ...RISK[status],
    healthLabel: score >= 75 ? '🟢 Healthy' : score >= 50 ? '🟡 Needs Attention' : '🔴 At Risk',
    breakdown: {
      sgpaScore: round(sgpaScore),
      riskScore: round(riskScore),
      potentialScore: round(potentialScore),
      balanceScore: round(balanceScore),
    },
  };
}

// ── Study Time Allocation ────────────────────

/**
 * Allocate weekly study hours proportionally to Priority Score.
 * Higher priority → more hours.
 */
export function getStudyPlan(subjects, totalHours = 16) {
  const ranked = getPriorityRanking(subjects);
  const totalPriority = ranked.reduce((s, r) => s + r.priorityScore, 0);

  if (totalPriority === 0) {
    // All subjects at max grade — distribute evenly
    const even = round(totalHours / subjects.length, 1);
    return ranked.map(r => ({ ...r, hours: even }));
  }

  return ranked.map(r => ({
    ...r,
    hours: round((r.priorityScore / totalPriority) * totalHours, 1),
  }));
}

// ── Difficulty × Credits Matrix ──────────────

/**
 * Returns subjects plotted on a difficulty (Y) × credits (X) matrix
 * with risk levels, for the scatter chart in the dashboard.
 */
export function getDifficultyCreditsMatrix(subjects, targetSGPA) {
  return subjects.map(sub => ({
    id: sub.id,
    name: sub.name,
    credits: sub.credits,
    difficulty: sub.difficulty,
    difficultyValue: getDifficulty(sub.difficulty).multiplier,
    risk: getSubjectRisk(sub, targetSGPA),
    priorityScore: calculatePriorityScore(sub),
    expectedGrade: sub.expectedGrade,
  }));
}
