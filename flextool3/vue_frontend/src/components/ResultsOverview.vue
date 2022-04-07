<template>
    <n-grid :cols="3">
        <n-grid-item v-for="plot in plots" :key="plot.divId">
            <div id="{{ plot.divId }}"></div>
        </n-grid-item>
    </n-grid>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
// import Plotly from "plotly.js-cartesian-dist-min";

export default {
    setup() {
        const plots = ref([{divId="load-shedding"}]);
        return {
            plots: plots,
        };
    },
}
</script>
