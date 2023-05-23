import 'vite/modulepreload-polyfill';
import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import IndexApp from "./components/IndexApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("index-app", IndexApp);
app.mount("#index-app");
