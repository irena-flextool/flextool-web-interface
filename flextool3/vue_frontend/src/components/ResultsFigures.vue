<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-grid v-if="tableBoxes.length > 0" cols="1 l:2" responsive="screen">
            <n-grid-item v-for="(tableBox, index) in tableBoxes" :key="index">
                <keyed-card
                    :title="tableBox.title"
                    :fingerprint="index"
                    @close="dropTable"
                >
                    <table-figure
                        :identifier="index"
                        :data-table="tableBox.data"
                        :index-names="tableBox.indexNames"
                        :entity-class="tableBox.entityClass"
                        :parameter-name="tableBox.parameterName"
                        :project-id="projectId"
                        :analysis-url="analysisUrl"
                    />
                </keyed-card>
            </n-grid-item>
        </n-grid>
        <n-grid v-if="plotBoxes.length > 0" cols="1 l:2" responsive="screen">
            <n-grid-item v-for="(plotBox, index) in plotBoxes" :key="index">
                <keyed-card
                    :title="plotBox.title"
                    :fingerprint="index"
                    @close="dropPlot"
                >
                    <plot-figure
                        :identifier="index"
                        :data-table="plotBox.data"
                        :index-names="plotBox.indexNames"
                        :entity-class="plotBox.entityClass"
                        :parameter-name="plotBox.parameterName"
                        :project-id="projectId"
                        :analysis-url="analysisUrl"
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
import {fetchData, fetchResultAlternative} from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";
import KeyedCard from "./KeyedCard.vue";
import PlotFigure from "./PlotFigure.vue";
import TableFigure from "./TableFigure.vue";

const suggestedTabulatedParameters = new Set([
    "capacity",
    "co2",
    "cost",
    "flow",
    "indicator",
]);

async function completeFetch(
    objectClassPromise,
    relationshipClassPromise,
    objectPromise,
    relationshipPromise,
    parameterDefinitionPromise,
    parameterValuePromise,
    plotBoxes,
    tableBoxes,
    emit,
    state,
    errorMessage
) {
    try {
        const objectClasses = await objectClassPromise;
        const relationshipClasses = await relationshipClassPromise;
        const objects = await objectPromise;
        const relationships = await relationshipPromise;
        const definitions = await parameterDefinitionPromise;
        const values = await parameterValuePromise;
        const tables = new Map();
        for(const value of values) {
            let tablesPerClass = tables.get(value.entity_class_id);
            if(tablesPerClass === undefined) {
                tablesPerClass = new Map();
                tables.set(value.entity_class_id, tablesPerClass);
            }
            const name = definitions.get(value.parameter_definition_id);
            let tableData = tablesPerClass.get(name);
            if(tableData === undefined) {
                tableData = {indexNames: undefined, table: []};
                tablesPerClass.set(name, tableData);
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
                tabulatedValue = {indexNames: [], table: [[parsed]]};
            }
            for(const valueRow of tabulatedValue.table) {
                tableData.table.push([...entities, ...valueRow]);
            }
            tableData.indexNames = tabulatedValue.indexNames;
        }
        for(const [classId, tablesPerClass] of tables) {
            const objectClassInfo = objectClasses.get(classId);
            let entityClass = undefined;
            if(objectClassInfo !== undefined) {
                entityClass = {id: classId, name: objectClassInfo.name};
            }
            else {
                const relationshipClassInfo = relationshipClasses.get(classId);
                entityClass = {
                    id: classId,
                    name: relationshipClassInfo.name,
                    objectClassNames: relationshipClassInfo.objectClassNames
                };
            }
            for(const [parameterName, table] of tablesPerClass) {
                const title = `${entityClass.name} - ${parameterName}`;
                const box = {
                    title: title,
                    entityClass: entityClass,
                    parameterName: parameterName,
                    indexNames: table.indexNames,
                    data: table.table
                };
                if(suggestedTabulatedParameters.has(parameterName)) {
                    tableBoxes.value.push(box);
                }
                else {
                    plotBoxes.value.push(box);
                }
            }
        }
    }
    catch(error) {
        state.value = Fetchable.state.error;
        errorMessage.value = error.message;
        return;
    }
    finally {
        emit("busy", false);
    }
    state.value = Fetchable.state.ready;
}

export default {
    props: {
        projectId: {type: Number, required: true},
        analysisUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
    },
    emits: ["busy"],
    components: {
        "fetchable": Fetchable,
        "keyed-card": KeyedCard,
        "plot-figure": PlotFigure,
        "table-figure": TableFigure,
    },
    setup(props, context) {
        const plotBoxes = ref([]);
        const tableBoxes = ref([]);
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        return {
            plotBoxes: plotBoxes,
            tableBoxes: tableBoxes,
            state: state,
            errorMessage: errorMessage,
            dropPlot(index) {
                plotBoxes.value.splice(index, 1);
            },
            dropTable(index) {
                tableBoxes.values.splice(index, 1);
            },
            loadData(scenarioInfo) {
                plotBoxes.value.length = 0;
                tableBoxes.value.length = 0;
                if(scenarioInfo === null) {
                    state.value = Fetchable.state.waiting;
                    return;
                }
                context.emit("busy", true);
                state.value = Fetchable.state.loading;
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
                const objectClassPromise = fetchData(
                    "object classes?", props.projectId, props.analysisUrl
                ).then(function(data) {
                    return new Map(data.classes.map(function(c) {
                        const info = {
                            name: c.name,
                        };
                        return [c.id, info];
                    }));
                });
                const relationshipClassPromise = fetchData(
                    "relationship classes?", props.projectId, props.analysisUrl
                ).then(function(data) {
                    const relationshipClassNames = new Map();
                    const objectClasses = new Map();
                    for(const relationshipClass of data.classes) {
                        relationshipClassNames.set(relationshipClass.id, relationshipClass.name);
                        let objectClassList = objectClasses.get(relationshipClass.id);
                        if(objectClassList === undefined) {
                            objectClassList = [];
                            objectClasses.set(relationshipClass.id, objectClassList);
                        }
                        objectClassList.push({
                            dimension: relationshipClass.dimension,
                            name: relationshipClass.object_class_name
                        });
                    }
                    for(const objectClassList of objectClasses.values()) {
                        objectClassList.sort((a, b) => a.dimension < b.dimension);
                    }
                    const relationshipClasses = new Map();
                    for(const [id, name] of relationshipClassNames) {
                        relationshipClasses.set(id, {
                            name: name,
                            objectClassNames: objectClasses.get(id).map((a) => a.name),
                        });
                    }
                    return relationshipClasses;
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
                        dimensions.push({dimension: relationship.dimension, id: relationship.object_id});
                    }
                    for(const objectList of objects.values()) {
                        objectList.sort((a, b) => a.dimension < b.dimension);
                    }
                    const relationships = new Map();
                    for(const [id, objectList] of objects) {
                        relationships.set(id, objectList.map((a) => a.id));
                    }
                    return relationships;
                });
                const parameterDefinitionPromise = fetchData(
                    "parameter definitions?", props.projectId, props.analysisUrl
                ).then(function(data) {
                    return new Map(data.definitions.map((d) => [d.id, d.name]));
                });
                completeFetch(
                    objectClassPromise,
                    relationshipClassPromise,
                    objectPromise,
                    relationshipPromise,
                    parameterDefinitionPromise,
                    parameterValuePromise,
                    plotBoxes,
                    tableBoxes,
                    context.emit,
                    state,
                    errorMessage
                );
            }
        };
    },
}
</script>
