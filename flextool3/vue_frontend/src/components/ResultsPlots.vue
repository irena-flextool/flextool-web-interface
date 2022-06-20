<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-grid v-if="plotBoxes.length > 0" cols="1 l:2" responsive="screen">
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
        </n-grid>
        <n-text v-else>No data to show.</n-text>
    </fetchable>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {tabulate} from "../modules/parameterValues.mjs";
import {toBarChartData} from "../modules/plots.mjs";
import {fetchData, fetchResultAlternative} from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";
import KeyedCard from "./KeyedCard.vue";
import PlotFigure from "./PlotFigure.vue";

async function completeFetch(
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
                table.push([...entities, ...valueRow]);
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
        state.value = Fetchable.state.error;
        errorMessage.value = error.message;
        return;
    }
    state.value = Fetchable.state.ready;
}

export default {
    props: {
        projectId: {type: Number, required: true},
        analysisUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
    },
    components: {
        "fetchable": Fetchable,
        "keyed-card": KeyedCard,
        "plot-figure": PlotFigure,
    },
    setup(props) {
        const plotBoxes = ref([]);
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        return {
            plotBoxes: plotBoxes,
            state: state,
            errorMessage: errorMessage,
            dropPlot(index) {
                plotBoxes.value.splice(index, 1);
            },
            loadPlots(scenarioInfo) {
                state.value = Fetchable.state.loading;
                plotBoxes.value.length = 0;
                const parameterValuePromise = fetchResultAlternative(
                    props.projectId, props.summaryUrl, scenarioInfo.scenarioExecutionId
                ).then(function(data) {
                    if(data.alternative_id === null) {
                        return {values: []};
                    }
                    return fetchData(
                        "parameter values?",
                        props.projectId,
                        props.analysisUrl,
                        {"alternative_id": data.alternative_id},
                    );
                }).then(function(data) {
                    return data.values;
                });
                const entityClassPromise = fetchData(
                    "entity classes?", props.projectId, props.analysisUrl
                ).then(function(data) {
                    return new Map(data.classes.map((c) => [c.id, c.name]));
                });
                const objectPromise = fetchData(
                    "objects?", props.projectId, props.analysisUrl
                ).then(function (data) {
                    return new Map(data.objects.map((o) => [o.id, o.name]));
                });
                const relationshipPromise = fetchData(
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
                const parameterDefinitionPromise = fetchData(
                    "parameter definitions?", props.projectId, props.analysisUrl
                ).then(function(data) {
                    return new Map(data.definitions.map((d) => [d.id, d.name]));
                });
                completeFetch(
                    entityClassPromise,
                    objectPromise,
                    relationshipPromise,
                    parameterDefinitionPromise,
                    parameterValuePromise,
                    plotBoxes,
                    state,
                    errorMessage
                );
            }
        };
    },
}
</script>
