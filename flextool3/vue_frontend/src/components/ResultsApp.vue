<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Results"
    />
    <results-summary :project-id="projectId" :summary-url="summaryUrl"/>
    <fetchable :state="state" :error-message="errorMessage">
        <n-grid :cols="3">
            <n-grid-item v-for="(plotBox, index) in plotBoxes" :key="index">
                <keyed-card
                    :title="plotBox.title"
                    :fingerprint="index"
                    @close="dropPlot"
                >
                    <plot-figure
                        :identifier="index"
                        :plot-data="plotBox.data"
                        :plot-layout="plotBox.layout"
                    />
                </keyed-card>
            </n-grid-item>
            <n-grid-item>
                <n-card>
                    <new-plot @create="appendPlotBox"/>
                </n-card>
            </n-grid-item>
        </n-grid>
    </fetchable>
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import * as Communication from "../modules/communication.mjs";
import {tabulate} from "../modules/parameterValues.mjs";
import {toBarChartData} from "../modules/plots.mjs";
import PagePath from "./PagePath.vue";
import Fetchable from "./Fetchable.vue";
import KeyedCard from "./KeyedCard.vue";
import NewPlot from "./NewPlot.vue";
import PlotFigure from "./PlotFigure.vue";
import ResultsSummary from "./ResultsSummary.vue";

function truncateAlternativeName(name) {
    const lastActualCharacterIndex = name.indexOf("__");
    return name.substring(0, lastActualCharacterIndex);
}

async function completeFetch(
    alternativePromise,
    entityClassPromise,
    objectPromise,
    relationshipPromise,
    parameterDefinitionPromise,
    parameterValuePromise,
    plotBoxes,
    state,
    errorMessage
) {
    try {
        const alternatives = await alternativePromise;
        const entityClasses = await entityClassPromise;
        const objects = await objectPromise;
        const relationships = await relationshipPromise;
        const definitions = await parameterDefinitionPromise;
        const values = await parameterValuePromise;
        const tables = new Map();
        for(const value of values) {
            const entityClass = entityClasses.get(value.entity_class_id);
            let tablesPerClass = tables.get(entityClass);
            if(tablesPerClass === undefined) {
                tablesPerClass = new Map();
                tables.set(entityClass, tablesPerClass);
            }
            const name = definitions.get(value.parameter_definition_id);
            let table = tablesPerClass.get(name);
            if(table === undefined) {
                table = [];
                tablesPerClass.set(name, table);
            }
            const alternative = alternatives.get(value.alternative_id);
            const objectId = value.object_id;
            let entities = undefined;
            if(objectId === null) {
                const objectIds = relationships.get(value.relationship_id);
                entities = objectIds.map((id) => objects.get(id));
            }
            else {
                entities = [objects.get(objectId)];
            }
            const parsed = JSON.parse(value.value);
            let tabulatedValue = undefined;
            if(value.type !== null) {
                tabulatedValue = tabulate(parsed, value.type);
            }
            else {
                tabulatedValue = [[parsed]];
            }
            for(const valueRow of tabulatedValue) {
                table.push([...entities, alternative, ...valueRow]);
            }
        }
        for(const [className, tablesPerClass] of tables) {
            for(const [parameterName, table] of tablesPerClass) {
                const title = `${className} - ${parameterName}`;
                let xColumn = 0;
                if(table) {
                    xColumn = table[0].length - 2;
                }
                const plotData = toBarChartData(table, xColumn);
                plotBoxes.value.push({title: title, data: plotData, layout: {}});
            }
        }
    } catch(error) {
        state.value = "error";
        errorMessage.value = error.message;
        return;
    }
    state.value = "ready";
}

export default {
    props: {
        indexUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectId: {type: Number, required:true},
        analysisUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
    },
    components: {
        "fetchable": Fetchable,
        "keyed-card": KeyedCard,
        "new-plot": NewPlot,
        "page-path": PagePath,
        "plot-figure": PlotFigure,
        "results-summary": ResultsSummary,
    },
    setup(props) {
        const state = ref("loading");
        const errorMessage = ref("");
        const plotBoxes = ref([]);
        onMounted(function() {
            const alternativePromise = Communication.fetchData(
                "alternatives?", props.projectId, props.analysisUrl
            ).then(function(data) {
                return new Map(data.alternatives.map((a) => [a.id, truncateAlternativeName(a.name)]));
            });
            const entityClassPromise = Communication.fetchData(
                "entity classes?", props.projectId, props.analysisUrl
            ).then(function(data) {
                return new Map(data.classes.map((c) => [c.id, c.name]));
            });
            const objectPromise = Communication.fetchData(
                "objects?", props.projectId, props.analysisUrl
            ).then(function (data) {
                return new Map(data.objects.map((o) => [o.id, o.name]));
            });
            const relationshipPromise = Communication.fetchData(
                "relationships?", props.projectId, props.analysisUrl
            ).then(function(data) {
                const objects = new Map();
                for(const relationship of data.relationships) {
                    let dimensions = objects.get(relationship.id);
                    if(dimensions === undefined) {
                        dimensions = [];
                        objects.set(relationship.id, dimensions);
                    }
                    dimensions.push(relationship.object_id);
                }
                return objects;
            });
            const parameterDefinitionPromise = Communication.fetchData(
                "parameter definitions?", props.projectId, props.analysisUrl
            ).then(function(data) {
                return new Map(data.definitions.map((d) => [d.id, d.name]));
            });
            const parameterValuePromise = Communication.fetchData(
                "parameter values?", props.projectId, props.analysisUrl
            ).then(function(data) {
                return data.values;
            });
            completeFetch(
                alternativePromise,
                entityClassPromise,
                objectPromise,
                relationshipPromise,
                parameterDefinitionPromise,
                parameterValuePromise,
                plotBoxes,
                state,
                errorMessage
            );
        });
        return {
            state: state,
            errorMessage: errorMessage,
            plotBoxes: plotBoxes,
            appendPlotBox(plotType) {
                plotBoxes.value.push({plotType: plotType});
            },
            dropPlot(index) {
                plotBoxes.value.splice(index, 1);
            },
        };
    },
};
</script>
