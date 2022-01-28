import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import ResultsApp from "./components/ResultsApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("results-app", ResultsApp);
app.mount("#results-app");
