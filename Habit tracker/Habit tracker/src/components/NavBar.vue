<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="brand">
        <router-link class="brand-link" :to="{ name: 'home' }">
          Habi<span class="brand-accent">tree</span>
        </router-link>
      </div>

      <!-- NAV: não logado -->
      <nav v-if="!userStore.isLogged" class="nav">
        <router-link class="nav-link" :to="{ name: 'login' }" active-class="active">
          Iniciar sessão
        </router-link>
        <router-link class="nav-link" :to="{ name: 'register' }" active-class="active">
          Registo
        </router-link>
      </nav>

      <!-- NAV: logado -->
      <nav v-else class="nav">
        <router-link class="nav-link" :to="{ name: 'home' }" active-class="active">
          Home
        </router-link>

        <router-link class="nav-link" :to="{ name: 'habits' }" active-class="active">
          Habits
        </router-link>

        <router-link class="nav-link" :to="{ name: 'calendar' }" active-class="active">
          Calendário
        </router-link>

        <router-link class="nav-link" :to="{ name: 'dashboard' }" active-class="active">
          Painel
        </router-link>

        <!-- Perfil: avatar + nome -->
        <router-link class="nav-profile" :to="{ name: 'profile' }" active-class="active">
          <span class="nav-avatar">
            <img
              v-if="avatarImg && !avatarBroken"
              :src="avatarImg"
              alt="Avatar"
              @error="avatarBroken = true"
            />
            <span v-else class="nav-avatar-fallback">{{ initials }}</span>
          </span>

          <span class="nav-user">
            <span class="nav-username">{{ userStore.name }}</span>
            <span class="nav-title">{{ userStore.title }}</span>
          </span>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useUserStore } from "../stores/user";
import { avatarById } from "../data/avatars";

const userStore = useUserStore();
const avatarBroken = ref(false);

watch(
  () => userStore.avatarId,
  () => {
    avatarBroken.value = false;
  }
);

const initials = computed(() => {
  const n = (userStore.name || "U").trim();
  return n ? n[0].toUpperCase() : "U";
});

const avatarImg = computed(() => {
  const a = avatarById(userStore.avatarId || "starter_scout");
  return a?.img || null;
});
</script>

<style scoped>
/* NAVBAR BASE */
.navbar {
  width: 100%;
  background: #255a50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.navbar-inner {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 14px 16px; /* ✅ mais alto */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* BRAND */
.brand-link {
  text-decoration: none;
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 22px; /* ✅ maior */
  letter-spacing: 0.2px;
}

.brand-accent {
  color: #46b04a;
}

/* NAV */
.nav {
  display: flex;
  align-items: center;
  gap: 10px; /* ✅ mais espaço */
  flex-wrap: wrap;
}

/* LINKS */
.nav-link {
  text-decoration: none;
  color: rgba(234, 245, 242, 0.88);
  font-weight: 950;
  font-size: 14px; /* ✅ maior */
  padding: 10px 12px; /* ✅ maior hitbox */
  border-radius: 999px;
  border: 1px solid transparent;

  transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
  color: #eaf5f2;
}

.nav-link.active {
  background: rgba(70, 176, 74, 0.16);
  border-color: rgba(70, 176, 74, 0.28);
  color: #eaf5f2;
}

/* PERFIL */
.nav-profile {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.10);

  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.nav-profile:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.nav-profile.active {
  border-color: rgba(70, 176, 74, 0.30);
  background: rgba(70, 176, 74, 0.12);
}

/* AVATAR */
.nav-avatar {
  width: 38px;   /* ✅ maior */
  height: 38px;  /* ✅ maior */
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.nav-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-avatar-fallback {
  font-weight: 1000;
  color: #eaf5f2;
  font-size: 16px; /* ✅ maior */
}

/* USER TEXT */
.nav-user {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}

.nav-username {
  color: #eaf5f2;
  font-weight: 1000;
  font-size: 13.5px; /* ✅ maior */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.nav-title {
  margin-top: 2px;
  color: rgba(234, 245, 242, 0.82);
  font-weight: 900;
  font-size: 12px; /* ✅ maior */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

/* RESPONSIVO */
@media (max-width: 640px) {
  .navbar-inner {
    padding: 12px 12px;
  }

  .brand-link {
    font-size: 20px;
  }

  .nav-link {
    font-size: 13.5px;
    padding: 9px 10px;
  }

  .nav-profile {
    padding: 9px 10px;
  }

  .nav-username,
  .nav-title {
    max-width: 120px;
  }
}
</style>
