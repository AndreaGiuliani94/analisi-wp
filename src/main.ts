import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import './registerServiceWorker'
import Vue3GoogleLogin from "vue3-google-login";
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);
app.use(createPinia());
app.use(Vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'bottom-right',
} as ToastContainerOptions);
app.mount("#app");


