// src/utils/habits.js

export function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export function clampPercent(n) {
  const x = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(100, x));
}

/**
 * Percentagem geral (conta todos, mas só acumula progress até ao target)
 * (igual ao que tens na Home)
 */
export function overallPercent(items) {
  const list = safeArray(items);
  if (!list.length) return 0;

  const totals = list.reduce(
    (acc, h) => {
      const target = Number(h?.target) || 0;
      const progress = Number(h?.progress) || 0;
      acc.target += target;
      acc.progress += Math.min(progress, target);
      return acc;
    },
    { target: 0, progress: 0 }
  );

  if (!totals.target) return 0;

  return clampPercent((totals.progress / totals.target) * 100);
}

/**
 * Devolve só hábitos ainda por concluir (progress < target)
 */
export function inProgressOnly(items) {
  return safeArray(items).filter((h) => {
    const t = Number(h?.target) || 0;
    const p = Number(h?.progress) || 0;
    if (!t) return true;
    return p < t;
  });
}

/**
 * Completed?
 */
export function isCompleted(h) {
  const t = Number(h?.target) || 0;
  const p = Number(h?.progress) || 0;
  return t > 0 && p >= t;
}
