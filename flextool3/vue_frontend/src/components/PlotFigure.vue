<template>
    <n-space vertical>
        <n-space>
            <n-select
                v-model:value="plotType"
                :options="plotTypeOptions"
                :consistent-menu-width="false"
                @update:value="replot"
                size="small"
            />
            <n-button
                @click="download"
                size="small"
            >
                Download CSV
            </n-button>
        </n-space>
        <div :id="plotId"></div>
    </n-space>
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import Plotly from "plotly.js-cartesian-dist-min";
import {downloadAsCsv, makeProps} from "../modules/figures.mjs";
import {toBasicChartData} from "../modules/plots.mjs";

/**
 * Plots scatter plot.
 * @param {number[]} dataTable Data to plot.
 * @param {string[]} indexNames Names of indices.
 * @param {string} plotId Target html element id.
 */
function plotScatter(dataTable, indexNames, plotId) {
    let xColumn = 0;
    if(dataTable) {
        xColumn = dataTable[0].length - 2;
    }
    const plotData = toBasicChartData(dataTable, xColumn, "scatter");
    const layout = {xaxis: {title: indexNames[indexNames.length - 1]}};
    const config = {responsive: true};
    Plotly.newPlot(plotId, plotData, layout, config);
}

/**
 * Plots bar chart.
 * @param {number[]} dataTable Data to plot.
 * @param {string[]} indexNames Names of indices.
 * @param {string} plotId Target html element id.
 */
function plotBar(dataTable, indexNames, plotId) {
    let xColumn = 0;
    if(dataTable) {
        xColumn = dataTable[0].length - 2;
    }
    const plotData = toBasicChartData(dataTable, xColumn, "bar");
    const layout = {xaxis: {title: indexNames[indexNames.length - 1]}};
    const config = {responsive: true};
    Plotly.newPlot(plotId, plotData, layout, config);
}

/**
 * Plots stacked bar chart.
 * @param {number[]} dataTable Data to plot.
 * @param {string[]} indexNames Names of indices.
 * @param {string} plotId Target html element id.
 */
function plotStackedBar(dataTable, indexNames, plotId) {
    let xColumn = 0;
    if(dataTable) {
        xColumn = dataTable[0].length - 2;
    }
    const plotData = toBasicChartData(dataTable, xColumn, "bar");
    const layout = {xaxis: {title: indexNames[indexNames.length - 1]}, barmode: "stack"};
    const config = {responsive: true};
    Plotly.newPlot(plotId, plotData, layout, config);
}

/**
 * Changes plot type.
 * @param {object} entityClass Entity class info.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl Analysis interface URL.
 * @param {Ref} plotType Reference to plot type.
 */
function replot(plotType, dataTable, indexNames, plotId) {
    switch(plotType.value) {
        case "bar":
            plotBar(dataTable, indexNames, plotId);
            break;
        case "stacked bar":
            plotStackedBar(dataTable, indexNames, plotId);
            break;
        case "scatter":
            plotScatter(dataTable, indexNames, plotId);
            break;
        default:
            throw Error(`Unknown plot type '${plotType.value}'`);
    }
}

export default {
    props: makeProps(),
    setup(props) {
        const plotId = `plot-${props.identifier}`;
        const plotType = ref("scatter");
        const plotTypeOptions = [
            {label: "Scatter", value: "scatter"},
            {label: "Bars", value: "bar"},
            {label: "Stacked bars", value: "stacked bar"},
        ];
        onMounted(function() {
            replot(plotType, props.dataTable, props.indexNames, plotId);
        });
        return {
            plotId: plotId,
            plotType: plotType,
            plotTypeOptions: plotTypeOptions,
            download() {
                downloadAsCsv(
                    props.dataTable,
                    props.entityClass,
                    props.parameterName,
                    props.indexNames,
                );
            },
            replot() {
                replot(plotType, props.dataTable, props.indexNames, plotId);
            },
        };
    },
}
</script>
