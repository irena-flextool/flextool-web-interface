<template>
    <n-space justify="end" align="baseline">
        <n-text :type="messageType">
            {{ statusMessage }}
        </n-text>
        <n-button @click="emitAdd" :disabled="loading" :loading="loading" size="small">
            Add
        </n-button>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";

export default {
    props: {
        example: {type: String, required: true},
    },
    emits: ["add"],
    setup(props, context) {
        const loading = ref(false);
        const statusMessage = ref("");
        const messageType = ref("info");
        const setLoading = (isLoading) => loading.value = isLoading;
        const setStatus = function(status) {
            switch(status) {
                case "ok":
                    messageType.value = "success";
                    statusMessage.value = "Added to model.";
                    break;
                case "error":
                    messageType.value = "error";
                    statusMessage.value = "Failed to add.";
                    break;
                case "failure":
                    messageType.value = "error";
                    statusMessage.value = "Network error.";
                    break;
                default:
                    messageType.value = "warning";
                    statusMessage.value = "Unknown status.";
            }
        };
        return {
            loading: loading,
            statusMessage: statusMessage,
            messageType: messageType,
            emitAdd() {
                context.emit("add", {example: props.example, setLoading: setLoading, setStatus: setStatus});
            },
        };
    },
}
</script>
