import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import './registerServiceWorker'
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFileExcel } from "@fortawesome/free-regular-svg-icons";
import {
  faRefresh,
  faBackward,
  faForward,
  faPlay,
  faPause,
  faTableList,
  faCalendarDays,
  faArrowLeft,
  faTriangleExclamation,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faPlay,
  faPause,
  faRefresh,
  faBackward,
  faForward,
  faPlay,
  faTableList,
  faCalendarDays,
  faFileExcel,
  faArrowLeft,
  faTriangleExclamation,
  faEraser
);
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
