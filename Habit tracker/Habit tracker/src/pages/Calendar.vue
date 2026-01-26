<template>
  <main class="calendar-page">
    <section class="cal-wrap">
      <div class="cal-header">
        <div class="cal-title">
          <h1>Calendário</h1>
          <p>Vê o que tens planeado por dia e marca progresso.</p>
        </div>

        <div class="cal-controls">
          <button class="cal-btn" type="button" @click="prevMonth">◀</button>
          <div class="cal-month">{{ monthLabel }}</div>
          <button class="cal-btn" type="button" @click="nextMonth">▶</button>
        </div>
      </div>

      <!-- grid mês -->
      <div class="cal-grid">
        <div class="cal-dow" v-for="d in dow" :key="d">{{ d }}</div>

        <button
          v-for="cell in cells"
          :key="cell.key"
          class="cal-cell"
          :class="{
            muted: !cell.inMonth,
            today: cell.iso === todayISO,
            selected: cell.iso === selectedISO,
          }"
          type="button"
          @click="selectDay(cell.iso)"
        >
          <div class="cal-day-top">
            <span class="cal-day-num">{{ cell.day }}</span>

            <!-- ✅ Badge agora mostra só "pendentes" -->
            <span v-if="dayPending(cell.iso) > 0" class="cal-badge">
              {{ dayDone(cell.iso) }}/{{ dayPlanned(cell.iso) }}
            </span>
          </div>

          <!-- ✅ Dots agora contam só pendentes (até 4) -->
          <div class="cal-dots" v-if="dayPending(cell.iso) > 0">
            <span class="dot" v-for="n in Math.min(4, dayPending(cell.iso))" :key="n"></span>
          </div>
        </button>
      </div>

      <!-- painel dia -->
      <div class="cal-daypanel">
        <div class="cal-daypanel-head">
          <div class="cal-daypanel-title">
            <h2>{{ selectedLabel }}</h2>

            <div class="cal-daypanel-sub">
              Para fazer: <strong>{{ plannedCount }}</strong> •
              Concluído: <strong>{{ doneCount }}</strong>

              <span v-if="isFutureSelected" class="future-pill">(dia futuro)</span>
            </div>
          </div>
        </div>

        <p v-if="dayHabits.length === 0" class="cal-empty">
          Nada planeado para este dia.
        </p>

        <div v-else class="cal-list">
          <!-- ✅ Só aparecem hábitos NÃO concluídos -->
          <div v-for="h in dayHabits" :key="h.id" class="cal-item">
            <div class="cal-item-main">
              <div class="cal-item-title">
                {{ h.title }}
                <span class="chip">{{ h.category }}</span>
              </div>

              <div class="cal-item-meta">
                {{ h.done }}/{{ h.target }} ({{ h.pct }}%)
              </div>

              <div class="track">
                <div class="fill" :style="{ width: h.pct + '%' }"></div>
              </div>
            </div>

            <button
              class="plus"
              type="button"
              :disabled="isFutureSelected || h.done >= h.target || habitsStore.loading"
              @click="inc(h.id)"
              :title="isFutureSelected ? 'Não podes concluir hábitos em dias futuros' : 'Marcar +1 neste dia'"
            >
              +
            </button>
          </div>
        </div>

        <p v-if="habitsStore.error" class="cal-error">{{ habitsStore.error }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useHabitsStore } from "../stores/habits";
import { useUserStore } from "../stores/user";

const habitsStore = useHabitsStore();
const userStore = useUserStore();

const dow = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISO(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}
function startOfMonth(dt) {
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}
function endOfMonth(dt) {
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
}
function pad(n) {
  return String(n).padStart(2, "0");
}

const todayISO = toISODate(new Date());
const selectedISO = ref(todayISO);
const cursor = ref(new Date());

onMounted(async () => {
  if (userStore.isLogged) await habitsStore.load();
});

watch(
  () => userStore.isLogged,
  async (v) => {
    if (v) await habitsStore.load();
  }
);

const monthLabel = computed(() => {
  const m = cursor.value.toLocaleString("pt-PT", { month: "long", year: "numeric" });
  return m.charAt(0).toUpperCase() + m.slice(1);
});

const cells = computed(() => {
  const mStart = startOfMonth(cursor.value);
  const mEnd = endOfMonth(cursor.value);

  const start = new Date(mStart);
  const dowStart = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dowStart);

  const end = new Date(mEnd);
  const dowEnd = (end.getDay() + 6) % 7;
  end.setDate(end.getDate() + (6 - dowEnd));

  const out = [];
  const cur = new Date(start);

  while (cur <= end) {
    const iso = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
    out.push({
      key: iso,
      iso,
      day: cur.getDate(),
      inMonth: cur.getMonth() === cursor.value.getMonth(),
    });
    cur.setDate(cur.getDate() + 1);
  }

  return out;
});

function prevMonth() {
  const d = new Date(cursor.value);
  d.setMonth(d.getMonth() - 1);
  cursor.value = d;
}
function nextMonth() {
  const d = new Date(cursor.value);
  d.setMonth(d.getMonth() + 1);
  cursor.value = d;
}

function selectDay(iso) {
  selectedISO.value = iso;
}

const selectedLabel = computed(() => {
  const dt = parseISO(selectedISO.value);
  return dt.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});

/* ✅ dia futuro = bloqueia conclusão */
const isFutureSelected = computed(() => selectedISO.value > todayISO);

/**
 * ✅ Funções utilitárias para o grid:
 * - planned = total ocorrências no dia
 * - done = quantas já estão completas nesse dia
 * - pending = quantas faltam (planned - done)
 *
 * (Isto usa occurrences do próprio habit, não depende do calendarStats)
 */
function dayCounts(iso) {
  let planned = 0;
  let done = 0;

  const list = habitsStore.items || [];
  for (const h of list) {
    const occ = h?.occurrences && typeof h.occurrences === "object" ? h.occurrences : {};
    const v = occ[iso];
    if (!v) continue;

    const t = Math.max(1, Number(v.target) || 1);
    const d = Math.max(0, Number(v.done) || 0);

    planned += 1;
    if (d >= t) done += 1;
  }

  return { planned, done, pending: Math.max(0, planned - done) };
}

function dayPlanned(iso) {
  return dayCounts(iso).planned;
}
function dayDone(iso) {
  return dayCounts(iso).done;
}
function dayPending(iso) {
  return dayCounts(iso).pending;
}

/**
 * ✅ Lista do painel do dia:
 * agora FILTRA para não mostrar hábitos concluídos (done >= target)
 */
const dayHabits = computed(() => {
  const iso = selectedISO.value;

  return (habitsStore.items || [])
    .map((h) => {
      const occ = h?.occurrences && typeof h.occurrences === "object" ? h.occurrences : {};
      const v = occ[iso];
      if (!v) return null;

      const target = Math.max(1, Number(v.target) || 1);
      const done = Math.max(0, Number(v.done) || 0);

      // ✅ esconde concluídos
      if (done >= target) return null;

      const pct = Math.round((Math.min(done, target) / target) * 100);

      return {
        id: h.id,
        title: h.title,
        category: h.category || "Outro",
        target,
        done,
        pct,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.pct - b.pct);
});

/* ✅ Agora plannedCount = só os que faltam (porque dayHabits já só tem pendentes) */
const plannedCount = computed(() => dayHabits.value.length);

/* ✅ doneCount continua a ser quantos estão completos no dia (total - pendentes) */
const doneCount = computed(() => {
  const { planned, done } = dayCounts(selectedISO.value);
  return planned > 0 ? done : 0;
});

async function inc(id) {
  if (isFutureSelected.value) return;
  await habitsStore.incrementForDate(id, selectedISO.value);
}
</script>

<style scoped>
/* Base da página */
.calendar-page {
  min-height: 100%;
  padding: 28px 16px 70px;
  display: flex;
  justify-content: center;
  background: #2e6b60;
}

.cal-wrap {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cal-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.cal-title h1 {
  color: #eaf5f2;
  font-weight: 950;
  font-size: 28px;
}
.cal-title p {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.85);
  font-weight: 800;
  font-size: 12px;
}

.cal-controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.cal-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: #eaf5f2;
  font-weight: 950;
}

.cal-month {
  color: #eaf5f2;
  font-weight: 950;
  text-transform: capitalize;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.cal-dow {
  color: rgba(234, 245, 242, 0.85);
  font-weight: 950;
  font-size: 12px;
  text-align: center;
  padding: 6px 0;
}

.cal-cell {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 10px;
  min-height: 74px;
  cursor: pointer;
  text-align: left;
  color: #eaf5f2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cal-cell.muted {
  opacity: 0.55;
}

.cal-cell.today {
  outline: 2px solid rgba(70, 176, 74, 0.55);
}

.cal-cell.selected {
  outline: 2px solid rgba(255, 255, 255, 0.24);
}

.cal-day-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cal-day-num {
  font-weight: 950;
}

.cal-badge {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
  background: rgba(70, 176, 74, 0.18);
  border: 1px solid rgba(70, 176, 74, 0.3);
}

.cal-dots {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #46b04a;
  opacity: 0.9;
}

.cal-daypanel {
  border-radius: 18px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.cal-daypanel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.cal-daypanel-title h2 {
  color: #eaf5f2;
  font-weight: 950;
  font-size: 16px;
  text-transform: capitalize;
}
.cal-daypanel-sub {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.82);
  font-weight: 850;
  font-size: 12px;
}

.future-pill {
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  color: rgba(234, 245, 242, 0.92);
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.cal-empty {
  color: rgba(234, 245, 242, 0.86);
  font-weight: 850;
  padding: 10px 0;
}

.cal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.cal-item-main {
  flex: 1;
  min-width: 0;
}

.cal-item-title {
  color: #eaf5f2;
  font-weight: 950;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cal-item-meta {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.82);
  font-weight: 850;
  font-size: 12px;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 950;
  font-size: 12px;
  color: #eaf5f2;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.track {
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.fill {
  height: 100%;
  background: #46b04a;
}

.plus {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: #46b04a;
  color: #103b31;
  font-weight: 950;
  font-size: 18px;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
}
.plus:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cal-error {
  margin-top: 10px;
  color: #ffe3e3;
  font-weight: 950;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
}
</style>
