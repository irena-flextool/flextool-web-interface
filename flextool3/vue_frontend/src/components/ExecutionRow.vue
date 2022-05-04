<template>
    <n-space vertical>
        <n-h1>Run {{executionId}} </n-h1>
        <n-p> {{status}} </n-p>
        <n-space>
            <n-button @click="execute" :loading="busyExecuting" :disabled="busyDestroying || busyExecuting">Execute</n-button>
            <n-button @click="abort" :loading="busyAborting" :disabled="!busyExecuting || busyAborting">Abort</n-button>
            <n-button @click="destroy" :loading="busyDestroying" :disabled="busyDestroying || busyExecuting">Delete</n-button>
            <n-a :href="resultsUrl">View results</n-a>
        </n-space>
        <n-log :lines="logLines" :rows="20"></n-log>
    </n-space>
</template>
<script>
import { onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import { useMessage } from "naive-ui";
import { destroyExecution, executeExecution, abortExecution, fetchExecutionUpdates, fetchExecutionLog, fetchExecutionStatus } from "../modules/communication.mjs";

function statusText(status) {
    switch(status) {
        case "YS":
            return "Click 'Execute' to start.";
        case "OK":
            return "Finished successfully.";
        case "RU":
            return "In progress...";
        case "ER":
            return "Error.";
        case "AB":
            return "Aborted. Click 'Execute' to try again.";
        default:
            return "In unknown state.";
    }
}

function followExecution(executionId, executionsUrl, logLines, status, busyExecuting, busyAborting, message) {
    const timer = window.setInterval(function() {
        fetchExecutionUpdates(executionId, executionsUrl).then(function(data) {
            const updates = data.updates;
            if ("newLogLines" in updates) {
                logLines.value.push(...updates.newLogLines);
            }
            if ("newStatus" in updates) {
                status.value = statusText(updates.newStatus);
                busyExecuting.value = false;
                busyAborting.value = false;
                window.clearInterval(timer);
            }
        }).catch(function(error) {
            window.clearInterval(timer);
            busyExecuting.value = false;
            busyAborting.value = false;
            message.error(error.message);
        });
    }, 500);
}

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
        const busyAborting = ref(false);
        const busyDestroying = ref(false);
        const logLines = ref([]);
        const message = useMessage();
        onMounted(function() {
            fetchExecutionLog(props.executionId, props.executionsUrl).then(function(data) {
                logLines.value = data.log;
            }).catch(function(error) {
                message.error(error.message);
            });
            fetchExecutionStatus(props.executionId, props.executionsUrl).then(function(data) {
                status.value = statusText(data.status);
                if (data.status === "RU") {
                    busyExecuting.value = true;
                    followExecution(props.executionId, props.executionsUrl, logLines, status, busyExecuting, busyAborting, message);
                }
            }).catch(function(error) {
                status.value = "Failed to fetch status."
                message.error(error.message);
            });
        });
        return {
            status: status,
            busyExecuting: busyExecuting,
            busyAborting: busyAborting,
            busyDestroying: busyDestroying,
            logLines: logLines,
            execute: function() {
                busyExecuting.value = true;
                logLines.value.length = 0;
                status.value = statusText("RU");
                executeExecution(props.executionId, props.executionsUrl).then(function() {
                    followExecution(props.executionId, props.executionsUrl, logLines, status, busyExecuting, busyAborting, message);
                }).catch(function(error){
                    message.error(error.message);
                });
            },
            abort: function(){
                busyAborting.value = true;
                abortExecution(props.executionId, props.executionsUrl).catch(function(error) {
                    message.error(error.message);
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
