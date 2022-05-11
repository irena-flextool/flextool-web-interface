import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import SolvesApp from "./components/SolvesApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("solves-app", SolvesApp);
app.mount("#solves-app");
