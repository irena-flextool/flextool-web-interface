import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import RunApp from "./components/RunApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("run-app", RunApp);
app.mount("#run-app");
