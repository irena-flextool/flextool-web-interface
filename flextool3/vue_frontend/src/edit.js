import 'vite/modulepreload-polyfill';
import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import EditorApp from "./components/EditorApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("editor-app", EditorApp);
app.mount("#edit-app");
