<template>
    <div :id="plotId"></div>
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import Plotly from "plotly.js-cartesian-dist-min";

export default {
    props: {
        identifier: {type: [String, Number], required: true},
        plotData: {type: Array, required: true},
        plotLayout: {type: Object, required: false, default: () => {}}
    },
    setup(props) {
        const plotId = ref(`plot-${props.identifier}`);
        onMounted(function() {
            Plotly.newPlot(plotId.value, props.plotData, props.plotLayout);
        });
        return {
            plotId: plotId,
        };
    },
}
</script>
