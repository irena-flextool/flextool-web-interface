<template>
    <n-space>
        <n-input
        clearable
        placeholder="Enter object name"
        :value="currentName"
        @update:value="nameChanged"
        size="small"
        />
        <n-button
            @click="emitCreateObject"
            size="small"
            >
            Create
        </n-button>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";

export default {
    emits: ["objectCreate"],
    setup(props, context) {
        const currentName = ref("");
        const message = useMessage();
        return {
            currentName: currentName,
            nameChanged(newName) {
                currentName.value = newName;
            },
            emitCreateObject() {
                const proposedName = new String(currentName.value).trim();
                if(!proposedName) {
                    message.error("Please enter name for the new object.");
                    return;
                }
                const forbiddenCharacters = /[,]/
                if(forbiddenCharacters.test(proposedName)) {
                    message.error("Object name contains invalid special characters.");
                    return
                }
                context.emit("objectCreate", proposedName);
                currentName.value = "";
            }
        };
    }
}
</script>
