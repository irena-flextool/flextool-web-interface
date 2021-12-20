import * as Vue from "vue/dist/vue.esm-bundler.js";
import naive from "naive-ui";
import ParameterValueTable from "./components/ParameterValueTable.vue";

const app = Vue.createApp({
});
app.use(naive);
app.component("parameter-value-table", ParameterValueTable);
app.mount("#edit-app");
