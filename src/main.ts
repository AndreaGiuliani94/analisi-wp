import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import './registerServiceWorker'
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
app.use(createPinia());

const auth = useAuthStore();
auth.loadFromStorage();

app.use(router);
app.mount("#app");


