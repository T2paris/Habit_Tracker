<template>
  <main class="auth-page">
    <section class="auth-wrap">
      <div class="auth-card">
        <div class="auth-head">
          <h1 class="auth-title">Registo</h1>
          <p class="auth-subtitle">Cria a tua conta e começa a acompanhar hábitos.</p>
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <label class="auth-field">
            <span class="auth-label">Nome</span>
            <input v-model.trim="name" type="text" placeholder="" required @input="clearAllErrors" />
          </label>

          <label class="auth-field">
            <span class="auth-label">Email</span>
            <input v-model.trim="email" type="email" placeholder="" required @input="clearAllErrors" />
          </label>

          <label class="auth-field">
            <span class="auth-label">Palavra-passe</span>
            <input v-model="password" type="password" placeholder="" required @input="clearAllErrors" />
          </label>

          <!-- ✅ confirmar password -->
          <label class="auth-field">
            <span class="auth-label">Confirmar Palavra-passe</span>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder=""
              required
              @input="clearAllErrors"
            />
          </label>

          <button class="auth-btn" type="submit" :disabled="userStore.loading">
            {{ userStore.loading ? "A criar..." : "Registar" }}
          </button>

          <p v-if="localError" class="auth-error">{{ localError }}</p>
          <p v-else-if="userStore.error" class="auth-error">{{ userStore.error }}</p>

          <p class="auth-foot">
            Já tens conta? 
            <router-link class="auth-link" :to="{ name: 'login' }">Iniciar sessão</router-link>
          </p>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const localError = ref("");

function clearAllErrors() {
  localError.value = "";
  userStore.error = null;
}

async function handleRegister() {
  localError.value = "";
  userStore.error = null;

  if (password.value !== confirmPassword.value) {
    localError.value = "As passwords não coincidem.";
    return;
  }

  const success = await userStore.register({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });

  if (success) router.push({ name: "home" });
}
</script>

<style scoped>
.auth-page {
  min-height: 100%;
  background: #2e6b60;
  padding: 28px 16px 90px;
  display: flex;
  justify-content: center;
}

.auth-wrap {
  width: min(560px, 100%);
}

.auth-card {
  border-radius: 18px;
  padding: 18px;
  background: rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  color: #eaf5f2;
}

.auth-head {
  margin-bottom: 14px;
}

.auth-title {
  font-weight: 1000;
  font-size: 22px;
  color: #eaf5f2;
}

.auth-subtitle {
  margin-top: 6px;
  color: rgba(234, 245, 242, 0.85);
  font-weight: 900;
  font-size: 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-label {
  font-size: 12px;
  font-weight: 950;
  color: rgba(234, 245, 242, 0.85);
}

.auth-field input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.10);
  color: #eaf5f2;
  border-radius: 12px;
  padding: 12px;
  font-weight: 900;
  outline: none;
}

.auth-field input::placeholder {
  color: rgba(234, 245, 242, 0.65);
  font-weight: 850;
}

.auth-btn {
  margin-top: 6px;
  border-radius: 14px;
  border: 1px solid rgba(70, 176, 74, 0.30);
  background: rgba(70, 176, 74, 0.18);
  color: #eaf5f2;
  padding: 12px;
  font-weight: 1000;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.auth-btn:hover {
  transform: translateY(-1px);
  background: rgba(70, 176, 74, 0.22);
  border-color: rgba(70, 176, 74, 0.40);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-error {
  margin-top: 4px;
  color: #ffe3e3;
  font-weight: 950;
  background: rgba(255, 0, 0, 0.14);
  border: 1px solid rgba(255, 0, 0, 0.25);
  padding: 10px 12px;
  border-radius: 14px;
}

.auth-foot {
  margin-top: 4px;
  color: rgba(234, 245, 242, 0.84);
  font-weight: 900;
  font-size: 12px;
}

.auth-link {
  color: #eaf5f2;
  font-weight: 1000;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
