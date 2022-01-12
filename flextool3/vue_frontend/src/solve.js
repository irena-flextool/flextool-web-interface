import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import SolveApp from "./components/SolveApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("solve-app", SolveApp);
app.mount("#solve-app");
