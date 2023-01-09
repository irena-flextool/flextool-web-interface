<template>
    <n-space justify="space-between" align="baseline">
        <n-a v-if="!busy" :href="url">{{ projectName }}</n-a>
        <n-a v-else>{{ projectName }}</n-a>
        <n-button @click="destroy" :loading="busy" :disabled="busy">Delete</n-button>
    </n-space>
</template>

<script>
import { ref } from "vue/dist/vue.esm-bundler.js";
import { useMessage } from "naive-ui";
import { destroyProject } from "../modules/communication.mjs";

export default {
    props: {
        projectId: Number,
        projectName: String,
        url: String,
        projectsUrl: String
    },
    emits: ["destroyed"],
    setup(props, context) {
        const busy = ref(false);
        const message = useMessage();
        return {
            busy: busy,
            destroy() {
                busy.value = true;
                destroyProject(props.projectId, String(props.projectsUrl)).then(function (data) {
                    context.emit("destroyed", data.id);
                }).catch(function (error) {
                    message.error(error.message);
                }).finally(function () {
                    busy.value = false;
                });
            }
        };
    }
}
</script>
