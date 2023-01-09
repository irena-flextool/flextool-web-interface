<template>
    <n-tag v-if="!editing" :type="tagType" @click="startEditing" size="small">
        {{ objectName }}
    </n-tag>
    <entity-list-relationship-object-input v-else :object-name="objectName" :available-objects="availableObjects"
        @accept="accept" @cancel="hideInput" />
</template>

<script>
import { computed, ref } from "vue/dist/vue.esm-bundler.js";
import EntityListRelationshipObjectInput from "./EntityListRelationshipObjectInput.vue";

export default {
    props: {
        objectName: { type: String, required: true },
        objectNamesClash: { type: Boolean, required: false, default: false },
        dimension: { type: Number, required: true },
        availableObjects: { type: Array, required: true },
    },
    emits: ["accept"],
    components: {
        "entity-list-relationship-object-input": EntityListRelationshipObjectInput,
    },
    setup(props, context) {
        const tagType = computed(() => props.objectNamesClash ? "error" : "default");
        const editing = ref(false);
        return {
            tagType: tagType,
            editing: editing,
            startEditing() {
                editing.value = true;
            },
            accept(objectName) {
                editing.value = false;
                context.emit("accept", { dimension: props.dimension, objectName: objectName });
            },
            hideInput() {
                editing.value = false;
            },
        };
    }
}
</script>
