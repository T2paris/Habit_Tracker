import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Dashboard from "../pages/Dashboard.vue";
import Habits from "../pages/Habits.vue";
import Profile from "../pages/Profile.vue";
import Calendar from "../pages/Calendar.vue";

const routes = [
  { path: "/", name: "home", component: Home },

  { path: "/login", name: "login", component: Login },
  { path: "/register", name: "register", component: Register },

  { path: "/dashboard", name: "dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/habits", name: "habits", component: Habits, meta: { requiresAuth: true } },
  { path: "/calendar", name: "calendar", component: Calendar, meta: { requiresAuth: true } },
  { path: "/profile", name: "profile", component: Profile, meta: { requiresAuth: true } },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  const isLogged = userStore.isLogged;

  if (to.meta?.requiresAuth && !isLogged) return { name: "login" };
  if ((to.name === "login" || to.name === "register") && isLogged) return { name: "home" };

  return true;
});

export default router;
