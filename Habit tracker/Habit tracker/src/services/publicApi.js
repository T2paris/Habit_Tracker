// src/services/publicApi.js

/**
 * API pública externa (sem chave):
 * Quotable: https://api.quotable.io
 * Usamos para "Motiva-me" no HabitBot.
 */

export async function fetchMotivationQuote({ timeoutMs = 4500 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Podes trocar tags conforme quiseres:
    // motivation | productivity | success | wisdom | happiness
    const url = "https://api.quotable.io/random?tags=motivational|productivity";

    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Quote API error: ${res.status}`);

    const data = await res.json();

    const content = String(data?.content || "").trim();
    const author = String(data?.author || "").trim();

    if (!content) throw new Error("Quote API: empty content");

    return author ? `"${content}" — ${author}` : `"${content}"`;
  } finally {
    clearTimeout(id);
  }
}
