<template>
  <div class="hb-root">
    <button class="hb-fab" type="button" @click="toggle">🤖</button>

    <div v-if="open" class="hb-panel" role="dialog" aria-label="HabitBot">
      <div class="hb-header">
        <div class="hb-header-title">HabitBot</div>
        <button class="hb-header-close" type="button" @click="toggle">✕</button>
      </div>

      <div class="hb-body" ref="bodyEl">
        <div
          v-for="m in messages"
          :key="m.id"
          class="hb-row"
          :class="m.role === 'user' ? 'hb-row-user' : 'hb-row-bot'"
        >
          <div
            class="hb-bubble"
            :class="m.role === 'user' ? 'hb-bubble-user' : 'hb-bubble-bot'"
          >
            {{ m.text }}
          </div>
        </div>

        <!-- indicador "a escrever..." -->
        <div v-if="typing" class="hb-row hb-row-bot">
          <div class="hb-bubble hb-bubble-bot hb-typing">A escrever…</div>
        </div>
      </div>

      <div class="hb-actions">
        <button class="hb-chip" type="button" @click="sendMotivation" :disabled="typing">
          Motiva-me
        </button>
        <button class="hb-chip" type="button" @click="suggestHabit" :disabled="typing">
          Sugere 1 hábito
        </button>
        <button class="hb-chip" type="button" @click="status" :disabled="typing">
          O meu progresso
        </button>

        <!-- ação contextual (não mexe no design, é só mais um chip) -->
        <button
          v-if="userStore.isLogged && !habitsStore.items?.length"
          class="hb-chip"
          type="button"
          @click="goHabits"
          :disabled="typing"
        >
          Ir a Hábitos
        </button>
      </div>

      <div v-if="suggestions.length" class="hb-suggestions">
        <div class="hb-suggestions-title">Sugestões</div>

        <button
          v-for="h in suggestions"
          :key="h.id"
          class="hb-suggestion"
          type="button"
          @click="doHabit(h.id)"
          :disabled="typing"
        >
          <span class="hb-suggestion-title">{{ h.title }}</span>
          <span class="hb-suggestion-meta">{{ h.progress }}/{{ h.target }}</span>
        </button>
      </div>

      <form class="hb-input" @submit.prevent="sendUser">
        <input
          ref="inputEl"
          v-model.trim="input"
          type="text"
          placeholder=""
          :disabled="typing"
          @keydown="onKeydown"
        />
        <button type="submit" :disabled="typing || !input.trim()">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useHabitsStore } from "../stores/habits";
import { useUserStore } from "../stores/user";
import { fetchMotivationQuote } from "../services/publicApi";

const router = useRouter();
const habitsStore = useHabitsStore();
const userStore = useUserStore();

const open = ref(false);
const input = ref("");
const bodyEl = ref(null);
const inputEl = ref(null);

const typing = ref(false);

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const STORAGE_KEY = "habitbot_messages_v1";

const messages = ref([
  { id: uid(), role: "bot", text: "Olá! Eu sou o HabitBot 🤖 Vamos completar hábitos hoje?" },
]);

const suggestions = ref([]);

const inProgressHabits = computed(() => {
  return (habitsStore.items || []).filter((h) => {
    const t = Number(h?.target) || 0;
    const p = Number(h?.progress) || 0;
    return t > 0 ? p < t : true;
  });
});

async function scrollDown() {
  await nextTick();
  if (!bodyEl.value) return;
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}

function push(role, text) {
  messages.value.push({ id: uid(), role, text });
  scrollDown();
  saveMessages();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function saveMessages() {
  try {
    // guarda só as últimas 80 para não crescer infinito
    const trimmed = messages.value.slice(-80);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    // se falhar, ignora (sem quebrar app)
  }
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      messages.value = parsed;
    }
  } catch (e) {
    // ignora
  }
}

function focusInput() {
  nextTick(() => {
    inputEl.value?.focus?.();
  });
}

function toggle() {
  open.value = !open.value;

  if (open.value) {
    // carrega hábitos sem spammar status sempre
    if (userStore.isLogged) {
      habitsStore.load();
      push("bot", "Estou contigo 🙂 Queres motivação, uma sugestão, ou ver o teu progresso?");
    } else {
      push("bot", "Inicia sessão para eu ver os teus hábitos 🙂");
    }

    focusInput();
  }
}

function onKeydown(e) {
  // Esc fecha
  if (e.key === "Escape") {
    open.value = false;
    return;
  }
}

function goHabits() {
  open.value = false;
  router.push({ name: "habits" });
}

/**
 * ✅ API pública externa:
 * - tenta buscar frase real na Quotable
 * - se falhar, usa fallback local
 */
async function sendMotivation() {
  const fallback = [
    "Pequenos passos, grandes resultados. Faz só 1 agora. ✅",
    "Não precisas de motivação — precisas de começar. Bora. 💪",
    "Hoje é dia de consistência. 5 minutos já contam.",
    "Faz o mais fácil primeiro. Ganha ritmo. Depois vem o resto.",
  ];

  typing.value = true;
  suggestions.value = [];
  push("bot", "A procurar uma frase para ti…");

  try {
    const quote = await fetchMotivationQuote();
    // remove a msg “a procurar…”
    messages.value.pop();
    push("bot", quote);
  } catch (e) {
    messages.value.pop();
    push("bot", pickRandom(fallback));
  } finally {
    typing.value = false;
    focusInput();
  }
}

function status() {
  if (!userStore.isLogged) {
    push("bot", "Inicia sessão para eu ver os teus hábitos 🙂");
    return;
  }

  const total = habitsStore.items?.length || 0;
  const pending = inProgressHabits.value.length;
  const done = Math.max(0, total - pending);

  push("bot", `Tens ${total} hábitos. ${done} concluídos e ${pending} por concluir.`);

  if (pending > 0) push("bot", "Queres que eu te sugira um para fazer agora?");
  else if (total > 0) push("bot", "Já completaste tudo! 🎉 Queres criar um hábito novo?");
  else push("bot", "Ainda não tens hábitos. Vai a Hábitos e cria o teu primeiro 🙂");
}

function suggestHabit() {
  if (!userStore.isLogged) {
    push("bot", "Inicia sessão para eu sugerir hábitos 🙂");
    return;
  }

  const list = inProgressHabits.value;
  if (!list.length) {
    suggestions.value = [];
    push("bot", "Não há hábitos em progresso agora. 🎉");
    return;
  }

  const h = pickRandom(list);
  suggestions.value = [h];

  const pct = Math.round((Number(h.progress || 0) / Math.max(1, Number(h.target || 1))) * 100);
  push("bot", `Sugestão: "${h.title}". Estás em ${h.progress}/${h.target} (${pct}%). Clica na sugestão para avançar +1.`);
}

async function doHabit(id) {
  typing.value = true;
  suggestions.value = [];

  try {
    await habitsStore.incrementProgress(id);

    const h = habitsStore.items.find((x) => x.id === id);
    if (!h) return push("bot", "Boa! Atualizei o progresso. ✅");

    const t = Number(h.target) || 0;
    const p = Number(h.progress) || 0;

    if (t > 0 && p >= t) push("bot", `🔥 Completaste "${h.title}"! +10 pontos. Continua!`);
    else push("bot", `Boa! "${h.title}" agora está em ${p}/${t}.`);
  } finally {
    typing.value = false;
    focusInput();
  }
}

function replyToUser(text) {
  const t = text.toLowerCase();

  if (t.includes("ajuda") || t.includes("help")) {
    push("bot", "Podes escrever: 'motivação', 'sugere', 'progresso'. Ou usar os botões 🙂");
    return;
  }
  if (t.includes("motiv")) return sendMotivation();
  if (t.includes("suger")) return suggestHabit();
  if (t.includes("progress") || t.includes("progresso") || t.includes("status")) return status();

  push("bot", "Entendi 🙂 Queres motivação, uma sugestão de hábito, ou ver o teu progresso?");
}

function sendUser() {
  const text = input.value.trim();
  if (!text || typing.value) return;

  push("user", text);
  replyToUser(text);
  input.value = "";
  focusInput();
}

onMounted(async () => {
  loadMessages();

  if (userStore.isLogged) await habitsStore.load();
  scrollDown();
});

watch(
  () => messages.value.length,
  () => scrollDown()
);
</script>

<style scoped>
/* tudo com prefixo hb- para evitar conflito com CSS global */

.hb-root {
  position: fixed;
  left: 18px;
  bottom: 18px;
  z-index: 9999;
}

.hb-fab {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  border: none;
  background: #46b04a;
  color: #103b31;
  font-size: 22px;
  cursor: pointer;
  font-weight: 900;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.hb-panel {
  width: 360px;
  max-width: calc(100vw - 36px);
  height: 520px;
  margin-bottom: 12px;

  display: flex;
  flex-direction: column;

  background: #2e6b60;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.hb-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #255a50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.hb-header-title {
  font-weight: 900;
  color: #eaf5f2;
  font-size: 16px;
}

.hb-header-close {
  background: transparent;
  border: none;
  color: #eaf5f2;
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
}

.hb-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hb-row {
  width: 100%;
  display: flex;
}

.hb-row-bot {
  justify-content: flex-start;
}

.hb-row-user {
  justify-content: flex-end;
}

.hb-bubble {
  max-width: 86%;
  padding: 10px 12px;
  border-radius: 14px;
  font-weight: 700;
  line-height: 1.35;
  font-size: 14px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.hb-bubble-bot {
  background: rgba(255, 255, 255, 0.14);
  color: #eaf5f2;
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.hb-bubble-user {
  background: #46b04a;
  color: #103b31;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.hb-typing {
  opacity: 0.85;
  font-style: italic;
}

.hb-actions {
  flex: 0 0 auto;
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.08);
}

.hb-chip {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #eaf5f2;
  padding: 8px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
}
.hb-chip:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hb-suggestions {
  flex: 0 0 auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.06);
}

.hb-suggestions-title {
  font-weight: 900;
  color: #eaf5f2;
}

.hb-suggestion {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #eaf5f2;
  padding: 10px 10px;
  border-radius: 12px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.hb-suggestion:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hb-suggestion-title {
  font-weight: 900;
}

.hb-suggestion-meta {
  font-weight: 800;
  opacity: 0.95;
}

.hb-input {
  flex: 0 0 auto;
  padding: 10px 12px 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  background: #255a50;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.hb-input input {
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.10);
  color: #eaf5f2;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
}

.hb-input input::placeholder {
  color: rgba(234, 245, 242, 0.7);
}

.hb-input button {
  border: none;
  background: #46b04a;
  color: #103b31;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 900;
}
.hb-input button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 420px) {
  .hb-panel {
    width: 320px;
    height: 520px;
  }
}
</style>
