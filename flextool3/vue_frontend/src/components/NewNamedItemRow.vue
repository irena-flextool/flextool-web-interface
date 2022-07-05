<template>
    <n-space>
        <n-input
            clearable
            :placeholder="placeholder"
            v-model:value="currentName"
            size="tiny"
        />
        <n-button
            @click="emitCreate"
            size="tiny"
        >
            Create
        </n-button>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";

export default {
    props: {
     itemName: {type: String, required: true},
    },
    emits: ["create"],
    setup(props, context) {
        const currentName = ref("");
        const placeholder = `Enter ${props.itemName} name`;
        const message = useMessage();
        return {
            currentName: currentName,
            placeholder: placeholder,
            emitCreate() {
                const proposedName = new String(currentName.value).trim();
                if(!proposedName) {
                    message.error(`Please enter name for the new ${props.itemName}.`);
                    return;
                }
                const forbiddenCharacters = /[,]/
                if(forbiddenCharacters.test(proposedName)) {
                    const upperCased = props.itemName.charAt(0).toUpperCase() + props.itemName.slice(1);
                    message.error(`${upperCased} name contains invalid special characters.`);
                    return
                }
                context.emit("create", proposedName);
                currentName.value = "";
            },
        };
    }
}
</script>
