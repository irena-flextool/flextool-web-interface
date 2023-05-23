import 'vite/modulepreload-polyfill';
import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import EntitiesApp from "./components/EntitiesApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("entities-app", EntitiesApp);
app.mount("#entities-app");
