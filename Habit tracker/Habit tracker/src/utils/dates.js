// src/utils/dates.js

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const day = pad2(dt.getDate());
  return `${y}-${m}-${day}`;
}

export function parseISO(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * true se isoA < isoB (comparação por data)
 */
export function isBeforeISO(isoA, isoB) {
  const a = parseISO(isoA).setHours(0, 0, 0, 0);
  const b = parseISO(isoB).setHours(0, 0, 0, 0);
  return a < b;
}

/**
 * Não permitir marcar progresso num dia futuro (exigência que pediste)
 */
export function canMarkDate(targetISO, todayISO = toISODate(new Date())) {
  // pode marcar hoje ou passado; não pode futuro
  return !isBeforeISO(todayISO, targetISO);
}
