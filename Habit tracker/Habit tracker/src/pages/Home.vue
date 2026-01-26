<template>
  <main class="home-page">
    <!-- HOME PÚBLICA (não logado) -->
    <section v-if="!userStore.isLogged" class="landing">
      <div class="landing-inner">
        <!-- HERO (wide) -->
        <section class="hero-section">
          <div class="hero-card hero-card--wide">
            <div class="hero-text">
              <h2 class="hero-title">Cria hábitos,</h2>
              <h2 class="hero-title">transforma a tua rotina e alcança a tua melhor versão.</h2>

              <button class="btn-primary" type="button" @click="scrollToRegister">
                Organiza-te
              </button>
            </div>

            <div class="hero-side">
              <div class="hero-mini">
                <div class="hero-mini-title">+10 XP</div>
                <div class="hero-mini-sub">por hábito concluído</div>
              </div>
              <div class="hero-mini">
                <div class="hero-mini-title">Calendário</div>
                <div class="hero-mini-sub">planeamento mensal</div>
              </div>
              <div class="hero-mini">
                <div class="hero-mini-title">Categorias:</div>
                <div class="hero-mini-sub">trabalho, escola, treino…</div>
              </div>
            </div>
          </div>
        </section>

        <!-- FEATURE 1 (wide) -->
        <section class="feature-section">
          <div class="feature-card feature-card-left feature-card--wide">
            <div class="feature-media">
              <img class="feature-img" src="../imgs/calendario.png" alt="Calendário Habitree" />
            </div>

            <div class="feature-content">
              <h3 class="feature-title">Vê as funcionalidades do Habitree</h3>
              <p class="feature-description">
                Descobre como pequenos hábitos podem transformar <br>o teu dia com metas,
                progresso e foco no teu objetivo.
              </p>

              <button class="btn-secondary" type="button" @click="scrollToRegister">
                Começar
              </button>
            </div>
          </div>
        </section>

        <!-- FEATURE 2 (wide) -->
        <section class="feature-section">
          <div class="feature-card feature-card-green feature-card--wide">
            <div class="feature-content-left">
              <h3 class="feature-title-white">Começa hoje e vê a diferença amanhã!</h3>
              <p class="feature-description-white">
                Transforma a tua rotina com o Habitree. Acompanha os teus hábitos diários, 
                mantém-te motivado e melhora a tua consistência. Pequenas ações, grandes resultados.”
              </p>

              <button class="btn-secondary white" type="button" @click="scrollToRegister">
                Criar conta
              </button>
            </div>

            <div class="feature-media">
              <img class="feature-img" src="../imgs/checklist.png" alt="Checklist Habitree" />
            </div>
          </div>
        </section>

        <!-- REGISTER (wide + inputs iguais ao login) -->
        <section ref="registerSection" class="register-section">
          <div class="register-card register-card--wide">
            <h2 class="register-title">Começa agora!</h2>

            <form class="register-form" @submit.prevent="handleRegister">
              <label class="field">
                <span class="field-label">Nome</span>
                <input
                  v-model.trim="name"
                  class="auth-input"
                  type="text"
                  placeholder=""
                  required
                  @input="clearError"
                />
              </label>

              <label class="field">
                <span class="field-label">Email</span>
                <input
                  v-model.trim="email"
                  class="auth-input"
                  type="email"
                  placeholder=""
                  required
                  @input="clearError"
                />
              </label>

              <label class="field">
                <span class="field-label">Palavra-passe</span>
                <input
                  v-model="password"
                  class="auth-input"
                  type="password"
                  placeholder=""
                  required
                  @input="clearError"
                />
              </label>

              <button class="btn-register" type="submit" :disabled="userStore.loading">
                {{ userStore.loading ? "A criar..." : "Registar" }}
              </button>

              <p v-if="userStore.error" class="landing-error">
                {{ userStore.error }}
              </p>

              <p class="register-foot">
                Já tens conta?
                <router-link class="register-link" :to="{ name: 'login' }">Iniciar sessão</router-link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </section>

    <!-- HOME PRIVADA (logado) — NOVO (HOJE + GERAL) -->
    <section v-else class="home-private">
      <div class="home-private-inner">
        <!-- topo -->
        <div class="hp-top">
          <div class="hp-top-left">
            <h2 class="hp-title">A tua rotina</h2>
          </div>

          <div class="hp-top-right">
            <div class="hp-stat">
              <div class="hp-stat-label">Pontos</div>
              <div class="hp-stat-value">{{ userStore.points }}</div>
            </div>
            <div class="hp-stat">
              <div class="hp-stat-label">Concluídos</div>
              <div class="hp-stat-value">{{ userStore.completedHabits }}</div>
            </div>
          </div>
        </div>

        <!-- progresso geral -->
        <div class="hp-card">
          <div class="hp-card-head">
            <div class="hp-card-title">Progresso geral</div>
            <div class="hp-card-meta">{{ overallPercent }}%</div>
          </div>

          <div class="hp-progress-track">
            <div class="hp-progress-fill" :style="{ width: overallPercent + '%' }"></div>
          </div>
        </div>

        <!-- HOJE + GERAL -->
        <div class="hp-grid">
          <!-- HOJE -->
          <section class="hp-card hp-card--stretch">
            <div class="hp-card-head">
              <div class="hp-card-title">Hoje</div>
              <div class="hp-card-meta">{{ todayHabits.length }} por fazer</div>
            </div>

            <p v-if="!hasHabits" class="hp-empty">
              Ainda não tens hábitos.
              <router-link class="hp-link" :to="{ name: 'habits' }">Criar agora</router-link>
            </p>

            <p v-else-if="todayHabits.length === 0" class="hp-empty">
              Nada planeado para hoje 🎉
              <router-link class="hp-link" :to="{ name: 'calendar' }">Ver calendário</router-link>
            </p>

            <div v-else class="hp-list">
              <div v-for="h in todayHabits" :key="h.id" class="hp-item">
                <div class="hp-item-main">
                  <div class="hp-item-title">
                    {{ h.title }}
                    <span v-if="h.category" class="hp-chip">{{ h.category }}</span>
                  </div>

                  <div class="hp-item-meta">{{ h.done }}/{{ h.target }} ({{ h.pct }}%)</div>

                  <div class="hp-mini-track">
                    <div class="hp-mini-fill" :style="{ width: h.pct + '%' }"></div>
                  </div>
                </div>

                <button
                  class="hp-plus"
                  type="button"
                  :disabled="h.done >= h.target || habitsStore.loading"
                  @click="incToday(h.id)"
                  title="Marcar +1 hoje"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <!-- GERAL -->
          <section class="hp-card hp-card--stretch">
            <div class="hp-card-head">
              <div class="hp-card-title">Em geral</div>
              <div class="hp-card-meta">{{ inProgressHabits.length }} em progresso</div>
            </div>

            <p v-if="!hasHabits" class="hp-empty">
              Ainda não tens hábitos.
              <router-link class="hp-link" :to="{ name: 'habits' }">Criar agora</router-link>
            </p>

            <p v-else-if="inProgressHabits.length === 0" class="hp-empty">
              Já completaste tudo 🎉
              <router-link class="hp-link" :to="{ name: 'habits' }">Criar mais</router-link>
            </p>

            <div v-else class="hp-table-wrap">
              <table class="hp-table">
                <thead>
                  <tr>
                    <th>Hábito</th>
                    <th>Tipo</th>
                    <th>Meta</th>
                    <th>Progresso</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="h in inProgressHabits" :key="h.id">
                    <td class="hp-td-title">
                      <div class="hp-td-title-inner">
                        <span class="hp-td-name">{{ h.title }}</span>
                        <span v-if="h.category" class="hp-chip hp-chip--small">{{ h.category }}</span>
                      </div>
                    </td>

                    <td class="hp-td-muted">{{ h.type }}</td>
                    <td class="hp-td-muted">{{ h.target }}x</td>

                    <td>
                      <div class="hp-progcell">
                        <div class="hp-mini-track">
                          <div class="hp-mini-fill" :style="{ width: habitPercent(h) + '%' }"></div>
                        </div>
                        <div class="hp-progmeta">
                          <span>{{ h.progress }}/{{ h.target }}</span>
                          <strong>{{ habitPercent(h) }}%</strong>
                        </div>
                      </div>
                    </td>

                    <td class="hp-td-action">
                      <button class="hp-plus" type="button" @click="inc(h.id)">+</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <p v-if="habitsStore.error" class="hp-error">{{ habitsStore.error }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useHabitsStore } from "../stores/habits";

const router = useRouter();
const userStore = useUserStore();
const habitsStore = useHabitsStore();

/* Landing register */
const name = ref("");
const email = ref("");
const password = ref("");
const registerSection = ref(null);

function scrollToRegister() {
  registerSection.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearError() {
  userStore.error = null;
}

async function handleRegister() {
  const success = await userStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  if (success) router.push({ name: "home" });
}

/* Carregar hábitos ao entrar logado */
onMounted(async () => {
  if (userStore.isLogged) {
    await habitsStore.load();
  }
});

const hasHabits = computed(() => (habitsStore.items || []).length > 0);

/* Só em progresso (não aparecem completos) */
const inProgressHabits = computed(() => {
  return (habitsStore.items || []).filter((h) => {
    const target = Number(h?.target) || 0;
    const progress = Number(h?.progress) || 0;
    if (!target) return true;
    return progress < target;
  });
});

/* Progresso geral (conta todos) */
const overallPercent = computed(() => {
  if (!hasHabits.value) return 0;

  const totals = (habitsStore.items || []).reduce(
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

  const pct = Math.round((totals.progress / totals.target) * 100);
  return Math.max(0, Math.min(100, pct));
});

function habitPercent(h) {
  const target = Number(h?.target) || 0;
  const progress = Number(h?.progress) || 0;
  if (!target) return 0;
  const pct = Math.round((Math.min(progress, target) / target) * 100);
  return Math.max(0, Math.min(100, pct));
}

/* Hoje — baseado no calendário (occurrences[YYYY-MM-DD]) */
const todayISO = new Date().toISOString().slice(0, 10);

const todayHabits = computed(() => {
  const iso = todayISO;

  return (habitsStore.items || [])
    .map((h) => {
      // não mostrar hábitos já concluídos (em geral)
      const tg = Number(h?.target) || 0;
      const pg = Number(h?.progress) || 0;
      if (tg > 0 && pg >= tg) return null;

      const occ = h?.occurrences && typeof h.occurrences === "object" ? h.occurrences : {};
      const v = occ[iso];
      if (!v) return null;

      const target = Math.max(1, Number(v.target) || 1);
      const done = Math.max(0, Number(v.done) || 0);
      const pct = Math.round((Math.min(done, target) / target) * 100);

      if (done >= target) return null; // não mostrar os de hoje já completos

      return {
        id: h.id,
        title: h.title,
        category: h.category || "",
        target,
        done,
        pct,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.done >= a.target) - (b.done >= b.target));
});

function inc(id) {
  habitsStore.incrementProgress(id);
}

async function incToday(id) {
  // marca +1 apenas no dia de hoje
  await habitsStore.incrementForDate(id, todayISO);
}
</script>

<style scoped>
.home-page {
  min-height: 100%;
  background: #2e6b60;
}

/* LANDING */
.landing {
  padding: 28px 16px 90px;
  display: flex;
  justify-content: center;
}

.landing-inner {
  --base: 1100px;
  --wide: 1240px;

  width: min(var(--base), 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Wide: hero + features + register */
.hero-card--wide,
.feature-card--wide,
.register-card--wide {
  width: min(var(--wide), calc(70vw - 32px));
  margin-left: 50%;
  transform: translateX(-50%);
}

/* HERO */
.hero-card {
  border-radius: 18px;
  padding: 18px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  color: #eaf5f2;

  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 14px;
  align-items: stretch;
}

.hero-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 28px;
  line-height: 1.08;
}

.hero-subtitle {
  margin-top: 10px;
  color: rgba(234, 245, 242, 0.85);
  font-weight: 900;
  font-size: 13px;
  max-width: 60ch;
}

.btn-primary {
  margin-top: 14px;
  border-radius: 14px;
  border: 1px solid rgba(70, 176, 74, 0.3);
  background: rgba(70, 176, 74, 0.18);
  color: #eaf5f2;
  padding: 12px 14px;
  font-weight: 1000;
  cursor: pointer;
}

.hero-side {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
}

.hero-mini {
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.hero-mini-title {
  font-weight: 1000;
  font-size: 16px;
  color: #eaf5f2;
}
.hero-mini-sub {
  color: rgba(234, 245, 242, 0.82);
  font-weight: 900;
  font-size: 12px;
}

/* FEATURES */
.feature-card {
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: center;
  background: rgba(0, 0, 0, 0.12);
  color: #eaf5f2;
}

.feature-media {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  display: block;
}

.feature-title,
.feature-title-white {
  font-weight: 1000;
  font-size: 16px;
  color: #eaf5f2;
}

.feature-description,
.feature-description-white {
  margin-top: 8px;
  color: rgba(234, 245, 242, 0.85);
  font-weight: 900;
  font-size: 12px;
  max-width: 62ch;
}

.btn-secondary {
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: #eaf5f2;
  padding: 12px 14px;
  font-weight: 1000;
  cursor: pointer;
}
.btn-secondary.white {
  background: rgba(255, 255, 255, 0.1);
}

/* REGISTER */
.register-card {
  border-radius: 18px;
  padding: 18px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  color: #eaf5f2;
}

.register-title {
  font-weight: 1000;
  font-size: 18px;
}

.register-form {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 900;
  color: rgba(234, 245, 242, 0.82);
}

.auth-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.18);
  color: #eaf5f2;
  border-radius: 12px;
  padding: 12px;
  font-weight: 900;
  outline: none;
}
.auth-input::placeholder {
  color: rgba(234, 245, 242, 0.6);
  font-weight: 850;
}

.btn-register {
  margin-top: 4px;
  border-radius: 14px;
  border: 1px solid rgba(70, 176, 74, 0.3);
  background: rgba(70, 176, 74, 0.18);
  color: #eaf5f2;
  padding: 12px;
  font-weight: 1000;
  cursor: pointer;
}

.landing-error {
  margin-top: 6px;
  color: #ffe3e3;
  font-weight: 950;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
}

.register-foot {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.84);
  font-weight: 900;
  font-size: 12px;
}

.register-link {
  color: #eaf5f2;
  font-weight: 1000;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* =========================
   HOME LOGADO (SÓ ESTA PARTE)
   ========================= */
.home-private {
  min-height: 100%;
  background: #2e6b60;
  padding: 28px 16px 90px;
  display: flex;
  justify-content: center;
}

.home-private-inner {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #eaf5f2;
}

.hp-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.hp-title {
  font-size: 22px;
  font-weight: 1000;
  color: #eaf5f2;
}

.hp-subtitle {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 900;
  color: rgba(234, 245, 242, 0.85);
}

.hp-top-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hp-stat {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  min-width: 120px;
}

.hp-stat-label {
  font-size: 11px;
  font-weight: 900;
  color: rgba(234, 245, 242, 0.8);
}

.hp-stat-value {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 1000;
  color: #eaf5f2;
}

.hp-card {
  border-radius: 18px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.hp-card--stretch {
  min-height: 320px;
}

.hp-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.hp-card-title {
  font-weight: 1000;
  color: #eaf5f2;
}

.hp-card-meta {
  font-weight: 1000;
  font-size: 12px;
  color: rgba(234, 245, 242, 0.82);
}

.hp-progress-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.hp-progress-fill {
  height: 100%;
  background: #46b04a;
}

.hp-progress-note {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 850;
  color: rgba(234, 245, 242, 0.78);
}

.hp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.hp-empty {
  margin-top: 6px;
  font-weight: 900;
  color: rgba(234, 245, 242, 0.85);
}

.hp-link {
  margin-left: 6px;
  color: #eaf5f2;
  font-weight: 1000;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.hp-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.hp-item-main {
  flex: 1;
  min-width: 0;
}

.hp-item-title {
  font-weight: 1000;
  color: #eaf5f2;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.hp-item-meta {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 850;
  color: rgba(234, 245, 242, 0.82);
}

.hp-chip {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  color: #eaf5f2;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.hp-chip--small {
  padding: 4px 8px;
  font-size: 11px;
}

.hp-mini-track {
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.hp-mini-fill {
  height: 100%;
  background: #46b04a;
}

.hp-plus {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: #46b04a;
  color: #103b31;
  font-weight: 1000;
  font-size: 18px;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
}

.hp-plus:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hp-table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 14px;
  margin-top: 6px;
}

.hp-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
  background: transparent;
  color: #eaf5f2;
}

.hp-table thead th {
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 1000;
  background: rgba(0, 0, 0, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.hp-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  font-weight: 850;
  font-size: 13px;
}

.hp-td-title-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hp-td-name {
  font-weight: 1000;
}

.hp-td-muted {
  color: rgba(234, 245, 242, 0.82);
  font-weight: 900;
}

.hp-td-action {
  text-align: right;
}

.hp-progcell {
  min-width: 220px;
}

.hp-progmeta {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: rgba(234, 245, 242, 0.86);
  font-weight: 900;
}

.hp-error {
  color: #ffe3e3;
  font-weight: 950;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
}

@media (max-width: 980px) {
  .hp-grid {
    grid-template-columns: 1fr;
  }
  .hp-card--stretch {
    min-height: auto;
  }
}

/* Responsivo do landing */
@media (max-width: 980px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .hero-side {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: none;
  }

  .feature-card {
    grid-template-columns: 1fr;
  }

  .feature-img {
    height: 180px;
  }

  .hero-card--wide,
  .feature-card--wide,
  .register-card--wide {
    width: 100%;
    margin-left: 0;
    transform: none;
  }
}
</style>
