<template>
    <n-space vertical>
        <n-h1>Solve {{executionId}} </n-h1>
        <n-p> {{status}} </n-p>
        <n-space>
            <n-button @click="execute" :loading="busyExecuting" :disabled="busyDestroying || busyExecuting">Execute</n-button>
            <n-button @click="destroy" :loading="busyDestroying" :disabled="busyDestroying || busyExecuting">Delete</n-button>
            <n-a :href="resultsUrl">View results</n-a>
        </n-space>
        <n-log :lines="logLines" :rows="20"></n-log>
    </n-space>
</template>
<script>
import { onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import { useMessage } from "naive-ui";
import { destroyExecution, executeExecution, fetchExecutionLogLines, fetchExecutionStatus } from "../modules/communication.js";

export default {
    props: {
        executionId: Number,
        executionsUrl: String,
        resultsUrl: String
    },
    emits: ["destroyed"],
    setup(props, context) {
        const status = ref("");
        const busyExecuting = ref(false);
        const busyDestroying = ref(false);
        const logLines = ref([]);
        const message = useMessage();
        onMounted(function() {
            fetchExecutionStatus(props.executionId, props.executionsUrl).then(function(data){
                switch(data.status) {
                    case "YS":
                        status.value = "Click 'Execute' to start solving.";
                        break;
                    case "OK":
                        status.value = "Solved successfully.";
                        break;
                    case "RU":
                        status.value = "In progress...";
                        break;
                    case "ER":
                        status.value = "Error.";
                        break;
                    case "AB":
                        status.value = "Aborted. Click 'Execute' to try again.";
                        break;
                    default:
                        status.value = "In unknown state.";
                }
            }).catch(function(error) {
                status.value = "Failed to fetch status."
                message.error(error.message);
            });
        });
        return {
            status: status,
            busyExecuting: busyExecuting,
            busyDestroying: busyDestroying,
            logLines: logLines,
            execute: function() {
                busyExecuting.value = true;
                executeExecution(props.executionId, props.executionsUrl).then(function() {
                    const timer = window.setInterval(function() {
                        fetchExecutionLogLines(props.executionId, props.executionsUrl).then(function(data) {
                            if (data.type === "log ended") {
                                status.value = "Solved successfully.";
                                window.clearInterval(timer);
                            }
                            else {
                                logLines.value.push(...data.lines);
                            }
                        });
                    }, 1000);
                }).catch(function(error){
                    message.error(error.message);
                }).finally(function() {
                    busyExecuting.value = false;
                });
            },
            destroy: function() {
                busyDestroying.value = true;
                destroyExecution(props.executionId, props.executionsUrl).then(function(data) {
                    context.emit("destroyed", data.id);
                }).catch(function(error) {
                    message.error(error.message);
                }).finally(function() {
                    busyDestroying.value = false;
                });
            }
        };
    }
};
</script>
