<template>
    <n-space align="baseline" size="small">
        <n-select
            v-for="index in dimensions"
            :key="index"
            :options="options[index]"
            filterable
            :placeholder="placeholderText(index)"
            :show-arrow="false"
            size="tiny"
            :consistent-menu-width="false"
            @update:value="updateSelection"
            class="entity-list-select"
        />
        <n-button
            @click="emitRelationshipCreate"
            size="tiny"
            :disabled="!wellDefined"
            >
            Create
        </n-button>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";

/**
 * Generates options for the select elements.
 * @param {string[][]} availableObjects Array of arrays containing available object names.
 * @returns {Object[][]} Select options for each relationship dimension.
 */
function selectOptions(availableObjects) {
    const options = [];
    availableObjects.forEach(function(objects, dimension) {
        const dimensionOptions = [];
        objects.forEach(function (objectName) {
            dimensionOptions.push({
                label: objectName,
                value: objectName,
                dimension: dimension,
                style: {"font-size": "12px"},
            });
        });
        options.push(dimensionOptions);
    });
    return options;
}

export default {
    props: {
        availableObjects: {type: Array, required: true},
    },
    emits: ["relationshipCreate"],
    setup(props, context) {
        const dimensions = [...Array(props.availableObjects.length).keys()];
        const options = selectOptions(props.availableObjects);
        const selection = Array(props.availableObjects.length);
        const wellDefined = ref(false);
        return {
            dimensions: dimensions,
            options: options,
            wellDefined: wellDefined,
            emitRelationshipCreate() {
                context.emit("relationshipCreate", selection);
            },
            updateSelection(value, option) {
                selection[option.dimension] = value;
                selection.forEach(function(objectName, dimension) {
                    if(objectName === undefined) {
                        return;
                    }
                    else if(dimension === selection.length - 1) {
                        wellDefined.value = true;
                    }
                });
            },
            placeholderText(index) {
                let suffix = null;
                switch(index) {
                    case 0:
                        suffix = "st";
                        break;
                    case 1:
                        suffix = "nd";
                        break;
                    case 2:
                        suffix = "rd";
                        break;
                    default:
                        suffix = "th";
                }
                return `${index + 1}${suffix} object`;
            }
        };
    }
}
</script>
