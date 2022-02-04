<template>
    <n-tag
        v-if="!editing"
        @dblclick="startEditing"
        size="small"
    >
        {{ objectName }}
    </n-tag>
    <entity-list-relationship-object-input
        v-else
        :object-name="objectName"
        :available-objects="availableObjects"
        @accept="accept"
        @cancel="hideInput"
    />
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import EntityListRelationshipObjectInput from "./EntityListRelationshipObjectInput.vue";

export default {
    props: {
        objectName: {type: String, required: true},
        dimension: {type: Number, required: true},
        availableObjects: {type: Array, required: true},
    },
    emits: ["accept"],
    components: {
        "entity-list-relationship-object-input": EntityListRelationshipObjectInput,
    },
    setup(props, context) {
        const editing = ref(false);
        return {
            editing: editing,
            startEditing() {
                editing.value = true;
            },
            accept(objectName) {
                editing.value = false;
                context.emit("accept", {dimension: props.dimension, objectName: objectName});
            },
            hideInput() {
                editing.value = false;
            },
        };
    }
}
</script>
