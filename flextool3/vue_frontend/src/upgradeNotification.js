import 'vite/modulepreload-polyfill';
import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import UpgradeNotificationApp from "./components/UpgradeNotificationApp.vue";

const app = Vue.createApp({});
app.use(naive);
app.component("upgrade-notification-app", UpgradeNotificationApp);
app.mount("#upgrade-notification-app");
