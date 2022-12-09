<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-space vertical>
            <n-space>
                <n-button
                    @click="download"
                    size="small"
                >
                    Download CSV
                </n-button>
            </n-space>
            <div v-if="showGraph" :id="plotId"/>
            <plot-table v-else :data-frame="currentDataFrame"/>
        </n-space>
    </fetchable>
</template>

<script>
import {computed, nextTick, onMounted, ref, toRef, watch} from "vue/dist/vue.esm-bundler.js";
import Plotly from "plotly.js-cartesian-dist-min";
import {DataFrame} from "data-forge";
import {downloadAsCsv} from "../modules/figures.mjs";
import {fetchResultParameterValues} from "../modules/communication.mjs";
import {objectify} from "../modules/parameterValues.mjs";
import {
    filterDeselectedIndexNames,
    makeBasicChart,
    makeHeatmapChart,
} from "../modules/plots.mjs";
import {timeFormat} from "../modules/scenarios.mjs";
import {
    entityClassKey,
    objectKey,
    objectKeyPrefix,
    parameterKey,
    scenarioKey,
    scenarioTimeStampKey,
    valueIndexKeyPrefix,
} from "../modules/plotEditors.mjs";
import Fetchable from "./Fetchable.vue";
import PlotTable from "./PlotTable.vue";

/**
 * Plots line plot.
 * @param {DataFrame} dataFrame Data to plot.
 * @param {object} plotDimensions Plot dimensions specification.
 * @param {string} plotId Target html element id.
 */
function plotLine(dataFrame, plotDimensions, plotId) {
    const plotObject = makeBasicChart(dataFrame, plotDimensions, {line: {shape: "hvh"}});
    Plotly.newPlot(plotId, plotObject);
}

/**
 * Plots stacked line plot.
 * @param {DataFrame} dataFrame Data to plot.
 * @param {object} plotDimensions Plot specification.
 * @param {string} plotId Target html element id.
 */
 function plotStackedLine(dataFrame, plotDimensions, plotId) {
    const plotObject = makeBasicChart(dataFrame, plotDimensions, {line: {shape: "hvh"}, stackgroup: "a"});
    Plotly.newPlot(plotId, plotObject);
}

/**
 * Plots bar chart.
 * @param {DataFrame} dataFrame Data to plot.
 * @param {object} plotDimensions Plot specification.
 * @param {string} plotId Target html element id.
 */
function plotBar(dataFrame, plotDimensions, plotId) {
    const plotObject = makeBasicChart(dataFrame, plotDimensions, {type: "bar"});
    Plotly.newPlot(plotId, plotObject);
}

/**
 * Plots stacked bar chart.
 * @param {DataFrame} dataFrame Data to plot.
 * @param {object} plotDimensions Plot dimensions specification.
 * @param {string} plotId Target html element id.
 */
function plotStackedBar(dataFrame, plotDimensions, plotId) {
    const plotObject = makeBasicChart(dataFrame, plotDimensions, {type: "bar"}, {barmode: "stack"});
    Plotly.newPlot(plotId, plotObject);
}

/**
 * Plots heatmap.
 * @param {DataFrame} dataFrame Data to plot.
 * @param {object} plotDimensions Plot specification.
 * @param {string} plotId Target html element id.
 */
 function plotHeatmap(dataFrame, plotDimensions, plotId) {
    const plotObject = makeHeatmapChart(dataFrame, plotDimensions);
    Plotly.newPlot(plotId, plotObject);
}

/**
 * Changes plot type.
 * @param {DataFrame} dataFrame Data frame to plot.
 * @param {object} plotSpecification Plot specification.
 * @param {string} plotId Plot div element id.
 */
function replot(dataFrame, plotSpecification, plotId) {
    switch(plotSpecification.plot_type) {
        case "bar":
            plotBar(dataFrame, plotSpecification.dimensions, plotId);
            break;
        case "stacked bar":
            plotStackedBar(dataFrame, plotSpecification.dimensions, plotId);
            break;
        case "line":
            plotLine(dataFrame, plotSpecification.dimensions, plotId);
            break;
        case "stacked line":
            plotStackedLine(dataFrame, plotSpecification.dimensions, plotId);
            break;
        case "heatmap":
            plotHeatmap(dataFrame, plotSpecification.dimensions, plotId);
            break;
        case "table":
            break;
        default:
            throw Error(`Unknown plot type '${plotSpecification.plot_type}'`);
    }
}

/**Fetches parameter values and creates the data frame.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to the analysis interface.
 * @param {object} plotSpecification Plot specification.
 * @param {number[]} scenarioExecutionids Scenario execution ids.
 * @param {Ref} currentDataFrame Current data frame.
 * @param {string} plotId Plot div element id.
 * @param {Ref} state Fetching state.
 * @param {Ref} errorMessage Fetch error message.
 */
 function fetchDataFrame(projectId, analysisUrl, plotSpecification, scenarioExecutionIds, currentDataFrame, plotId, state, errorMessage) {
    errorMessage.value = "";
    state.value = Fetchable.state.loading;
    if(scenarioExecutionIds.length === 0) {
        return;
    }
    const classes = plotSpecification.selection.entity_class;
    if(classes.length === 0) {
        return;
    }
    const objectDimensions = new Map();
    for(const key in plotSpecification.selection) {
        if(!key.startsWith(objectKeyPrefix)) {
            continue;
        }
        const dimension = new Number(key.split("_")[1]);
        objectDimensions.set(dimension, plotSpecification.selection[key]);
    }
    const objects = new Array(objectDimensions.size);
    for(const [i, object] of objectDimensions) {
        objects[i] = object;
    }
    const parameters = plotSpecification.selection.parameter;
    if(parameters.length === 0) {
        return;
    }
    fetchResultParameterValues(
        projectId, analysisUrl, scenarioExecutionIds, classes, objects, parameters
    ).then(function(data) {
        const parameterValues = data.values;
        const valueObjects = [];
        const baseColumnNames = [entityClassKey, parameterKey, scenarioKey, scenarioTimeStampKey];
        let maxDimensions = 0;
        const indexNameLocations = new Map();
        for(const value of parameterValues) {
            maxDimensions = Math.max(maxDimensions, value.objects.length);
            const valueParts = objectify(JSON.parse(value.value), value.type, (name) => valueIndexKeyPrefix + name);
            for(const [i, name] of Object.keys(valueParts[0]).slice(0, -1).entries()) {
                const nameIndex = indexNameLocations.get(name);
                if(nameIndex === undefined || i > nameIndex) {
                    indexNameLocations.set(name, i);
                }
            }
            const objectPart = {}
            for(let dimension = 0; dimension !== value.objects.length; ++dimension) {
                objectPart[objectKey(dimension)] = value.objects[dimension];
            }
            for(const valuePart of valueParts) {
                valueObjects.push({
                    [entityClassKey]: value.class,
                    [parameterKey]: value.parameter,
                    [scenarioKey]: value.scenario,
                    [scenarioTimeStampKey]: new Date(value.time_stamp),
                    ...objectPart,
                    ...valuePart,
                });
            }
        }
        const indexColumnNames = [...indexNameLocations.keys()];
        indexColumnNames.sort((a, b) => indexNameLocations.get(a) - indexNameLocations.get(b));
        const objectColumnNames = [];
        for(let dimension = 0; dimension != maxDimensions; ++ dimension) {
            objectColumnNames.push(objectKey(dimension));
        }
        const columnNames = baseColumnNames.concat(objectColumnNames).concat(indexColumnNames)
        columnNames.push("y");
        let dataFrame = new DataFrame({columnNames: columnNames, values: valueObjects});
        dataFrame = filterDeselectedIndexNames(dataFrame, plotSpecification.selection);
        dataFrame = dataFrame.generateSeries({
            [scenarioTimeStampKey]: (row) => timeFormat.format(row[scenarioTimeStampKey]),
        });
        currentDataFrame.value = dataFrame;
        state.value = Fetchable.state.ready;
        nextTick(() => replot(dataFrame, plotSpecification, plotId));
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = Fetchable.state.error;
    });
}

function plotIfPossible(projectId, analysisUrl, plotSpecification, scenarioExecutionIds, currentDataFrame, plotId, state, errorMessage) {
    if(plotSpecification.selection.entity_class.length === 0 || plotSpecification.selection.parameter.length === 0) {
        return;
    }
    fetchDataFrame(
        projectId,
        analysisUrl,
        plotSpecification,
        scenarioExecutionIds,
        currentDataFrame,
        plotId,
        state,
        errorMessage
    );
}

export default {
    props: {
        identifier: {type: Number, required: true},
        projectId: {type: Number, required: true},
        analysisUrl: {type: String, required: true},
        scenarioExecutionIds: {type: Array, required: true},
        plotSpecification: {type: Object, required: true},
    },
    components: {
        "fetchable": Fetchable,
        "plot-table": PlotTable,
    },
    setup(props) {
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        const plotId = `plot-${props.identifier}`;
        const showGraph = computed(() => props.plotSpecification.plot_type !== "table");
        const currentDataFrame = ref(null);
        watch(toRef(props, "scenarioExecutionIds"), function() {
            plotIfPossible(props.projectId, props.analysisUrl, props.plotSpecification, props.scenarioExecutionIds, currentDataFrame, plotId, state, errorMessage);
        });
        watch(() => toRef(props, "plotSpecification"), function() {
            plotIfPossible(props.projectId, props.analysisUrl, props.plotSpecification, props.scenarioExecutionIds, currentDataFrame, plotId, state, errorMessage);
        }, {deep: true});
        onMounted(function() {
            plotIfPossible(props.projectId, props.analysisUrl, props.plotSpecification, props.scenarioExecutionIds, currentDataFrame, plotId, state, errorMessage);
        });
        return {
            state: state,
            errorMessage: errorMessage,
            plotId: plotId,
            showGraph: showGraph,
            currentDataFrame: currentDataFrame,
            download() {
                downloadAsCsv(currentDataFrame.value);
            },
        };
    },
}
</script>
