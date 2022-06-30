<template>
    <page
        name="Run"
        :index-url="indexUrl"
        :project-url="projectUrl"
        :edit-url="editUrl"
        :run-url="runUrl"
        :results-url="resultsUrl"
        :logout-url="logoutUrl"
        :logo-url="logoUrl"
    >
        <template #header>
            <page-path
                :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
                leaf-name="Run"
            />
        </template>
        <fetchable :state="state" :error-message="errorMessage">
            <n-grid :cols="3">
                <n-grid-item>
                    <n-space vertical>
                        <n-text :type="statusMessageType">{{ statusMessage }}</n-text>
                        <n-a :href="scenariosUrl">Scenario editor</n-a>
                        <n-text>Select scenarios to run:</n-text>
                        <n-checkbox-group v-model:value="selectedScenarios" :disabled="isExecuting">
                            <n-space vertical>
                                <n-checkbox
                                    v-for="(scenario, index) in availableScenarios"
                                    :value="scenario"
                                    :label="scenario"
                                    :key="index"
                                />
                            </n-space>
                        </n-checkbox-group>
                        <n-space>
                            <n-button @click="execute" :disabled="isPlayButtonDisabled" :loading="isExecuting">
                                <template #icon>
                                    <n-icon>
                                        <play/>
                                    </n-icon>
                                </template>
                                Run
                            </n-button>
                            <n-button @click="abort" :disabled="isAbortButtonDisabled" :loading="isAborting">
                                <template #icon>
                                    <n-icon>
                                        <stop-icon/>
                                    </n-icon>
                                </template>
                                Abort
                            </n-button>
                        </n-space>
                    </n-space>
                </n-grid-item>
                <n-grid-item :span="2">
                    <n-h1>Run log</n-h1>
                    <n-card size="small">
                        <n-log
                            :lines="logLines"
                            :rows="20"
                            :loading="isExecuting"
                            ref="logInstance"
                        />
                    </n-card>
                </n-grid-item>
            </n-grid>
        </fetchable>
    </page>
</template>

<script>
import {computed, nextTick, onMounted, ref, watch} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";
import {Play, Stop} from '@vicons/fa';
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";
import Fetchable from "./Fetchable.vue";
import {
    executeExecution,
    abortExecution,
    fetchCurrentExecution,
    fetchData,
    fetchExecutionBriefing,
} from "../modules/communication.mjs";

let fetchingBriefing = false;

function followExecution(
    projectId, executionsUrl, logLines, status, busyExecuting, busyAborting, message) {
    const timer = window.setInterval(function() {
        if(fetchingBriefing) {
            return;
        }
        fetchingBriefing = true;
        fetchExecutionBriefing(projectId, executionsUrl).then(function(data) {
            const briefing = data.briefing;
            status.value = briefing.status;
            logLines.value = briefing.log;
            if(briefing.status !== "RU") {
                busyExecuting.value = false;
                busyAborting.value = false;
                window.clearInterval(timer);
            }
        }).catch(function(error) {
            window.clearInterval(timer);
            status.value = "AB";
            busyExecuting.value = false;
            busyAborting.value = false;
            message.error(error.message);
        }).finally(function() {
            fetchingBriefing = false;
        });
    }, 500);
}


export default {
    props: {
        indexUrl: {type: String, required: true},
        editUrl: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectId: {type: Number, required: true},
        runUrl: {type: String, required: true},
        resultsUrl: {type: String, required: true},
        modelUrl: {type: String, required: true},
        executionsUrl: {type: String, required: true},
        scenariosUrl: {type: String, required: true},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "fetchable": Fetchable,
        "page": Page,
        "page-path": PagePath,
        "play": Play,
        "stop-icon": Stop,
    },
    setup(props) {
        const availableScenarios = ref([]);
        const selectedScenarios = ref([]);
        const logLines = ref([]);
        const state = ref(Fetchable.state.loading);
        const errorMessage = ref("");
        const executionStatus = ref("YS");
        const isExecuting = ref(false);
        const isAborting = ref(false);
        const logInstance = ref(null);
        const isPlayButtonDisabled = computed(() => isExecuting.value || selectedScenarios.value.length === 0);
        const isAbortButtonDisabled = computed(() => !isExecuting.value || isAborting.value);
        const statusMessageType = ref("default");
        const statusMessage = computed(function() {
            if(availableScenarios.value.length === 0) {
                statusMessageType.value = "error";
                return "No scenarios available. Please create some in the Scenario editor.";
            }
            else if(executionStatus.value === "OK") {
                statusMessageType.value = "success";
                return "Run finished successfully.";
            }
            else if(executionStatus.value === "AB") {
                statusMessageType.value = "default";
                return "Run aborted.";
            }
            else if(executionStatus.value === "ER") {
                statusMessageType.value = "error";
                return "Error. Check run log."
            }
            else {
                statusMessageType.value = "default";
                return "";
            }
        });
        const message = useMessage();
        onMounted(function() {
            const scenarioPromise = fetchData(
                "scenarios?", props.projectId, props.modelUrl
            ).then(function(data) {
                return data.scenarios;
            });
            fetchCurrentExecution(
                props.projectId, props.executionsUrl
            ).then(async function(data) {
                if(data.status === "RU") {
                    isExecuting.value = true;
                    followExecution(
                        props.projectId,
                        props.executionsUrl,
                        logLines,
                        executionStatus,
                        isExecuting,
                        isAborting,
                        message
                    );
                }
                const scenarioData = await scenarioPromise;
                scenarioData.forEach((scenario) => availableScenarios.value.push(scenario.scenario_name));
                data.scenarios.forEach(function(scenario) {
                    if(availableScenarios.value.find((s) => s === scenario) !== undefined) {
                        selectedScenarios.value.push(scenario);
                    }
                });
                state.value = Fetchable.state.ready;
            }).catch(function(error) {
                errorMessage.value = error.message;
                state.value = Fetchable.state.error;
            });
        });
        watch(logLines, function() {
            if(logInstance.value !== null) {
                nextTick(() => logInstance.value.scrollTo({top: logLines.value.length * 1000, slient: true}));
            }
        });
        return {
            availableScenarios: availableScenarios,
            selectedScenarios: selectedScenarios,
            logLines: logLines,
            statusMessageType: statusMessageType,
            statusMessage: statusMessage,
            state: state,
            errorMessage: errorMessage,
            isExecuting: isExecuting,
            isAborting: isAborting,
            logInstance: logInstance,
            isPlayButtonDisabled: isPlayButtonDisabled,
            isAbortButtonDisabled: isAbortButtonDisabled,
            execute: function() {
                isExecuting.value = true;
                logLines.value.length = 0;
                executeExecution(
                    props.projectId,
                    props.executionsUrl,
                    selectedScenarios.value
                ).then(function() {
                    followExecution(
                        props.projectId,
                        props.executionsUrl,
                        logLines,
                        executionStatus,
                        isExecuting,
                        isAborting,
                        message
                    );
                }).catch(function(error){
                    message.error(error.message);
                });
            },
            abort: function() {
                isAborting.value = true;
                abortExecution(props.projectId, props.executionsUrl).catch(function(error) {
                    message.error(error.message);
                });
            },
        };
    },
};
</script>
