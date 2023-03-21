<template>
    <n-space vertical>
        <n-thing>
            <template #header>
                Dimensions
            </template>
            <n-space>
                <n-space vertical>
                    <n-text strong>x-axis:</n-text>
                    <n-select class="dimension-select" v-model:value="plotSpecification.dimensions.x1" filterable tag
                        clearable placeholder="Use default" :options="availableIndexNames"
                        @update:value="resolveDimensionConflictsX1" :consistent-menu-width="false" />
                </n-space>
                <n-space vertical>
                    <n-text strong>1st x-category:</n-text>
                    <n-select class="dimension-select" v-model:value="plotSpecification.dimensions.x2" filterable tag
                        clearable placeholder="No category" :options="availableIndexNames"
                        @update:value="resolveDimensionConflictsX2" :consistent-menu-width="false" />
                </n-space>
                <n-space vertical>
                    <n-text strong>2nd x-category:</n-text>
                    <n-select class="dimension-select" v-model:value="plotSpecification.dimensions.x3" filterable tag
                        clearable placeholder="No category" :options="availableIndexNames"
                        @update:value="resolveDimensionConflictsX3" :consistent-menu-width="false" />
                </n-space>
                <n-space vertical>
                    <n-text strong>Subplot by:</n-text>
                    <n-select class="dimension-select" v-model:value="plotSpecification.dimensions.separate_window"
                        filterable tag clearable placeholder="No subplots" :options="availableIndexNames"
                        @update:value="resolveDimensionConflictsSeparateWindow" :consistent-menu-width="false" />

                </n-space>
            </n-space>
        </n-thing>
        <n-thing>
            <template #header>
                Selection
            </template>
            <n-space>
                <n-space vertical v-for="(select, index) in selectionSelects" :key="index">
                    <n-text strong>{{ select.label }}:</n-text>
                    <n-select class="multi-item-select" value-field="label"
                        v-model:value="plotSpecification.selection[select.type]" multiple filterable tag clearable
                        size="small" :placeholder="select.placeholder" :options="select.options"
                        @update:value="select.updateCallback" :consistent-menu-width="false" :max-tag-count="5" />
                </n-space>
            </n-space>
        </n-thing>
        <n-thing>
            <template #header>
                Plot type
            </template>
            <n-space align="end">
                <n-select class="plot-type-select" v-model:value="plotSpecification.plot_type"
                    :options="plotTypeOptions" :consistent-menu-width="false" />
            </n-space>
        </n-thing>
        <plot-figure v-if="plottingPossible" :identifier="identifier" :projectId="projectId" :analysisUrl="analysisUrl"
            :scenario-execution-ids="scenarioExecutionIds" :plot-specification="plotSpecification" />
        <n-empty v-else :description="cannotPlotMessage" />
    </n-space>
</template>

<script>
import { computed, onMounted, ref, toRef, watch } from "vue/dist/vue.esm-bundler.js";
import {
    fetchResultEntityClasses,
    fetchResultEntities,
    fetchResultParameters,
    fetchResultParameterValueIndexes,
} from "../modules/communication.mjs";
import { isParameterIndexName, plotSpecifications } from "../modules/plots.mjs";
import {
    addFetchedEntities,
    addFetchedParameters,
    differingElements,
    compareLabels,
    entityClassKey,
    indexNameFromKey,
    indexNamePriority,
    makeEntityClassSelectionSelect,
    makeValueIndexSelectionSelect,
    isEntityKey,
    removeExcessSelections,
    removeExcessSelectionSelects,
    scenarioKey,
    scenarioTimeStampKey,
    valueIndexKeyPrefix,
    parameterKey,
} from "../modules/plotEditors.mjs";
import PlotFigure from "./PlotFigure.vue";

const indexNameLabels = new Map([
    [entityClassKey, "Entity class"],
    [scenarioKey, "Scenario"],
    [scenarioTimeStampKey, "Run time"],
]);

/**Compares two selection selects for priority.
 * @param {object} a Left-hand-side selection select.
 * @param {object} b Right-hand-side selection select.
 * @returns {number} Comparison result.
 */
function comparePriorities(a, b) {
    return b.priority - a.priority;
}

/**Sets conflicting plot specification dimensions to null.
 * @param {string} value Dimension select value.
 * @param {string} priorityDimension Dimensions that takes precedence; won't be set to null.
 * @param {object} plotDimensions Plot dimensions specification. 
 */
function nullifyDuplicateDimensions(value, priorityDimension, plotDimensions) {
    if (priorityDimension !== "x1" && value === plotDimensions.x1) {
        plotDimensions.x1 = null;
    }
    if (priorityDimension !== "x2" && value === plotDimensions.x2) {
        plotDimensions.x2 = null;
    }
    if (priorityDimension !== "x3" && value === plotDimensions.x3) {
        plotDimensions.x3 = null;
    }
    if (priorityDimension !== "separate_window" && value === plotDimensions.separate_window) {
        plotDimensions.separate_window = null;
    }
}

/**Fetches value indexes and updates data structures accordingly.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL of the analysis interface.
 * @param {number[]} scenarioExecutionIds Scenario execution ids.
 * @param {object} plotSpecification Plot specification.
 * @param {Ref} selectionSelects Selection selects.
 * @param {Map} selectionOptions Selection options.
 * @param {Ref} dimensionsOptions Dimensions select options.
*/
async function updateParameterIndexes(projectId, analysisUrl, scenarioExecutionIds, plotSpecification, selectionSelects, selectionOptions, dimensionsOptions) {
    const classes = new Set(plotSpecification.selection.entity_class);
    const parameters = new Set(plotSpecification.selection.parameter);
    const existingClasses = new Set();
    const existingParameters = new Set();
    const lostIndexNames = new Set();
    for (const [indexName, options] of selectionOptions.entries()) {
        if (!isParameterIndexName(indexName)) {
            continue;
        }
        for (let optionIndex = options.value.length - 1; optionIndex != -1; --optionIndex) {
            const option = options.value[optionIndex];
            for (let i = option.parents.length - 1; i != -1; --i) {
                const parent = option.parents[i];
                const classExists = classes.has(parent.entityClass);
                const parameterExists = parameters.has(parent.parameter);
                if (!classExists || !parameterExists) {
                    option.parents.splice(i, 1);
                    continue
                }
                if (classExists) {
                    existingClasses.add(parent.entityClass);
                }
                if (parameterExists) {
                    existingParameters.add(parent.parameter);
                }
            }
            if (option.parents.length === 0) {
                options.value.splice(optionIndex, 1);
            }
        }
        if (options.value.length === 0) {
            lostIndexNames.add(indexName);
            selectionOptions.delete(indexName);
            for (const [i, select] of selectionSelects.value.entries()) {
                if (select.type === indexName) {
                    selectionSelects.value.splice(i, 1);
                    break;
                }
            }
            for (const [i, option] of dimensionsOptions.value.entries()) {
                if (option.value === indexName) {
                    dimensionsOptions.value.splice(i, 1);
                    break;
                }
            }
            for (const key in plotSpecification.dimensions) {
                const value = plotSpecification.dimensions[key];
                if (value === indexName) {
                    plotSpecification.dimensions[key] = null;
                    break;
                }
            }
        }
    }
    for (let i = dimensionsOptions.value.length - 1; i != -1; --i) {
        if (lostIndexNames.has(dimensionsOptions.value[i].value)) {
            dimensionsOptions.splice(i, 1);
        }
    }
    if (classes.size === 0 || parameters.size === 0) {
        return;
    }
    const addedClasses = differingElements(classes, existingClasses);
    const addedParameters = differingElements(parameters, existingParameters)
    if (addedClasses.size === 0 && addedParameters.size === 0) {
        return;
    }
    let fetchParameters = [];
    if (addedClasses.size === 0) {
        fetchParameters = [...addedParameters];
    }
    else {
        fetchParameters = [...parameters];
    }
    fetchResultParameterValueIndexes(
        projectId,
        analysisUrl,
        scenarioExecutionIds,
        [...classes],
        fetchParameters,
    ).then(function (data) {
        const indexes = data.indexes;
        const existingDimensionsValues = new Set();
        for (const option of dimensionsOptions.value) {
            existingDimensionsValues.add(option.value);
        }
        for (const indexRecord of indexes) {
            indexRecord.index_name = valueIndexKeyPrefix + indexRecord.index_name;
            if (!existingDimensionsValues.has(indexRecord.index_name)) {
                dimensionsOptions.value.push({
                    label: indexNameFromKey(indexRecord.index_name),
                    value: indexRecord.index_name,
                });
                existingDimensionsValues.add(indexRecord.index_name);
            }
            if (plotSpecification.selection[indexRecord.index_name] === undefined) {
                plotSpecification.selection[indexRecord.index_name] = [];
            }
            let options = selectionOptions.get(indexRecord.index_name);
            if (options === undefined) {
                options = ref([]);
                selectionOptions.set(indexRecord.index_name, options);
            }
            const existingOptionParents = new Map();
            for (const option of options.value) {
                existingOptionParents.set(option.label, option.parents);
            }
            for (const index of indexRecord.indexes) {
                const newParents = [];
                const zip = (a, b) => a.map((n, i) => [n, b[i]])
                for (const [class_name, parameter] of zip(indexRecord.class_names, indexRecord.parameter_names)) {
                    newParents.push({ entityClass: class_name, parameter: parameter });
                }
                const parents = existingOptionParents.get(index);
                if (parents !== undefined) {
                    parents.splice(parents.length, 0, ...newParents);
                }
                else {
                    options.value.push({
                        label: index,
                        parents: newParents,
                    });
                }
            }
            let selectFound = false;
            for (const select of selectionSelects.value) {
                if (select.type === indexRecord.index_name) {
                    select.priority = indexNamePriority(indexRecord.depth);
                    selectFound = true;
                    break;
                }
            }
            if (!selectFound) {
                selectionSelects.value.push(makeValueIndexSelectionSelect(
                    indexRecord.index_name,
                    options,
                    indexNamePriority(indexRecord.depth),
                ));
            }
        }
    });
}

/**Fetches data and updates data structures accordingly.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL of the analysis interface.
 * @param {object} plotSpecification Plot specification.
 * @param {Ref} selectionSelects Selection selects.
 * @param {Map} selectionOptions Selection options.
 * @param {Ref} dimensionsOptions Dimensions select options.
 * @callback updateValueIndexesCallback Callback to update value index selects.
*/
async function fetchData(
    projectId,
    analysisUrl,
    plotSpecification,
    selectionSelects,
    selectionOptions,
    dimensionsOptions,
    updateValueIndexesCallback,
) {
    const classes = new Set(plotSpecification.selection.entity_class);
    const currentlyRequiredClasses = new Set();
    for (const [itemType, options] of selectionOptions.entries()) {
        if (isEntityKey(itemType) || itemType === parameterKey) {
            for (const option of options.value) {
                for (const parent of option.parents) {
                    currentlyRequiredClasses.add(parent.entityClass);
                }
            }
        }
    }
    const newClasses = differingElements(classes, currentlyRequiredClasses);
    if (newClasses.length === 0) {
        return;
    }
    const entityPromise = fetchResultEntities(
        projectId, analysisUrl, newClasses
    );
    const parameterPromise = fetchResultParameters(
        projectId, analysisUrl, newClasses
    );
    const parameterData = await parameterPromise;
    addFetchedParameters(
        parameterData.parameters,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        updateValueIndexesCallback,
    );
    const entityData = await entityPromise;
    addFetchedEntities(
        entityData.entities,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        updateValueIndexesCallback,
    );
    updateValueIndexesCallback();
}

/**Updates all selects that depend on entity class selection.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL of the analysis interface.
 * @param {object} plotSpecification Plot specification.
 * @param {Ref} selectionSelects Selection selects.
 * @param {Map} selectionOptions Selection options.
 * @param {Ref} dimensionsOptions Dimensions select options.
 * @callback updateValueIndexes Callback to update value index selects.
 */
async function updateEntityClassDependentSelects(
    projectId,
    analysisUrl,
    plotSpecification,
    selectionSelects,
    selectionOptions,
    dimensionsOptions,
    updateValueIndexes,
) {
    removeExcessSelections(plotSpecification, selectionOptions);
    removeExcessSelectionSelects(selectionSelects);
    fetchData(
        projectId,
        analysisUrl,
        plotSpecification,
        selectionSelects,
        selectionOptions,
        dimensionsOptions,
        updateValueIndexes,
    );
}

export default {
    props: {
        identifier: { type: Number, required: true },
        projectId: { type: Number, required: true },
        analysisUrl: { type: String, required: true },
        scenarioExecutionIds: { type: Array, required: true },
    },
    components: {
        "plot-figure": PlotFigure,
    },
    setup(props) {
        const initialIndexNames = [];
        for (const [value, label] of indexNameLabels) {
            initialIndexNames.push({
                label: label, value: value, protected: true
            });
        }
        const dimensionsOptions = ref(initialIndexNames);
        const selectionOptions = new Map([[entityClassKey, ref([])]]);
        const plotSpecification = plotSpecifications.get(props.identifier);
        const parameterIndexUpdateCallback = function () {
            updateParameterIndexes(
                props.projectId,
                props.analysisUrl,
                props.scenarioExecutionIds,
                plotSpecification,
                selectionSelects,
                selectionOptions,
                dimensionsOptions
            ).finally(function () {
                selectionSelects.value.sort(comparePriorities);
                dimensionsOptions.value.sort(compareLabels);
            });
        }
        const updateClassSelection = function () {
            updateEntityClassDependentSelects(
                props.projectId,
                props.analysisUrl,
                plotSpecification,
                selectionSelects,
                selectionOptions,
                dimensionsOptions,
                parameterIndexUpdateCallback,
            ).finally(function () {
                selectionSelects.value.sort(comparePriorities);
                dimensionsOptions.value.sort(compareLabels);
            });
        };
        const selectionSelects = ref([
            makeEntityClassSelectionSelect(
                selectionOptions.get(entityClassKey),
                updateClassSelection),
        ]);
        const plotTypeOptions = [
            { label: "Line", value: "line" },
            { label: "Stacked line", value: "stacked line" },
            { label: "Bars", value: "bar" },
            { label: "Stacked bars", value: "stacked bar" },
            { label: "Heatmap", value: "heatmap" },
            { label: "Table", value: "table" },
        ];
        const cannotPlotMessage = computed(function () {
            if (props.scenarioExecutionIds.length === 0) {
                return "Select scenario from the left.";
            }
            if (plotSpecification.selection.entity_class.length === 0) {
                return "Select entity classes from above.";
            }
            if (plotSpecification.selection.parameter.length === 0) {
                return "Select parameters from above."
            }
            return "";
        });
        const plottingPossible = computed(function () {
            return (
                props.scenarioExecutionIds.length > 0
                && plotSpecification.selection.entity_class.length > 0
                && plotSpecification.selection.parameter.length > 0
            );
        });
        watch(toRef(props, "scenarioExecutionIds"), function () {
            parameterIndexUpdateCallback();
        });
        onMounted(function () {
            fetchResultEntityClasses(
                props.projectId, props.analysisUrl
            ).then(function (data) {
                const classes = data.entity_classes;
                const options = selectionOptions.get(entityClassKey);
                const existingOptionLabels = new Set();
                for (const option of options.value) {
                    existingOptionLabels.add(option.label);
                }
                for (const entityClass of classes) {
                    if (!existingOptionLabels.has(entityClass.name)) {
                        options.value.push({ label: entityClass.name });
                    }
                }
                if (plotSpecification.selection.entity_class.length > 0) {
                    const valueToOption = new Map();
                    for (const option of options.value) {
                        valueToOption.set(option.value, option);
                    }
                    const currentlySelectedOptions = [];
                    for (const value of plotSpecification.selection.entity_class) {
                        currentlySelectedOptions.push(valueToOption.get(value));
                    }
                    updateClassSelection(plotSpecification.selection.entity_class, currentlySelectedOptions);
                }
            });
        });
        return {
            availableIndexNames: dimensionsOptions,
            selectionSelects: selectionSelects,
            plotSpecification: plotSpecification,
            plotTypeOptions: plotTypeOptions,
            plottingPossible: plottingPossible,
            cannotPlotMessage: cannotPlotMessage,
            resolveDimensionConflictsX1(value) {
                nullifyDuplicateDimensions(value, "x1", plotSpecification.dimensions);
            },
            resolveDimensionConflictsX2(value) {
                nullifyDuplicateDimensions(value, "x2", plotSpecification.dimensions);
            },
            resolveDimensionConflictsX3(value) {
                nullifyDuplicateDimensions(value, "x3", plotSpecification.dimensions);
            },
            resolveDimensionConflictsSeparateWindow(value) {
                nullifyDuplicateDimensions(value, "separate_window", plotSpecification.dimensions);
            },
        };
    },
}
</script>

<style>
.dimension-select {
    min-width: 8em;
}

.multi-item-select {
    min-width: 15em;
}

.plot-type-select {
    max-width: 12em;
}
</style>
