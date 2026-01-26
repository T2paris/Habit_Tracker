<template>
  <div class="app-shell">
    <Navbar />

    <main class="app-main">
      <router-view />
    </main>

    <Chatbot />
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Chatbot from "./components/Habitbot.vue";
</script>

<style>
/* RESET BÁSICO */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ✅ garante que nunca aparece branco */
html,
body,
#app {
  height: 100%;
  background: #2e6b60;
}

/* ✅ layout da app */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #2e6b60;
}

/* ✅ router-view cresce e empurra o “resto” */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
}
</style>
