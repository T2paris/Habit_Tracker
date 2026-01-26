import { defineStore } from "pinia";
import { useUserStore } from "./user";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
const API_URL = `${API_BASE}/users`;

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoToDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToISO(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayKey(dt) {
  const map = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return map[dt.getDay()];
}

function normalizeHabit(h) {
  const occ = h?.occurrences && typeof h.occurrences === "object" ? h.occurrences : {};
  const progress = Number(h?.progress ?? 0);
  const target = Number(h?.target ?? 0);

  return {
    ...h,
    progress: Number.isFinite(progress) ? progress : 0,
    target: Number.isFinite(target) ? target : 0,
    occurrences: occ,
    frequency: h?.frequency || h?.type || "Diário",
    category: h?.category || "Outro",
    times: Number(h?.times ?? h?.target ?? 1),
    weeks: Number(h?.weeks ?? 4),
    daysOfWeek: Array.isArray(h?.daysOfWeek) ? h.daysOfWeek : [],
    annualDay: h?.annualDay ?? null,
    annualMonth: h?.annualMonth ?? null,
  };
}

/**
 * Gera ocorrências dentro do intervalo (startDate -> startDate + weeks*7 dias)
 * - Diário/Semanal/Mensal: usa daysOfWeek (dias da semana)
 * - Anual: usa annualDay + annualMonth (gera 1 ocorrência por ano dentro dos "weeks" anos)
 */
function buildOccurrences(h) {
  const freq = h.frequency || "Diário";
  const times = Math.max(1, Number(h.times || 1));
  const weeks = Math.max(1, Number(h.weeks || 1));

  const occ = {};
  const start = new Date(h.startDate || new Date().toISOString());

  if (freq === "Anual") {
    const day = Math.max(1, Math.min(31, Number(h.annualDay || 1)));
    const month = Math.max(1, Math.min(12, Number(h.annualMonth || 1)));

    // interpreta "weeks" como "quantos anos" para anual (sem mudar UI)
    const years = weeks;

    for (let i = 0; i < years; i++) {
      const y = start.getFullYear() + i;
      const dt = new Date(y, month - 1, day);

      // Ajuste simples se dia inválido (ex: 31 Fev) -> cai para último dia do mês
      if (dt.getMonth() !== month - 1) {
        const last = new Date(y, month, 0); // último dia do mês
        const iso = dateToISO(last);
        occ[iso] = { target: times, done: 0 };
      } else {
        const iso = dateToISO(dt);
        occ[iso] = { target: times, done: 0 };
      }
    }

    return occ;
  }

  // Diário/Semanal/Mensal: todos usam dias da semana selecionados
  const allowed = new Set(Array.isArray(h.daysOfWeek) && h.daysOfWeek.length ? h.daysOfWeek : ["Mon"]);
  const end = new Date(start);
  end.setDate(end.getDate() + weeks * 7);

  const cur = new Date(start);
  while (cur <= end) {
    const k = dayKey(cur);
    if (allowed.has(k)) {
      const iso = dateToISO(cur);
      occ[iso] = { target: times, done: 0 };
    }
    cur.setDate(cur.getDate() + 1);
  }

  return occ;
}

function recomputeTotals(h) {
  const occ = h.occurrences || {};
  const entries = Object.values(occ);

  // target total = soma dos targets das ocorrências
  const totalTarget = entries.reduce((s, x) => s + Math.max(0, Number(x?.target || 0)), 0);
  const totalDone = entries.reduce((s, x) => s + Math.max(0, Number(x?.done || 0)), 0);

  // progress geral (para UI antiga) = totalDone
  // target geral (para UI antiga) = totalTarget
  return {
    ...h,
    progress: totalDone,
    target: totalTarget,
  };
}

export const useHabitsStore = defineStore("habits", {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    hasHabits: (state) => state.items.length > 0,

    // stats por dia para o calendário (não inclui hábitos já "finalizados" no sentido total)
    calendarStats: (state) => {
      const out = {};
      const today = isoToDate(todayISO());

      for (const raw of state.items || []) {
        const h = normalizeHabit(raw);
        const occ = h.occurrences || {};

        // se o hábito está totalmente concluído (todas ocorrências feitas), ignora no calendário
        const allDone =
          Object.keys(occ).length > 0 &&
          Object.values(occ).every((v) => Number(v?.done || 0) >= Number(v?.target || 0));

        if (allDone) continue;

        for (const [iso, v] of Object.entries(occ)) {
          // opcional: podes esconder datas muito antigas, mas não vou mexer nisso
          const t = Math.max(1, Number(v?.target || 1));
          const d = Math.max(0, Number(v?.done || 0));

          out[iso] = out[iso] || { planned: 0, done: 0 };
          out[iso].planned += 1;
          if (d >= t) out[iso].done += 1;
        }
      }

      return out;
    },
  },

  actions: {
    async load() {
      const userStore = useUserStore();
      this.error = null;

      if (!userStore.isLogged) {
        this.items = [];
        return;
      }

      // carrega do userStore (fica tudo centralizado)
      this.items = safeArray(userStore.habits).map(normalizeHabit).map(recomputeTotals);
    },

    async _patchHabits(newHabits) {
      const userStore = useUserStore();
      if (!userStore.id) {
        this.error = "Sessão inválida (sem id do utilizador)";
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`${API_URL}/${userStore.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habits: newHabits }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const updatedUser = await res.json();

        userStore.habits = safeArray(updatedUser.habits);
        this.items = safeArray(updatedUser.habits).map(normalizeHabit).map(recomputeTotals);

        return true;
      } catch (e) {
        console.error(e);
        this.error = "Erro ao guardar hábitos (confirma se a API está ligada: npm run api).";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async create(payload) {
      const current = safeArray(this.items);

      const id = globalThis.crypto?.randomUUID?.() || String(Date.now());
      const startDate = payload.startDate || new Date().toISOString();

      const habit = normalizeHabit({
        id,
        title: String(payload.title || "").trim(),
        category: payload.category || "Outro",
        frequency: payload.frequency || payload.type || "Diário",
        times: Number(payload.times ?? payload.target ?? 1),
        weeks: Number(payload.weeks ?? 4),
        daysOfWeek: Array.isArray(payload.daysOfWeek) ? payload.daysOfWeek : [],
        annualDay: payload.annualDay ?? null,
        annualMonth: payload.annualMonth ?? null,
        startDate,
        createdAt: new Date().toISOString(),
        occurrences: {},

        // compat
        type: payload.frequency || payload.type || "Diário",
      });

      if (!habit.title) {
        this.error = "Nome do hábito é obrigatório";
        return false;
      }

      // cria occurrences
      habit.occurrences = buildOccurrences(habit);

      const next = recomputeTotals(habit);
      return await this._patchHabits([next, ...current]);
    },

    /**
     * Marca progresso para um dia específico (calendário)
     * ✅ bloqueia marcar antes da data
     * ✅ bloqueia se não existir ocorrência planeada nesse dia
     */
    async incrementForDate(habitId, iso) {
      const userStore = useUserStore();
      const nowISO = todayISO();

      // não pode marcar futuro
      if (iso > nowISO) {
        this.error = "Ainda não podes marcar este hábito antes da data.";
        return false;
      }

      const current = safeArray(this.items).map(normalizeHabit);
      let completedNow = false;

      const updated = current.map((h) => {
        if (h.id !== habitId) return h;

        const occ = h.occurrences || {};
        const entry = occ[iso];

        // não está planeado nesse dia
        if (!entry) {
          this.error = "Este hábito não está planeado para este dia.";
          return h;
        }

        const target = Math.max(1, Number(entry.target || 1));
        const done = Math.max(0, Number(entry.done || 0));

        if (done >= target) return h;

        const nextDone = Math.min(done + 1, target);
        const nextOcc = { ...occ, [iso]: { ...entry, done: nextDone } };

        if (nextDone === target) completedNow = true;

        return recomputeTotals({ ...h, occurrences: nextOcc });
      });

      const ok = await this._patchHabits(updated);

      // +10 xp quando completa a ocorrência do dia
      if (ok && completedNow) {
        await userStore.addXp(10);
        await userStore.incrementCompletedHabits(1);
      }

      return ok;
    },

    /**
     * O + geral (Habits/Home) marca o dia de HOJE.
     * ✅ bloqueia se não estiver planeado hoje
     * ✅ bloqueia se fosse futuro (não acontece porque é hoje)
     */
    async incrementProgress(habitId) {
      return await this.incrementForDate(habitId, todayISO());
    },

    async remove(habitId) {
      const current = safeArray(this.items);
      const updated = current.filter((h) => h.id !== habitId);
      return await this._patchHabits(updated);
    },
  },
});
