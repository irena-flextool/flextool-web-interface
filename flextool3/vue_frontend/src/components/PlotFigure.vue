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
                @click="prepareDownload"
                :loading="preparingDownload"
                :disabled="downloadButtonDisabled"
                size="small"
            >
                Download CSV
            </n-button>
        </n-space>
        <div :id="plotId"></div>
    </n-space>
</template>

<script>
import {computed, onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";
import Plotly from "plotly.js-cartesian-dist-min";
import {toBasicChartData} from "../modules/plots.mjs";
import {fetchData} from "../modules/communication.mjs";
import {relationshipClassType} from "../modules/entityClasses.mjs";

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
 * Returns dimensions of an entity class.
 * @param {object} entityClass Entity class info.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl Analysis interface URL.
 * @returns {String[]} Array of object class names.
 */
async function getEntityClassNames(entityClass, projectId, analysisUrl) {
    if(entityClass.type === relationshipClassType) {
        const data = await fetchData(
            "relationship class object classes?",
            projectId,
            analysisUrl,
            {relationship_class_id: entityClass.id},
        );
        return data.object_classes;
    }
    else {
        return [entityClass.name];
    }
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
    props: {
        identifier: {type: [String, Number], required: true},
        dataTable: {type: Array, required: true},
        indexNames: {type: Array, required: true},
        entityClass: {type: Object, required: true},
        parameterName: {type: String, required: true},
        projectId: {type: Number, required: true},
        analysisUrl: {type: String, required: true},
    },
    setup(props) {
        const plotId = `plot-${props.identifier}`;
        const plotType = ref("scatter");
        const plotTypeOptions = [
            {label: "Scatter", value: "scatter"},
            {label: "Bars", value: "bar"},
            {label: "Stacked bars", value: "stacked bar"},
        ];
        const preparingDownload = ref(false);
        const message = useMessage();
        onMounted(function() {
            replot(plotType, props.dataTable, props.indexNames, plotId);
        });
        return {
            plotId: plotId,
            plotType: plotType,
            plotTypeOptions: plotTypeOptions,
            preparingDownload: preparingDownload,
            downloadButtonDisabled: computed(() => preparingDownload.value),
            prepareDownload() {
                preparingDownload.value = true;
                getEntityClassNames(props.entityClass, props.projectId, props.analysisUrl).then(function(classNames) {
                    const createCsvStringifier = require("csv-writer").createArrayCsvStringifier;
                    const stringifier = createCsvStringifier({header: [...classNames, ...props.indexNames, "y"]});
                    const header = stringifier.getHeaderString()
                    const content = stringifier.stringifyRecords(props.dataTable);
                    const aElement = document.createElement("a");
                    aElement.setAttribute(
                        "href",
                        "data:text/plain;charset=utf-8," + encodeURIComponent(header + content)
                    );
                    aElement.setAttribute("download", `${props.entityClass.name}_${props.parameterName}.csv`);
                    aElement.style.display = "none";
                    document.body.appendChild(aElement);
                    aElement.click();
                    document.body.removeChild(aElement);
                }).catch(function(error) {
                    message.error(error.message);
                }).finally(function(){
                    preparingDownload.value = false;
                });
            },
            replot() {
                replot(plotType, props.dataTable, props.indexNames, plotId);
            },
        };
    },
}
</script>
