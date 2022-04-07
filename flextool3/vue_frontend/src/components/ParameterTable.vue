<template>
    <n-space vertical>
        <n-space>
            <n-text strong>{{ entityName }}</n-text>
            <n-text>―</n-text>
            <n-text italic>{{ alternativeName }}</n-text>
        </n-space>
        <n-data-table
            v-if="!errorMessage"
            size="small"
            :columns="columns"
            :data="data"
            :loading="loading"
            :row-key="rowKey"
        >
            <template #empty>
                <n-empty
                    v-if="entityKey === null"
                    description="Select an entity on the left to load its parameters here."
                >
                    <template #icon>
                        <n-icon>
                            <hand-point-left-regular/>
                        </n-icon>
                    </template>
                </n-empty>
                <n-empty
                    v-else
                    description="Entity has no parameters."
                >
                    <template #icon>
                        <n-icon>
                            <hand-paper-regular/>
                        </n-icon>
                    </template>
                </n-empty>
           </template>
        </n-data-table>
        <n-result
            v-else
            status="error"
            title="Error"
            :description="errorMessage"
        />
    </n-space>
</template>

<script>
import {computed, h, ref, toRefs, watch} from "vue/dist/vue.esm-bundler.js";
import {HandPaperRegular, HandPointLeftRegular} from '@vicons/fa';
import * as Communication from "../modules/communication.mjs";
import ParameterTableNameLabel from "./ParameterTableNameLabel.vue";
import ParameterTableValueCell from "./ParameterTableValueCell.vue";

/**
 * Creates table's columns.
 * @param {Ref} entityKey Reference to table's entity key prop.
 * @param {} context Setup context.
 * @returns {Object[]} Table's DataTableColumns.
 */
function makeColumns(entityKey, context) {
    const nameColumn = {
        title: "Parameter",
        key: "name",
        render: function(rowData) {
            return h(ParameterTableNameLabel, {name: rowData.name, description: rowData.description});
        }
    };
    const completeInfo = function(valueInfo, rowData) {
        if(valueInfo.id === undefined) {
            return {
                entityEmblem: entityKey.value.entityEmblem,
                definitionId: rowData.definitionId,
                alternativeId: entityKey.value.alternativeId,
                ...valueInfo
            };
        }
        else {
            return {
                entityEmblem: entityKey.value.entityEmblem,
                ...valueInfo
            };
        }
    };
    const valueColumn = {
        title: "Value",
        key: "value",
        render: function(rowData) {
            return h(ParameterTableValueCell, {
                valueData: {
                    allowedSpecies: rowData.allowedSpecies,
                    specie: rowData.specie,
                    parameterValue: rowData.value,
                    allowedValues: rowData.allowedValues,
                },
                valueId: rowData.valueId,
                onOpenValueEditorRequest(valueData) {
                    context.emit("openValueEditorRequest", {
                        value: valueData.parameterValue,
                        id: valueData.valueId,
                        entityEmblem: entityKey.value.entityEmblem,
                        parameterName: rowData.name,
                        definitionId: rowData.definitionId,
                        alternativeId: entityKey.value.alternativeId
                    });
                },
                onCloseValueEditorRequest() {
                    context.emit("closeValueEditorRequest", rowData.name);
                },
                onValueInsert(valueInfo) {
                    context.emit("valueInsert", completeInfo(valueInfo, rowData));
                },
                onValueUpdate(valueInfo) {
                    context.emit("valueUpdate", completeInfo(valueInfo, rowData));
                },
                onValueDelete(valueInfo) {
                    context.emit("valueDelete", completeInfo(valueInfo, rowData));
                }
            });
        }
    };
    return [nameColumn, valueColumn];
}

const matchConstant = /constant[^.]*\.?$/i
const matchPeriod = /period[^.]*\.?$/i
const matchTime = /time[^.]*\.?$/i

/**
 * Declares allowed parameter value species from parameter's description heuristically.
 * @param {string} description Parameter's description.
 * @returns {Object} Allowed parameter value species.
 */
function allowedSpecies(description) {
    const period = matchPeriod.test(description);
    const time = matchTime.test(description);
    const constant = matchConstant.test(description) || (!period && !time);
    return {constant: constant, period: period, time: time};
}

/**
 * Chooses a specie depending on parameter value.
 * @param value Parameter's value.
 * @param {Object} allowedSpecies Allowed species.
 * @returns {string} Specie.
 */
function pickSpecie(value, allowedSpecies) {
    if(typeof value === "object" && value !== null &&
            (value.type === "map" || value.type === "array" || "content" in value)) {
        if(value.index_name === "period" && allowedSpecies.period) {
            return "period";
        }
        else if(value.index_name === "time" && allowedSpecies.time) {
            return "time";
        }
        else {
            return "period";
        }
    }
    else {
        return "constant";
    }
}

/**
 * Applies pending deletions and updates to parameter values to table rows in-place.
 * @param {(string|string[])} entityEmblem Entity's emblem.
 * @param {number} alternativeId Alternative's id.
 * @param {Object[]} tableRows Table rows.
 * @param {EntityDiff} diff Differences store.
 */
function applyPendingChangesToValues(entityEmblem, alternativeId, tableRows, diff) {
    tableRows.forEach(function(row) {
        if(diff.isPendingDeletion(entityEmblem, row.definitionId, alternativeId)) {
            row.specie = undefined;
            row.value = undefined;
            return
        }
        const value = diff.pendingValue(entityEmblem, row.definitionId, alternativeId);
        if(value === undefined) {
            return;
        }
        row.specie = pickSpecie(value, row.allowedSpecies);
        row.value = value;
    });
}

/**
 * Fetches parameter definitions.
 * @param {number} projectId Project id.
 * @param {string} modelUrl URL pointing to server's model interface.
 * @param {number} classId Entity class id.
 * @returns {Promise} Promise that resolves to parameter definitions.
 */
function fetchParameterDefinitions(projectId, modelUrl, classId) {
    return Communication.fetchData(
        "parameter definitions?",
        projectId, modelUrl,
        {"class_id": classId}
    ).then(function(data) {
        return data.definitions;
    });
}

function fetchSkeletonData(projectId, modelUrl, classId) {
    return fetchParameterDefinitions(projectId, modelUrl, classId).then(async function(definitions) {
        const skeleton = [];
        const valueListIds = new Map();
        definitions.forEach(function(definition) {
            const parameter = {};
            parameter.name = definition.name;
            parameter.description = definition.description;
            parameter.definitionId = definition.id;
            parameter.allowedSpecies = allowedSpecies(definition.description);
            parameter.specie = "none";
            if (definition.parameter_value_list_id) {
                valueListIds.set(definition.id, definition.parameter_value_list_id);
            }
            skeleton.push(parameter);
        });
        if(valueListIds.size > 0) {
             const valueLists = await Communication.fetchData(
                "parameter value lists?",
                projectId, modelUrl,
                {value_list_ids: [...valueListIds.values()]}
            ).then(function(data) {
                return data.lists;
            });
            skeleton.forEach(function(tableRow) {
                const valueListId = valueListIds.get(tableRow.definitionId);
                if (valueListId) {
                    const valueList = valueLists.find(function(item) {
                        return valueListId === item.id;
                    });
                    tableRow.allowedValues = valueList.value_list.map((x) => JSON.parse(x));
                }
            });
        }
        return skeleton;
    });
}

function fetchData(
    skeletonPromise,
    tableData,
    loading,
    projectId,
    modelUrl,
    classId,
    entityEmblem,
    entityId,
    alternativeId,
    diff,
    errorMessage
) {
    if (skeletonPromise.promise === null) {
        skeletonPromise.promise = fetchSkeletonData(projectId, modelUrl, classId);
    }
    skeletonPromise.promise.then(function(skeleton) {
        const tableRows = [];
        skeleton.forEach(function(skeletonRow) {
            tableRows.push({...skeletonRow});
        });
        if(entityId === undefined) {
            applyPendingChangesToValues(entityEmblem, alternativeId, tableRows, diff);
            tableData.value = tableRows;
        }
        else {
            Communication.fetchData(
                "parameter values?",
                projectId, modelUrl,
                {"entity_id": entityId, "alternative_id": alternativeId}
            ).then(async function(data) {
                data.values.forEach(function(valueRow) {
                    const tableRow = tableRows.find(function(row) {
                        return valueRow.parameter_definition_id === row.definitionId;
                    });
                    const value = JSON.parse(valueRow.value);
                    if(value !== null && typeof value === "object") {
                        value.type = valueRow.type;
                    }
                    tableRow.value = value;
                    tableRow.specie = pickSpecie(value, tableRow.allowedSpecies);
                    tableRow.valueId = valueRow.id;
                });
                applyPendingChangesToValues(entityEmblem, alternativeId, tableRows, diff);
                tableData.value = tableRows;
            });
        }
    }).catch(function(error){
        errorMessage.value = error.message;
    }).finally(function() {
        loading.value = false;
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
        classId: {type: Number, required: true},
        entityKey: {type: [Object, null], required: true},
        diff: {type: Object, required: true},
    },
    emits: ["openValueEditorRequest", "closeValueEditorRequest", "valueInsert", "valueUpdate", "valueDelete"],
    components: {
        "hand-paper-regular": HandPaperRegular,
        "hand-point-left-regular": HandPointLeftRegular
    },
    setup(props, context) {
        const propRefs = toRefs(props);
        const entityKeyRef = propRefs.entityKey;
        const columns = ref(makeColumns(entityKeyRef, context));
        const data = ref([]);
        const loading = ref(false);
        const errorMessage = ref("");
        const skeletonPromise = {promise: null};
        const entityName = computed(function() {
            if(props.entityKey === null) {
                return "";
            }
            else if(typeof props.entityKey.entityEmblem === "string") {
                return props.entityKey.entityEmblem;
            }
            else {
                return props.entityKey.entityEmblem.join(" | ");
            }
        });
        const alternativeName = computed(function() {
            return props.entityKey !== null ? props.entityKey.alternativeName : "";
        });
        watch(entityKeyRef, function(key) {
            if(key === null) {
                data.value.length = 0;
                return;
            }
            loading.value = true;
            fetchData(
                skeletonPromise,
                data,
                loading,
                props.projectId,
                props.modelUrl,
                props.classId,
                key.entityEmblem,
                key.entityId,
                key.alternativeId,
                props.diff,
                errorMessage
            );
        });
        return {
            columns: columns,
            data: data,
            loading: loading,
            errorMessage: errorMessage,
            entityName: entityName,
            alternativeName: alternativeName,
            rowKey(rowData) {
                return rowData.definitionId;
            }
        };
    }
}
</script>
