import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/style.css"

import { useUserStore } from "./stores/user";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  // carregar sessão ANTES de montar a app
  const userStore = useUserStore();
  await userStore.load();

  app.use(router);
  app.mount("#app");
}

bootstrap();
