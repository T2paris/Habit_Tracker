import { defineStore } from "pinia";
import { AVATARS } from "../data/avatars";

/**
 * - API configurável:
 * - Se tiveres .env com VITE_API_URL, usa isso (ex: http://127.0.0.1:3000)
 * - Senão usa 127.0.0.1 por defeito (evita problemas de IPv6 com "localhost")
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
const API_URL = `${API_BASE}/users`;

/**
 * Normaliza IDs antigos para os IDs reais do avatars.js
 * (para não quebrares users antigos no JSON Server)
 */
function normalizeAvatarId(id) {
  if (!id) return "starter_scout";

  const map = {
    starter: "starter_scout",
    "focus-monk": "focus_monk",
    "street-runner": "street_runner",
    "spartan-ghost": "spartan_ghost",
    "cyber-vigilante": "cyber_vigilante",
    "shadow-assassin": "shadow_assassin",
    "blaze-duelist": "blaze_duelist",
    "titan-berserker": "titan_berserker",
    "neon-samurai": "neon_samurai",
    "habit-legend": "habit_legend",
    "void-king": "void_king",
    "ascended-hero": "ascended_hero",
    "god-of-discipline": "god_discipline",
  };

  const normalized = map[id] || id;
  const exists = AVATARS.some((a) => a.id === normalized);
  return exists ? normalized : "starter_scout";
}

function normalizeOwnedAvatars(list) {
  const arr = Array.isArray(list) ? list : [];
  const normalized = arr.map(normalizeAvatarId);

  if (!normalized.includes("starter_scout")) normalized.unshift("starter_scout");

  return Array.from(new Set(normalized));
}

function isNetworkError(e) {
  const msg = String(e?.message || e || "");
  return msg.includes("Failed to fetch") || msg.includes("NetworkError");
}

export const useUserStore = defineStore("user", {
  state: () => ({
    id: null,
    name: null,
    email: null,

    // pontos
    xp: 0,

    // métricas
    completedHabits: 0,

    // avatares
    ownedAvatars: ["starter_scout"],
    activeAvatarId: "starter_scout",

    // hábitos guardados no próprio user
    habits: [],

    error: null,
    loading: false,
  }),

  getters: {
    isLogged: (state) => !!state.email,
    points: (state) => Number(state.xp ?? 0),

    avatarId: (state) => state.activeAvatarId || "starter_scout",

    avatar() {
      const id = this.activeAvatarId || "starter_scout";
      return AVATARS.find((a) => a.id === id) || AVATARS[0];
    },

    title() {
      const a = this.avatar;
      return a?.title || a?.name || "Starter Scout";
    },
  },

  actions: {
    async register({ name, email, password }) {
      this.error = null;
      this.loading = true;

      try {
        const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const exists = await res.json();

        if (Array.isArray(exists) && exists.length) {
          this.error = "Email já registado";
          return false;
        }

        const newUser = {
          name,
          email,
          password,

          xp: 0,
          completedHabits: 0,

          ownedAvatars: ["starter_scout"],
          activeAvatarId: "starter_scout",

          habits: [],
        };

        const create = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        if (!create.ok) throw new Error(`API error: ${create.status}`);

        const user = await create.json();

        this._setUser(user);
        this._saveSession({ id: user.id, email: user.email });

        await this._migrateAvatarIdsIfNeeded();
        return true;
      } catch (e) {
        console.error(e);

        if (isNetworkError(e)) {
          this.error =
            "Não consigo ligar à API (JSON Server). Liga com: npm run api (porta 3000).";
        } else {
          this.error = "Erro ao criar conta.";
        }

        return false;
      } finally {
        this.loading = false;
      }
    },

    async login({ email, password }) {
      this.error = null;
      this.loading = true;

      try {
        const res = await fetch(
          `${API_URL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const users = await res.json();

        if (!Array.isArray(users) || !users.length) {
          this.error = "Credenciais inválidas";
          return false;
        }

        const user = users[0];

        this._setUser(user);
        this._saveSession({ id: user.id, email: user.email });

        await this._migrateAvatarIdsIfNeeded();
        return true;
      } catch (e) {
        console.error(e);

        if (isNetworkError(e)) {
          this.error =
            "Não consigo ligar à API (JSON Server). Liga com: npm run api (porta 3000).";
        } else {
          this.error = "Erro ao fazer login.";
        }

        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.id = null;
      this.name = null;
      this.email = null;

      this.xp = 0;
      this.completedHabits = 0;

      this.ownedAvatars = ["starter_scout"];
      this.activeAvatarId = "starter_scout";

      this.habits = [];

      this.error = null;
      this.loading = false;

      localStorage.removeItem("session");
    },

    async load() {
      this.error = null;

      try {
        const raw = localStorage.getItem("session");
        if (!raw) return;

        const session = JSON.parse(raw);
        if (!session?.email) return;

        if (session.id != null) {
          const byId = await fetch(`${API_URL}/${session.id}`);
          if (byId.ok) {
            const user = await byId.json();
            if (user?.email) {
              this._setUser(user);
              await this._migrateAvatarIdsIfNeeded();
              return;
            }
          }
        }

        const res = await fetch(`${API_URL}?email=${encodeURIComponent(session.email)}`);
        if (!res.ok) return;

        const users = await res.json();
        if (!Array.isArray(users) || !users.length) return;

        const user = users[0];
        this._setUser(user);

        if (user?.id != null) {
          this._saveSession({ id: user.id, email: user.email });
        }

        await this._migrateAvatarIdsIfNeeded();
      } catch (e) {
        console.error(e);
      }
    },

    /**
     * ✅ Agora permite atualizar:
     * - name
     * - activeAvatarId
     * - password (se vier e tiver texto)
     */
    async updateProfile({ name, activeAvatarId, password }) {
      if (!this.id) return false;

      this.error = null;
      this.loading = true;

      try {
        const payload = {};

        if (typeof name === "string") payload.name = name;

        if (typeof activeAvatarId === "string") {
          payload.activeAvatarId = normalizeAvatarId(activeAvatarId);
        }

        // ✅ password opcional (só se vier preenchida)
        if (typeof password === "string" && password.trim().length) {
          payload.password = password.trim();
        }

        // se não há nada para atualizar, ok
        if (!Object.keys(payload).length) return true;

        const res = await fetch(`${API_URL}/${this.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const user = await res.json();
        this._setUser(user);

        return true;
      } catch (e) {
        console.error(e);
        this.error = isNetworkError(e)
          ? "Sem ligação à API (JSON Server)."
          : "Erro ao guardar perfil.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async addXp(amount) {
      if (!this.id) return false;

      const add = Number(amount ?? 0);
      if (!Number.isFinite(add) || add === 0) return true;

      try {
        const nextXp = Math.max(0, Number(this.xp ?? 0) + add);

        const res = await fetch(`${API_URL}/${this.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xp: nextXp }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const user = await res.json();
        this._setUser(user);

        return true;
      } catch (e) {
        console.error(e);
        this.error = "Erro ao atualizar pontos.";
        return false;
      }
    },

    async incrementCompletedHabits(amount = 1) {
      if (!this.id) return false;

      try {
        const next = Math.max(0, Number(this.completedHabits ?? 0) + Number(amount ?? 1));

        const res = await fetch(`${API_URL}/${this.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedHabits: next }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const user = await res.json();
        this._setUser(user);

        return true;
      } catch (e) {
        console.error(e);
        this.error = "Erro ao atualizar concluídos.";
        return false;
      }
    },

    async buyAvatar({ avatarId, price }) {
      if (!this.id) return false;

      this.error = null;
      this.loading = true;

      try {
        const normalizedId = normalizeAvatarId(avatarId);
        const owned = new Set(normalizeOwnedAvatars(this.ownedAvatars));
        const cost = Number(price ?? 0);

        if (owned.has(normalizedId)) {
          return await this.updateProfile({ name: this.name, activeAvatarId: normalizedId });
        }

        if (this.points < cost) {
          this.error = "Pontos insuficientes.";
          return false;
        }

        owned.add(normalizedId);
        const nextOwned = Array.from(owned);
        const nextXp = Math.max(0, this.points - cost);

        const res = await fetch(`${API_URL}/${this.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownedAvatars: nextOwned,
            activeAvatarId: normalizedId,
            xp: nextXp,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const user = await res.json();
        this._setUser(user);

        return true;
      } catch (e) {
        console.error(e);
        this.error = "Erro ao comprar avatar.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async equipAvatar(avatarId) {
      if (!this.id) return false;

      const normalizedId = normalizeAvatarId(avatarId);
      const owned = new Set(normalizeOwnedAvatars(this.ownedAvatars));

      if (!owned.has(normalizedId)) {
        this.error = "Ainda não tens este avatar.";
        return false;
      }

      return await this.updateProfile({ name: this.name, activeAvatarId: normalizedId });
    },

    _setUser(user) {
      this.id = user?.id ?? null;
      this.name = user?.name ?? null;
      this.email = user?.email ?? null;

      this.xp = Number(user?.xp ?? 0);
      this.completedHabits = Number(user?.completedHabits ?? 0);

      this.ownedAvatars = normalizeOwnedAvatars(user?.ownedAvatars);
      this.activeAvatarId = normalizeAvatarId(user?.activeAvatarId);

      this.habits = Array.isArray(user?.habits) ? user.habits : [];
    },

    _saveSession({ id, email }) {
      localStorage.setItem("session", JSON.stringify({ id, email }));
    },

    async _migrateAvatarIdsIfNeeded() {
      if (!this.id) return;

      const normalizedActive = normalizeAvatarId(this.activeAvatarId);
      const normalizedOwned = normalizeOwnedAvatars(this.ownedAvatars);

      const needActive = normalizedActive !== this.activeAvatarId;
      const needOwned =
        normalizedOwned.length !== (this.ownedAvatars?.length || 0) ||
        normalizedOwned.some((x, i) => x !== this.ownedAvatars[i]);

      if (!needActive && !needOwned) return;

      try {
        const res = await fetch(`${API_URL}/${this.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activeAvatarId: normalizedActive,
            ownedAvatars: normalizedOwned,
          }),
        });

        if (!res.ok) return;

        const user = await res.json();
        this._setUser(user);
      } catch (e) {
        console.error(e);
      }
    },
  },
});
