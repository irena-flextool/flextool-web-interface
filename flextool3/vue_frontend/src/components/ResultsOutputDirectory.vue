<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-thing title="Output directory for .csv files">
            <n-space>
                <n-text code>{{ outputDirectory }}</n-text>
                <n-button size="tiny" @click="copyDirectoryToClipboard">
                    Copy to clipboard
                </n-button>
            </n-space>
        </n-thing>
    </fetchable>
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {fetchOutputDirectory} from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";

/**
 * Fetches tool output directory from server.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl Url to summary interface.
 * @param {number} scenarioExecutionId Id of selected scenario execution.
 * @param {Ref} outputDirectory Reference to results directory path.
 * @callback emit Callback to emit "busy".
 * @param {Ref} state Reference to fetchable state.
 * @param {Ref} errorMessage Reference to error message.
 */
function loadOutputDirectory(projectId, summaryUrl, scenarioExecutionId, outputDirectory, emit, state, errorMessage) {
    state.value = Fetchable.state.loading;
    fetchOutputDirectory(projectId, summaryUrl, scenarioExecutionId).then(function(data) {
        outputDirectory.value = data.directory;
        state.value = Fetchable.state.ready;
    }).catch(function(error) {
        state.value = Fetchable.state.error;
        errorMessage.value = error.message;
    }).finally(function() {
        emit("busy", false);
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        summaryUrl: {type: String, required: true},
    },
    emits: ["busy", "ready"],
    components: {
        "fetchable": Fetchable,
    },
    setup(props, context) {
        const outputDirectory = ref(null);
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        onMounted(function() {
            context.emit("ready");
        });
        return {
            outputDirectory: outputDirectory,
            state: state,
            errorMessage: errorMessage,
            copyDirectoryToClipboard() {
                navigator.clipboard.writeText(outputDirectory.value);
            },
            loadDirectory(scenarioInfo) {
                if(scenarioInfo === null) {
                    outputDirectory.value = null;
                    state.value = Fetchable.state.waiting;
                    return;
                }
                context.emit("busy", true);
                loadOutputDirectory(
                    props.projectId,
                    props.summaryUrl,
                    scenarioInfo.scenarioExecutionId,
                    outputDirectory,
                    context.emit,
                    state,
                    errorMessage
                );
            },
        };
    },
}
</script>
