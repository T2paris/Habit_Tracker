<template>
  <main class="profile-page">
    <section class="profile-container">
      <div class="profile-head">
        <h1 class="profile-title">Perfil</h1>
        <p class="profile-sub">Gere a tua conta, avatar e segurança.</p>
      </div>

      <div class="profile-card">
        <!-- ESQUERDA: avatar atual + logout + meus avatares -->
        <div class="profile-left">
          <div class="profile-avatar">
            <img
              v-if="currentAvatarImg && !avatarBroken"
              :src="currentAvatarImg"
              alt="Avatar"
              @error="avatarBroken = true"
            />
            <div v-else class="profile-avatar-fallback">
              {{ initials }}
            </div>
          </div>

          <div class="profile-current">
            <div class="profile-current-label">Avatar equipado</div>
            <div class="profile-current-value">
              {{ currentAvatar?.name || "Starter Scout" }}
            </div>
          </div>

          <button class="profile-logout" type="button" @click="logout">
            Terminar sessão
          </button>

          <!-- MEUS AVATARES (só equipar) -->
          <div class="owned-block">
            <div class="owned-head">
              <div class="owned-title">Os meus avatares</div>
              <div class="owned-sub">Seleciona um avatar que já compraste.</div>
            </div>

            <div v-if="ownedAvatarsList.length" class="owned-grid">
              <button
                v-for="a in ownedAvatarsList"
                :key="a.id"
                class="owned-card"
                :class="{ active: userStore.avatarId === a.id }"
                type="button"
                @click="equipOwned(a.id)"
              >
                <div class="owned-img">
                  <img
                    v-if="a.img && !brokenImgs[a.id]"
                    :src="a.img"
                    :alt="a.name"
                    @error="markBroken(a.id)"
                  />
                  <div v-else class="owned-img-fallback">{{ initials }}</div>
                </div>

                <div class="owned-info">
                  <div class="owned-name">{{ a.name }}</div>
                  <div class="owned-tier">{{ a.tier }}</div>
                </div>

                <div class="owned-action">
                  <span v-if="userStore.avatarId === a.id" class="owned-badge">
                    Equipado
                  </span>
                  <span v-else class="owned-cta">Equipar</span>
                </div>
              </button>
            </div>

            <p v-else class="owned-empty">
              Ainda só tens o avatar inicial. Compra um na loja 👇
            </p>
          </div>

          <p v-if="userStore.error" class="profile-error">{{ userStore.error }}</p>
          <p v-if="success" class="profile-success">{{ success }}</p>
        </div>

        <!-- DIREITA: dados + loja -->
        <div class="profile-right">
          <!-- Dados -->
          <div class="profile-section">
            <div class="profile-section-title">Dados da conta</div>

            <div class="profile-field">
              <label class="profile-label">Nome</label>
              <input
                v-model.trim="name"
                class="profile-input"
                type="text"
                placeholder=""
              />
            </div>

            <div class="profile-field">
              <label class="profile-label">Email</label>
              <input
                :value="userStore.email || ''"
                class="profile-input readonly"
                type="email"
                readonly
              />
            </div>

            <div class="profile-divider"></div>

            <!-- ✅ PASSWORDS (como pediste) -->
            <div class="profile-field">
              <label class="profile-label">Palavra-passe atual</label>
              <input
                :value="currentPassword"
                class="profile-input readonly"
                type="text"
                readonly
              />
            </div>

            <div class="profile-field">
              <label class="profile-label">Nova palavra-passe (opcional)</label>
              <input
                v-model="newPassword"
                class="profile-input"
                type="password"
                placeholder=""
                autocomplete="new-password"
              />
            </div>

            <div class="profile-actions">
              <button
                class="profile-save"
                type="button"
                :disabled="userStore.loading"
                @click="save"
              >
                {{ userStore.loading ? "A guardar..." : "Guardar" }}
              </button>
            </div>

            <p v-if="localError" class="profile-error">{{ localError }}</p>
          </div>

          <!-- Loja: apenas compra -->
          <div class="profile-section">
            <div class="avatar-shop-header">
              <div>
                <h2 class="avatar-shop-title">Loja de Avatares</h2>
                <p class="avatar-shop-sub">Aqui só compras avatares novos.</p>
              </div>

              <div class="avatar-shop-points">
                Pontos: <strong>{{ userStore.points }}</strong>
              </div>
            </div>

            <div class="avatar-grid">
              <button
                v-for="a in shopAvatars"
                :key="a.id"
                class="avatar-card"
                :class="{
                  owned: isOwned(a.id),
                  disabled: isOwned(a.id) || a.price === 0,
                }"
                type="button"
                :disabled="isOwned(a.id) || a.price === 0 || userStore.loading"
                @click="buyOnly(a)"
              >
                <div class="avatar-img">
                  <img
                    v-if="a.img && !brokenImgs[a.id]"
                    :src="a.img"
                    :alt="a.name"
                    @error="markBroken(a.id)"
                  />
                  <div v-else class="avatar-img-fallback">{{ initials }}</div>
                </div>

                <div class="avatar-info">
                  <div class="avatar-name">{{ a.name }}</div>
                  <div class="avatar-tier">{{ a.tier }}</div>
                </div>

                <div class="avatar-action">
                  <template v-if="a.price === 0">
                    <span class="avatar-badge owned">Inicial</span>
                  </template>

                  <template v-else-if="isOwned(a.id)">
                    <span class="avatar-badge owned">Já tens</span>
                  </template>

                  <template v-else>
                    <span class="avatar-price">{{ a.price }} pts</span>
                    <span class="avatar-cta">Comprar</span>
                  </template>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { AVATARS, avatarById } from "../data/avatars";

const router = useRouter();
const userStore = useUserStore();

const name = ref(userStore.name ?? "");
const newPassword = ref("");

const success = ref("");
const localError = ref("");

const avatarBroken = ref(false);
const brokenImgs = reactive({});

watch(
  () => userStore.name,
  (v) => {
    name.value = v ?? "";
  }
);

const initials = computed(() => {
  const n = (userStore.name || "U").trim();
  return n ? n[0].toUpperCase() : "U";
});

const tierMap = {
  starter_scout: "Tier 1",
  focus_monk: "Tier 1",
  street_runner: "Tier 1",
  spartan_ghost: "Tier 2",
  cyber_vigilante: "Tier 2",
  shadow_assassin: "Tier 2",
  blaze_duelist: "Tier 3",
  titan_berserker: "Tier 3",
  neon_samurai: "Tier 3",
  habit_legend: "Tier 4",
  void_king: "Tier 4",
  ascended_hero: "Tier 4",
  god_discipline: "Tier 5",
};

function withTier(a) {
  return { ...a, tier: tierMap[a.id] || "Tier" };
}

const currentAvatar = computed(() => avatarById(userStore.avatarId));
const currentAvatarImg = computed(() => currentAvatar.value?.img || null);

// ✅ mostra a password que existe no userStore (vinda do JSON server)
// se não existir (por segurança/erro), mostra "—"
const currentPassword = computed(() => {
  const v = userStore?.password;
  return typeof v === "string" && v.length ? v : "—";
});

function isOwned(id) {
  const list = Array.isArray(userStore.ownedAvatars) ? userStore.ownedAvatars : [];
  return list.includes(id);
}

function markBroken(id) {
  brokenImgs[id] = true;
  if (userStore.avatarId === id) avatarBroken.value = true;
}

const ownedAvatarsList = computed(() => {
  const owned = Array.isArray(userStore.ownedAvatars) ? userStore.ownedAvatars : [];
  const set = new Set(owned);

  return AVATARS.filter((a) => set.has(a.id)).map(withTier);
});

const shopAvatars = computed(() => AVATARS.map(withTier));

async function save() {
  success.value = "";
  localError.value = "";
  userStore.error = null;

  const pw = newPassword.value.trim();

  // ✅ se quiser mudar password, valida minimamente
  if (pw) {
    if (pw.length < 4) {
      localError.value = "A nova password deve ter pelo menos 4 caracteres.";
      return;
    }

    // ✅ opcional: bloquear repetir a mesma password
    if (typeof userStore.password === "string" && pw === userStore.password) {
      localError.value = "A nova password tem de ser diferente da atual.";
      return;
    }
  }

  const ok = await userStore.updateProfile({
    name: name.value,
    activeAvatarId: userStore.avatarId,
    password: pw ? pw : undefined,
  });

  if (ok) {
    success.value = "Perfil guardado ✅";
    newPassword.value = "";
  }
}

async function equipOwned(id) {
  success.value = "";
  localError.value = "";
  userStore.error = null;

  const ok = await userStore.equipAvatar(id);
  if (ok) {
    avatarBroken.value = false;
    success.value = "Avatar equipado ✅";
  }
}

async function buyOnly(a) {
  if (!a || a.price === 0) return;
  if (isOwned(a.id)) return;

  success.value = "";
  localError.value = "";
  userStore.error = null;

  const ok = await userStore.buyAvatar({ avatarId: a.id, price: a.price });
  if (ok) {
    avatarBroken.value = false;
    success.value = "Avatar comprado ✅ (vai aos teus avatares para equipar)";
  }
}

function logout() {
  userStore.logout();
  router.push({ name: "login" });
}
</script>

<style scoped>
/* (mantive o CSS igual ao ficheiro anterior, sem mudanças de layout/estilo geral) */

.profile-page {
  min-height: 100%;
  background: #2e6b60;
  padding: 28px 16px 90px;
  display: flex;
  justify-content: center;
}

.profile-container {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 28px;
}

.profile-sub {
  color: rgba(234, 245, 242, 0.85);
  font-weight: 800;
  font-size: 12px;
}

.profile-card {
  border-radius: 18px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 14px;
}

.profile-left {
  border-radius: 18px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 1000;
  font-size: 34px;
  color: #eaf5f2;
  background: rgba(0, 0, 0, 0.12);
}

.profile-current {
  width: 100%;
  text-align: center;
}
.profile-current-label {
  color: rgba(234, 245, 242, 0.78);
  font-weight: 900;
  font-size: 12px;
}
.profile-current-value {
  margin-top: 4px;
  color: #eaf5f2;
  font-weight: 1000;
}

.profile-logout {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 1000;
  background: rgba(255, 255, 255, 0.1);
  color: #eaf5f2;
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.profile-logout:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* meus avatares */
.owned-block {
  width: 100%;
  border-radius: 18px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.owned-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.owned-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 14px;
}

.owned-sub {
  color: rgba(234, 245, 242, 0.8);
  font-weight: 800;
  font-size: 12px;
}

.owned-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.owned-card {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #eaf5f2;
  border-radius: 16px;
  padding: 10px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 10px;
  text-align: left;
}
.owned-card:hover {
  background: rgba(255, 255, 255, 0.09);
}
.owned-card.active {
  border-color: rgba(70, 176, 74, 0.35);
  background: rgba(70, 176, 74, 0.12);
}

.owned-img {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;
}
.owned-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.owned-img-fallback {
  font-weight: 1000;
  font-size: 18px;
  color: #eaf5f2;
}

.owned-info {
  min-width: 0;
}
.owned-name {
  font-weight: 1000;
  font-size: 13px;
}
.owned-tier {
  margin-top: 4px;
  font-weight: 900;
  font-size: 12px;
  opacity: 0.85;
}

.owned-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.owned-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  background: rgba(70, 176, 74, 0.18);
  border: 1px solid rgba(70, 176, 74, 0.3);
}

.owned-cta {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
}

.owned-empty {
  color: rgba(234, 245, 242, 0.86);
  font-weight: 850;
  font-size: 12px;
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-section {
  border-radius: 18px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.profile-section-title {
  color: #eaf5f2;
  font-weight: 1000;
  margin-bottom: 12px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.profile-label {
  color: rgba(234, 245, 242, 0.86);
  font-weight: 900;
  font-size: 12px;
}

.profile-input {
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
.profile-input::placeholder {
  color: rgba(234, 245, 242, 0.6);
  font-weight: 800;
}
.profile-input.readonly {
  opacity: 0.9;
  cursor: not-allowed;
}

.profile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 8px 0 14px;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.profile-save {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 1000;
  background: #46b04a;
  color: #103b31;
}
.profile-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-error {
  width: 100%;
  color: #ffd6d6;
  font-weight: 900;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
  text-align: center;
}

.profile-success {
  width: 100%;
  color: rgba(234, 245, 242, 0.95);
  font-weight: 900;
  background: rgba(70, 176, 74, 0.18);
  border: 1px solid rgba(70, 176, 74, 0.3);
  padding: 10px 12px;
  border-radius: 14px;
  text-align: center;
}

/* loja */
.avatar-shop-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.avatar-shop-title {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 16px;
}
.avatar-shop-sub {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.82);
  font-weight: 800;
  font-size: 12px;
}
.avatar-shop-points {
  color: rgba(234, 245, 242, 0.9);
  font-weight: 900;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 10px 12px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.avatar-card {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.12);
  color: #eaf5f2;
  border-radius: 16px;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  display: grid;
  gap: 10px;
}
.avatar-card:hover {
  background: rgba(255, 255, 255, 0.06);
}
.avatar-card.disabled,
.avatar-card:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.avatar-img {
  width: 100%;
  height: 92px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;
}
.avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-img-fallback {
  font-weight: 1000;
  font-size: 26px;
  color: #eaf5f2;
}

.avatar-info {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}
.avatar-name {
  font-weight: 1000;
  font-size: 13px;
}
.avatar-tier {
  font-weight: 900;
  font-size: 12px;
  opacity: 0.85;
}

.avatar-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.avatar-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
}
.avatar-badge.owned {
  opacity: 0.95;
}

.avatar-price {
  font-weight: 1000;
  font-size: 12px;
}
.avatar-cta {
  font-weight: 1000;
  font-size: 12px;
  opacity: 0.9;
}

@media (max-width: 980px) {
  .profile-card {
    grid-template-columns: 1fr;
  }
  .avatar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .avatar-grid {
    grid-template-columns: 1fr;
  }
}
</style>
