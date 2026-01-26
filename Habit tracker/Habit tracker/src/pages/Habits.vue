<template>
  <main class="habits-page">
    <div class="habits-container">
      <!-- Tabs -->
      <div class="habits-tabs">
        <button
          class="habits-tab"
          :class="{ active: tab === 'todo' }"
          type="button"
          @click="tab = 'todo'"
        >
          Por concluir
          <span class="habits-tab-badge">{{ todoCount }}</span>
        </button>

        <button
          class="habits-tab"
          :class="{ active: tab === 'done' }"
          type="button"
          @click="tab = 'done'"
        >
          Concluídos
          <span class="habits-tab-badge">{{ doneCount }}</span>
        </button>
      </div>

      <!-- Lista -->
      <section class="habits-section">
        <div class="habits-list-wrap">
          <p v-if="!filtered.length" class="habits-empty">
            <span v-if="!habitsStore.items.length">Ainda não tens hábitos criados.</span>
            <span v-else-if="tab === 'todo'">Não tens hábitos por concluir 🎉</span>
            <span v-else>Não tens hábitos concluídos ainda.</span>
          </p>

          <div v-else class="habits-list">
            <div v-for="h in filtered" :key="h.id" class="habits-item">
              <div class="habits-item-left">
                <div class="habits-item-title">
                  {{ h.title }}
                  <span v-if="isDone(h)" class="done-badge">Concluído</span>
                </div>

                <div class="habits-item-meta">
                  <span class="chip">{{ h.frequency || h.type || "Diário" }}</span>
                  <span class="chip chip-soft">{{ h.category || "Outro" }}</span>
                  <span class="meta">{{ Number(h.progress || 0) }}/{{ Number(h.target || 0) }}</span>
                </div>

                <div class="track">
                  <div class="fill" :style="{ width: habitPercent(h) + '%' }"></div>
                </div>
              </div>

              <button
                v-if="tab === 'todo'"
                type="button"
                class="plus"
                @click="habitsStore.incrementProgress(h.id)"
                aria-label="Incrementar"
                :disabled="habitsStore.loading"
              >
                +
              </button>

              <div v-else class="done-pill">✅</div>
            </div>
          </div>
        </div>

        <!-- Botão criar -->
        <div class="habits-create">
          <button class="habits-create-btn" type="button" @click="openModal">
            <span class="habits-create-icon">+</span>
            <span class="habits-create-text">Criar hábitos</span>
          </button>
        </div>
      </section>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="habits-modal-overlay" @click.self="closeModal">
      <div class="habits-modal" role="dialog" aria-label="Criar hábito">
        <button class="habits-modal-x" type="button" @click="closeModal" aria-label="Fechar">
          ✕
        </button>

        <div class="habits-modal-top">Criar hábito</div>

        <form class="habits-form" @submit.prevent="createHabit">
          <!-- Nome -->
          <div class="row">
            <div class="left">
              <div class="label-big">Nome do hábito</div>
            </div>
            <div class="right">
              <input
                v-model.trim="title"
                class="habits-input"
                type="text"
                placeholder="Ex: Estudar 30min"
                required
              />
            </div>
          </div>

          <!-- Categoria -->
          <div class="row">
            <div class="left">
              <div class="label-big">Categoria</div>
            </div>
            <div class="right">
              <div class="pill-row">
                <button
                  v-for="c in categories"
                  :key="c"
                  class="pill"
                  :class="{ active: category === c }"
                  type="button"
                  @click="category = c"
                >
                  {{ c }}
                </button>
              </div>
            </div>
          </div>

          <!-- Frequência -->
          <div class="row">
            <div class="left">
              <div class="label-big">Frequência</div>
            </div>
            <div class="right">
              <div class="pill-row">
                <button
                  v-for="f in frequencies"
                  :key="f"
                  class="pill"
                  :class="{ active: frequency === f }"
                  type="button"
                  @click="setFrequency(f)"
                >
                  {{ f }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantas vezes -->
          <div class="row">
            <div class="left">
              <div class="label-big">
                Quantas vezes
                <div class="label-sub">({{ freqSuffix }})</div>
              </div>
            </div>
            <div class="right">
              <input v-model.number="times" class="habits-input" type="number" min="1" required />
            </div>
          </div>

          <!-- ✅ Agora só aparece se NÃO for anual -->
          <div v-if="frequency !== 'Anual'" class="row">
            <div class="left">
              <div class="label-big">Durante quantas semanas</div>
              <div class="hint-left">
                Vai criar ocorrências no calendário dentro deste período.
              </div>
            </div>
            <div class="right">
              <input v-model.number="weeks" class="habits-input" type="number" min="1" required />
            </div>
          </div>

          <!-- ✅ Dias (Diário, Semanal, Mensal) -->
          <div v-if="frequency !== 'Anual'" class="row">
            <div class="left">
              <div class="label-big">Dias</div>
              <div class="label-sub">Seleciona os dias da semana</div>
            </div>
            <div class="right">
              <div class="days">
                <button
                  v-for="d in weekDays"
                  :key="d.value"
                  type="button"
                  class="day"
                  :class="{ active: daysOfWeek.includes(d.value) }"
                  @click="toggleDay(d.value)"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- ✅ Anual: dia e mês -->
          <div v-else class="row">
            <div class="left">
              <div class="label-big">Data</div>
              <div class="label-sub">Escolhe dia e mês</div>
            </div>
            <div class="right annual-grid">
              <input
                v-model.number="annualDay"
                class="habits-input"
                type="number"
                min="1"
                max="31"
                placeholder="Dia (1-31)"
                required
              />
              <select v-model.number="annualMonth" class="habits-input" required>
                <option :value="1">Janeiro</option>
                <option :value="2">Fevereiro</option>
                <option :value="3">Março</option>
                <option :value="4">Abril</option>
                <option :value="5">Maio</option>
                <option :value="6">Junho</option>
                <option :value="7">Julho</option>
                <option :value="8">Agosto</option>
                <option :value="9">Setembro</option>
                <option :value="10">Outubro</option>
                <option :value="11">Novembro</option>
                <option :value="12">Dezembro</option>
              </select>
            </div>
          </div>

          <p v-if="habitsStore.error" class="habits-error">{{ habitsStore.error }}</p>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-create" :disabled="habitsStore.loading">
              {{ habitsStore.loading ? "A criar..." : "Criar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useHabitsStore } from "../stores/habits";
import { useUserStore } from "../stores/user";

const habitsStore = useHabitsStore();
const userStore = useUserStore();

const showModal = ref(false);
const tab = ref("todo");

const title = ref("");
const category = ref("Pessoal");
const frequency = ref("Diário");
const times = ref(1);
const weeks = ref(4);

const daysOfWeek = ref(["Mon", "Wed", "Fri"]);

const annualDay = ref(1);
const annualMonth = ref(1);

const categories = ["Trabalho", "Escola", "Pessoal", "Treino", "Saúde", "Finanças", "Outro"];
const frequencies = ["Diário", "Semanal", "Mensal", "Anual"];

const weekDays = [
  { value: "Mon", label: "Seg" },
  { value: "Tue", label: "Ter" },
  { value: "Wed", label: "Qua" },
  { value: "Thu", label: "Qui" },
  { value: "Fri", label: "Sex" },
  { value: "Sat", label: "Sáb" },
  { value: "Sun", label: "Dom" },
];

onMounted(async () => {
  if (userStore.isLogged) await habitsStore.load();
});

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

function resetForm() {
  title.value = "";
  category.value = "Pessoal";
  frequency.value = "Diário";
  times.value = 1;
  weeks.value = 4;
  daysOfWeek.value = ["Mon", "Wed", "Fri"];
  annualDay.value = 1;
  annualMonth.value = 1;
}

function setFrequency(f) {
  frequency.value = f;
  if (f === "Anual") {
    annualDay.value = 1;
    annualMonth.value = 1;
  } else {
    if (!daysOfWeek.value.length) daysOfWeek.value = ["Mon"];
  }
}

function toggleDay(d) {
  const set = new Set(daysOfWeek.value);
  if (set.has(d)) set.delete(d);
  else set.add(d);
  const out = Array.from(set);
  daysOfWeek.value = out.length ? out : ["Mon"];
}

const freqSuffix = computed(() => {
  if (frequency.value === "Diário") return "por dia";
  if (frequency.value === "Semanal") return "por semana";
  if (frequency.value === "Mensal") return "por mês";
  return "por ano";
});

function isDone(h) {
  const t = Number(h?.target) || 0;
  const p = Number(h?.progress) || 0;
  return t > 0 && p >= t;
}

function habitPercent(h) {
  const t = Number(h?.target) || 0;
  const p = Number(h?.progress) || 0;
  if (!t) return 0;
  const pct = Math.round((Math.min(p, t) / t) * 100);
  return Math.max(0, Math.min(100, pct));
}

const todoList = computed(() => (habitsStore.items || []).filter((h) => !isDone(h)));
const doneList = computed(() => (habitsStore.items || []).filter((h) => isDone(h)));

const todoCount = computed(() => todoList.value.length);
const doneCount = computed(() => doneList.value.length);

const filtered = computed(() => (tab.value === "todo" ? todoList.value : doneList.value));

async function createHabit() {
  if (!title.value.trim()) {
    habitsStore.error = "Nome do hábito é obrigatório.";
    return;
  }

  if (frequency.value !== "Anual" && (!daysOfWeek.value || !daysOfWeek.value.length)) {
    habitsStore.error = "Seleciona pelo menos 1 dia.";
    return;
  }

  if (frequency.value === "Anual") {
    const d = Number(annualDay.value);
    const m = Number(annualMonth.value);
    if (!Number.isFinite(d) || d < 1 || d > 31 || !Number.isFinite(m) || m < 1 || m > 12) {
      habitsStore.error = "Escolhe uma data válida.";
      return;
    }
  }

  const payload = {
    title: title.value.trim(),
    category: category.value,
    frequency: frequency.value,
    times: Number(times.value) || 1,

    // ✅ para anual não usamos weeks (porque não aparece)
    weeks: frequency.value === "Anual" ? 1 : Number(weeks.value) || 1,

    daysOfWeek: frequency.value === "Anual" ? [] : daysOfWeek.value,
    annualDay: frequency.value === "Anual" ? Number(annualDay.value) : null,
    annualMonth: frequency.value === "Anual" ? Number(annualMonth.value) : null,
    startDate: new Date().toISOString(),

    // compat
    type: frequency.value,
    target: Number(times.value) || 1,
  };

  const ok = await habitsStore.create(payload);
  if (ok) {
    tab.value = "todo";
    closeModal();
  }
}
</script>

<style scoped>
/* (CSS igual ao que já tinhas, sem alterações) */

/* página */
.habits-page {
  min-height: 100%;
  background: #2e6b60;
  padding: 28px 16px 90px;
  display: flex;
  justify-content: center;
}

.habits-container {
  width: min(1100px, 100%);
}

/* tabs */
.habits-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.habits-tab {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.10);
  color: rgba(234, 245, 242, 0.92);
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 950;
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.habits-tab:hover {
  background: rgba(255, 255, 255, 0.06);
}

.habits-tab.active {
  background: rgba(70, 176, 74, 0.18);
  border-color: rgba(70, 176, 74, 0.28);
}

.habits-tab-badge {
  display: inline-grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-weight: 1000;
}

/* lista */
.habits-section {
  border-radius: 18px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.habits-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.habits-empty {
  color: rgba(234, 245, 242, 0.86);
  font-weight: 850;
  padding: 10px 6px;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.habits-item {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.habits-item-left {
  flex: 1;
  min-width: 0;
}

.habits-item-title {
  color: #eaf5f2;
  font-weight: 1000;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.done-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 1000;
  background: rgba(70, 176, 74, 0.18);
  border: 1px solid rgba(70, 176, 74, 0.28);
}

.habits-item-meta {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  color: rgba(234, 245, 242, 0.86);
  font-weight: 850;
  font-size: 12px;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 950;
  font-size: 12px;
  color: #eaf5f2;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.chip-soft {
  background: rgba(0, 0, 0, 0.10);
}

.meta {
  opacity: 0.95;
}

.track {
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.fill {
  height: 100%;
  background: #46b04a;
}

.plus {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: #46b04a;
  color: #103b31;
  font-weight: 1000;
  font-size: 18px;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
}

.plus:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.done-pill {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

/* botão criar */
.habits-create {
  display: flex;
  justify-content: flex-end;
}

.habits-create-btn {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(70, 176, 74, 0.18);
  border: 1px solid rgba(70, 176, 74, 0.28);
  color: #eaf5f2;
  font-weight: 1000;
}

.habits-create-btn:hover {
  background: rgba(70, 176, 74, 0.22);
}

.habits-create-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #46b04a;
  color: #103b31;
  font-size: 18px;
  font-weight: 1000;
}

.habits-create-text {
  font-weight: 1000;
}

/* modal */
.habits-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.55);
}

.habits-modal {
  width: min(1200px, 100%);
  max-height: min(86vh, 820px);
  overflow: auto;
  border-radius: 18px;
  background: rgba(37, 90, 80, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
  padding: 26px 26px 22px;
  position: relative;
}

.habits-modal-top {
  color: rgba(234, 245, 242, 0.9);
  font-weight: 900;
  font-size: 16px;
  margin-bottom: 18px;
}

.habits-modal-x {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #eaf5f2;
  cursor: pointer;
  font-weight: 900;
}

.habits-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.row {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 22px;
  align-items: flex-start;
  padding-top: 6px;
}

.label-big {
  color: #eaf5f2;
  font-weight: 900;
  font-size: 22px;
  letter-spacing: -0.2px;
  line-height: 1.25;
}

.label-sub {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.8;
}

.hint-left {
  margin-top: 8px;
  color: rgba(234, 245, 242, 0.7);
  font-weight: 700;
  font-size: 13px;
  line-height: 1.4;
}

.habits-input {
  width: 100%;
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.18);
  color: #eaf5f2;
  font-weight: 850;
  font-size: 14px;
  outline: none;
}

.habits-input::placeholder {
  color: rgba(234, 245, 242, 0.62);
  font-weight: 800;
}

.habits-input option {
  background: #163c35;
  color: #eaf5f2;
}

.annual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pill-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
}

.pill {
  border: none;
  cursor: pointer;
  background: transparent;
  color: rgba(234, 245, 242, 0.92);
  font-weight: 950;
  font-size: 16px;
  padding: 10px 16px;
  border-radius: 14px;
}

.pill.active {
  background: rgba(70, 176, 74, 0.22);
  border: 1px solid rgba(70, 176, 74, 0.30);
}

.days {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.day {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #eaf5f2;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 950;
  font-size: 12px;
}

.day.active {
  background: #46b04a;
  color: #103b31;
  border-color: rgba(0, 0, 0, 0.1);
}

.actions {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}

.btn-cancel {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 1000;
  background: #f2fbff;
  color: #46b04a;
}

.btn-create {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 1000;
  background: #46b04a;
  color: #103b31;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.habits-error {
  color: #ffd6d6;
  font-weight: 900;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
}

@media (max-width: 980px) {
  .row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .pill-row {
    gap: 10px;
  }
  .annual-grid {
    grid-template-columns: 1fr;
  }
}
</style>
