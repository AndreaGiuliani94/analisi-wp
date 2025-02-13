import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faPauseCircle,
  faPlayCircle,
} from "@fortawesome/free-regular-svg-icons";
import {
  faRefresh,
  faBackward,
  faForward,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

library.add(faPauseCircle, faPlayCircle, faRefresh, faBackward, faForward, faPlay);
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
