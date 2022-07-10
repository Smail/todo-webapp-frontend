import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"
import "@/assets/index.scss";
import "@/assets/themes/theme-dark.scss";
import "@/assets/themes/theme-light.scss";

window.Buffer = require("buffer/").Buffer;

createApp(App)
    .use(router)
    .mount("#app");
