import 'vite/modulepreload-polyfill';
import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import ScenariosApp from "./components/ScenariosApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("scenarios-app", ScenariosApp);
app.mount("#scenarios-app");
