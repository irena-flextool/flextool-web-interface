<template>
    <n-space align="baseline" size="small">
        <n-select
            v-for="index in dimensions"
            :key="index"
            :options="options[index]"
            filterable
            size="small"
            @update:value="updateSelection"
        />
        <n-button
            @click="emitRelationshipCreate"
            size="small"
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
                dimension: dimension
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
        const dimensions = ref([...Array(props.availableObjects.length).keys()]);
        const options = ref(selectOptions(props.availableObjects));
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
        };
    }
}
</script>
