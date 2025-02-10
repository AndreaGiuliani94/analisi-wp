import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css';
import router from './router';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPauseCircle, faPlayCircle, faClock, faHourglass } from '@fortawesome/free-regular-svg-icons'

library.add(faPauseCircle, faPlayCircle, faClock, faHourglass)
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app');