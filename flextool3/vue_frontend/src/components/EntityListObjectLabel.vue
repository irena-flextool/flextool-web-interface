<template>
    <n-space align="baseline">
        <n-text v-if="!editing" @dblclick="showInput"> {{ objectName }}</n-text>
        <entity-list-object-label-input
            v-else
            :object-name="objectName"
            @accept="emitRename"
            @cancel="hideInput"
        />
        <n-text>―</n-text>
        <n-text italic>{{ alternativeName }}</n-text>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import EntityListObjectLabelInput from "./EntityListObjectLabelInput.vue";

export default {
    props: {
        objectName: {type: String, required: true},
        objectId: {type: Number, required: false},
        alternativeName: {type: String, required: true},
    },
    emits: ["rename"],
    components: {
        "entity-list-object-label-input": EntityListObjectLabelInput
    },
    setup(props, context) {
        const editing = ref(false);
        const editValue = ref(props.objectName);
        const inputInstance = ref(null);
        return {
            editing: editing,
            editValue: editValue,
            inputInstance: inputInstance,
            showInput() {
                editing.value = true;
            },
            hideInput() {
                editing.value = false;
            },
            emitRename(name) {
                editing.value = false;
                context.emit("rename", {id: props.objectId, previousEmblem: props.objectName, entityEmblem: name});
            }
        };
    }
}
</script>
