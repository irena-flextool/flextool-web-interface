<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Run"/>
    <n-list>
        <n-list-item v-for="execution in executions" :key="execution.id">
            <execution-row
                @destroyed="deleteExecution"
                :execution-id="execution.id"
                :executions-url="executionsUrl"
                results-url="https://www.google.com"
            />
        </n-list-item>
        <template #footer>
            <n-button @click="createRun" :loading="newRunButtonBusy" :disabled="newRunButtonBusy">
                New run
            </n-button>
        </template>
    </n-list>
</template>
<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";
import PagePath from "./PagePath.vue";
import ExecutionRow from "./ExecutionRow.vue";
import {fetchExecutionList, createExecution} from "../modules/communication.mjs";

export default {
    props: {
        indexUrl: String,
        projectUrl: String,
        projectName: String,
        projectId: Number,
        executionsUrl: String
    },
    setup (props) {
        const executions = ref([]);
        const newRunButtonBusy = ref(false);
        const message = useMessage();
        onMounted(function() {
            fetchExecutionList(props.projectId, String(props.executionsUrl)).then(function(data) {
                executions.value = data.executions;
            }).catch(function(error) {
                message.error(error.message);
            });
        });
        return {
            executions: executions,
            newRunButtonBusy: newRunButtonBusy,
            createRun () {
                newRunButtonBusy.value = true;
                createExecution(props.projectId, String(props.executionsUrl)).then(function(data) {
                    executions.value.push(data.execution);
                }).catch(function(error) {
                    message.error(error.message);
                }).finally(function() {
                    newRunButtonBusy.value = false;
                });
            },
            deleteExecution: function(executionId) {
                const index = executions.value.findIndex(function(execution) {
                    return execution.id === executionId;
                });
                if (index < 0) {
                    throw new Error(`Execution id ${executionId} not found while deleting execution.`);
                }
                executions.value.splice(index, 1);
            }
        };
    },
    components: {
        "page-path": PagePath,
        "execution-row": ExecutionRow
    }
};
</script>
