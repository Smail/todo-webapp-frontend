import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"
import "./assets/index.css";

window.Buffer = require("buffer/").Buffer;

createApp(App)
    .use(router)
    .mount("#app");
