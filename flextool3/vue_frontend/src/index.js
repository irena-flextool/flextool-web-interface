import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
//import * as Communication from "./modules/communication.js";
import IndexApp from "./components/IndexApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("index-app", IndexApp);
app.mount("#index-app");
