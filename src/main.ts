import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import './registerServiceWorker'
import Vue3GoogleLogin from "vue3-google-login";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.use(createPinia());
app.use(Vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});
app.use(router);
const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3000,
};
app.use(Toast, options);
app.mount("#app");


