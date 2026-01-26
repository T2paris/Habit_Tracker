<template>
  <main class="dashboard-page">
    <section class="dashboard-container">
      <div class="dash-head">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dash-subtitle">Acompanha os teus pontos, conquistas e ranking.</p>
      </div>

      <div class="dashboard-cards">
        <div class="dash-card">
          <div class="dash-label">Pontos</div>
          <div class="dash-value">{{ userStore.points }}</div>
          <div class="dash-mini"></div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Hábitos concluídos</div>
          <div class="dash-value">{{ userStore.completedHabits }}</div>
          <div class="dash-mini"></div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Título</div>
          <div class="dash-value">{{ userStore.title }}</div>
          <div class="dash-mini"></div>
        </div>
      </div>

      <section class="ranking">
        <div class="ranking-header">
          <h2 class="ranking-title">Ranking</h2>
          <button
            class="ranking-refresh"
            type="button"
            @click="loadRanking"
            :disabled="loading"
          >
            {{ loading ? "A atualizar..." : "Atualizar" }}
          </button>
        </div>

        <div class="ranking-card">
          <div class="rank-head">
            <div>#</div>
            <div>Utilizador</div>
            <div>Título</div>
            <div>Pontos</div>
            <div>Concluídos</div>
          </div>

          <div v-if="loading" class="rank-row rank-muted">
            A carregar ranking...
          </div>

          <div v-else-if="!ranking.length" class="rank-row rank-muted">
            Sem utilizadores no ranking ainda.
          </div>

          <div
            v-else
            v-for="(u, idx) in ranking"
            :key="u.id"
            class="rank-row"
            :class="{ me: u.id === userStore.id }"
          >
            <div class="rank-pos">{{ idx + 1 }}</div>

            <div class="rank-user">
              <span class="rank-avatar">
                <img
                  v-if="avatarImg(u) && !broken[u.id]"
                  :src="avatarImg(u)"
                  alt="avatar"
                  @error="broken[u.id] = true"
                />
                <span v-else class="rank-avatar-fallback">
                  {{ initial(u.name) }}
                </span>
              </span>

              <span class="rank-name">{{ u.name || "User" }}</span>
            </div>

            <div class="rank-title">
              {{ getAvatarTitle(u) }}
            </div>

            <div class="rank-points">{{ Number(u.xp ?? 0) }}</div>

            <div class="rank-done">{{ Number(u.completedHabits ?? 0) }}</div>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useUserStore } from "../stores/user";
import { AVATARS, avatarById } from "../data/avatars";

const userStore = useUserStore();

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
const API_URL = `${API_BASE}/users`;

const ranking = ref([]);
const loading = ref(false);
const broken = reactive({});

function initial(name) {
  const n = (name || "U").trim();
  return n ? n[0].toUpperCase() : "U";
}

function getUserAvatarId(u) {
  return u?.activeAvatarId || u?.avatarId || "starter_scout";
}

function avatarImg(u) {
  const id = getUserAvatarId(u);
  const a = avatarById(id);
  return a?.img || null;
}

function getAvatarTitle(u) {
  const id = getUserAvatarId(u);
  const a = AVATARS.find((x) => x.id === id) || AVATARS[0];
  return a.title || a.name || "Starter Scout";
}

async function loadRanking() {
  loading.value = true;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Falha ao carregar ranking");
    const users = await res.json();

    const list = Array.isArray(users) ? users : [];

    list.sort((a, b) => {
      const ax = Number(a?.xp ?? 0);
      const bx = Number(b?.xp ?? 0);
      if (bx !== ax) return bx - ax;

      const ad = Number(a?.completedHabits ?? 0);
      const bd = Number(b?.completedHabits ?? 0);
      return bd - ad;
    });

    ranking.value = list.slice(0, 20);
  } catch (e) {
    ranking.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRanking();
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 28px 16px 70px;
  display: flex;
  justify-content: center;
}

.dashboard-container {
  width: min(1100px, 100%);
}

.dash-head {
  margin-bottom: 14px;
  background: rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.20);
}

.dashboard-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 22px;
}

.dash-subtitle {
  margin-top: 6px;
  color: rgba(234,245,242,0.85);
  font-weight: 850;
  font-size: 12px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 860px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}

.dash-card {
  border-radius: 18px;
  padding: 14px;
  background: rgba(0,0,0,0.14);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 18px 50px rgba(0,0,0,0.20);
  transition: transform 160ms ease, background 160ms ease;
}

.dash-card:hover {
  transform: translateY(-2px);
  background: rgba(0,0,0,0.16);
}

.dash-label {
  color: rgba(234,245,242,0.85);
  font-weight: 950;
  font-size: 12px;
}

.dash-value {
  margin-top: 8px;
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 26px;
  letter-spacing: -0.5px;
}

.dash-mini {
  margin-top: 8px;
  color: rgba(234,245,242,0.78);
  font-weight: 800;
  font-size: 12px;
}

/* Ranking */
.ranking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.ranking-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 16px;
}

.ranking-refresh {
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: #eaf5f2;
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 950;
  transition: transform 140ms ease, background 140ms ease;
}

.ranking-refresh:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
}

.ranking-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ranking-card {
  border-radius: 18px;
  background: rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 18px 50px rgba(0,0,0,0.20);
  overflow: hidden;
}

.rank-head {
  display: grid;
  grid-template-columns: 60px 1.3fr 1fr 120px 120px;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.18);
  border-bottom: 1px solid rgba(255,255,255,0.12);
  color: rgba(234,245,242,0.9);
  font-weight: 1000;
  font-size: 12px;
}

.rank-row {
  display: grid;
  grid-template-columns: 60px 1.3fr 1fr 120px 120px;
  gap: 10px;
  padding: 12px 14px;
  color: #eaf5f2;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  align-items: center;
  transition: background 140ms ease;
}

.rank-row:hover {
  background: rgba(255,255,255,0.06);
}

.rank-row.me {
  background: rgba(70,176,74,0.14);
}

.rank-muted {
  display: block;
  padding: 14px;
  color: rgba(234,245,242,0.85);
  font-weight: 900;
}

.rank-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rank-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.16);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.rank-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rank-avatar-fallback {
  font-weight: 1000;
  color: #eaf5f2;
  font-size: 14px;
}

.rank-name {
  font-weight: 950;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-title {
  color: rgba(234,245,242,0.86);
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-points,
.rank-done {
  font-weight: 1000;
}

/* responsive */
@media (max-width: 860px) {
  .rank-head,
  .rank-row {
    grid-template-columns: 50px 1fr 110px;
  }

  .rank-head > :nth-child(3),
  .rank-head > :nth-child(5),
  .rank-row > :nth-child(3),
  .rank-row > :nth-child(5) {
    display: none;
  }
}
</style>
