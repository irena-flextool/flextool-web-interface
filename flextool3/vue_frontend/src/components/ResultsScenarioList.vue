<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-p v-if="!hasScenarios">
            No scenario results found. Go to the <n-a :href="runUrl">Run page</n-a> to solve the model.
        </n-p>
        <n-list v-else>
            <n-list-item v-for="(scenario, index) in scenarios" :key="index">
                <n-thing :title="scenario.name">
                    <n-tree
                        :data="scenario.executions"
                        selectable
                        :multiple="isMultiSelection"
                        block-line
                        :selected-keys="scenario.selected"
                        :render-suffix="renderSuffix"
                        @update:selected-keys="scenario.emitScenarioSelect"
                    />
                </n-thing>
            </n-list-item>
        </n-list>
    </fetchable>
</template>

<script>
import {computed, h, onMounted, ref, toRef, watch} from "vue/dist/vue.esm-bundler.js";
import {NButton, useMessage} from 'naive-ui'
import {fetchExecutedScenarioList, destroyScenarioExecution} from "../modules/communication.mjs";
import {timeFormat} from "../modules/scenarios.mjs";
import Fetchable from "./Fetchable.vue";

let busyDeletingId = null;

/**
 * Deletes scenario execution.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl Summary interface URL.
 * @param {number} id Scenario execution id.
 * @param {object[]} executions Execution tree items.
 * @callback emit Callable to emit "scenarioSelect".
 * @param {object} message Message API.
 */
function destroyExecution(projectId, summaryUrl, id, scenarioName, scenarios, emit, message) {
    busyDeletingId = id;
    const scenarioIndex = scenarios.value.findIndex((scenario) => scenario.name === scenarioName);
    const scenario = scenarios.value[scenarioIndex];
    const executionIndex = scenario.executions.findIndex((execution) => execution.key === id);
    const execution = scenario.executions[executionIndex];
    execution.disabled = true;
    execution.deleteDisabled = true;
    execution.deleting = true;
    destroyScenarioExecution(projectId, summaryUrl, id).then(function() {
        scenario.executions.splice(executionIndex, 1);
        if(scenario.executions.length === 0) {
            scenarios.value.splice(scenarioIndex, 1);
        }
        const selectedIndex = scenario.selected.findIndex((selected) => selected === id);
        if(selectedIndex !== -1) {
            scenario.selected.splice(selectedIndex, 1);
            emit("scenarioSelect", null);
        }
    }).catch(function(error) {
        execution.disabled = false;
        execution.deleteDisabled = false;
        execution.deleting = false;
        message.error(error.message);
    }).finally(function() {
        busyDeletingId = null;
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        runUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
        isMultiSelection: {type: Boolean, required: true},
    },
    emits: ["scenarioSelect"],
    components: {
        "fetchable": Fetchable,
    },
    setup(props, context) {
        const scenarios = ref([]);
        const state = ref(Fetchable.state.loading);
        const errorMessage = ref("");
        const hasScenarios = computed(() => scenarios.value.length > 0);
        const message = useMessage();
        watch(toRef(props, "isMultiSelection"), function() {
            if(!props.isMultiSelection) {
                let selectedDeclared = false;
                for(const scenario of scenarios.value) {
                    if(scenario.selected.length > 0) {
                        if(!selectedDeclared) {
                            scenario.selected = [scenario.selected[0]];
                            selectedDeclared = true;
                        }
                        else {
                            scenario.selected.length = 0;
                        }
                    }
                }
            }
        });
        const emitScenarioSelect = function(keys, options, scenarioName) {
            if(busyDeletingId !== null) {
                const ignoredKeyIndex = keys.findIndex((key) => key === busyDeletingId);
                if(ignoredKeyIndex !== -1) {
                    keys.splice(ignoredKeyIndex, 1);
                    options.splice(ignoredKeyIndex, 1);
                }
            }
            if(keys.length === 0 && !props.isMultiSelection) {
                return;
            }
            const scenario = scenarios.value.find((s) => s.name === scenarioName);
            if(!props.isMultiSelection) {
                for(const otherScenario of scenarios.value) {
                    otherScenario.selected.length = 0;
                }
                scenario.selected = [keys[0]];
                const option = options[0];
                context.emit("scenarioSelect", [{scenario: option.scenario, scenarioExecutionId: option.key}]);
            }
            else {
                scenario.selected = keys;
                const scenarioInfoList = [];
                for(const scenario of scenarios.value) {
                    if(scenario.selected.length === 0) {
                        continue;
                    }
                    const selectedLookup = new Set(scenario.selected);
                    for(const execution of scenario.executions) {
                        if(selectedLookup.has(execution.key)) {
                            scenarioInfoList.push({scenario: execution.scenario, scenarioExecutionId: execution.key});
                        }
                    }
                }
                context.emit("scenarioSelect", scenarioInfoList);
            }
        };
        onMounted(function() {
            fetchExecutedScenarioList(props.projectId, props.summaryUrl).then(function(response) {
                for(const scenarioName in response.scenarios) {
                    const scenarioInfoList = [];
                    for(const executionInfo of response.scenarios[scenarioName]) {
                        scenarioInfoList.push({
                            timeStamp: new Date(executionInfo.time_stamp),
                            scenarioExecutionId: executionInfo.scenario_execution_id,
                        });
                    }
                    const executions = [];
                    for(let i = 0; i <  scenarioInfoList.length; ++i) {
                        const scenarioInfo = scenarioInfoList[i];
                        const timeString = timeFormat.format(scenarioInfo.timeStamp);
                        const label = i == 0 ? timeString.concat(" (latest)") : timeString;
                        executions.push({
                            label: label,
                            key: scenarioInfo.scenarioExecutionId,
                            disabled: false,
                            deleteDisabled: false,
                            deleting: false,
                            scenario: scenarioName,
                        });
                    }
                    const scenario = {
                        name: scenarioName,
                        executions: executions,
                        selected: [],
                        emitScenarioSelect: (keys, options) => emitScenarioSelect(keys, options, scenarioName),
                    };
                    scenarios.value.push(scenario);
                }
                state.value = Fetchable.state.ready;
            }).catch(function(error) {
                errorMessage.value = error.message;
                state.value = Fetchable.state.error;
            });
        });
        return {
            scenarios: scenarios,
            hasScenarios: hasScenarios,
            state: state,
            errorMessage: errorMessage,
            setSelectedBusy(busy) {
                for(const scenario of scenarios.value) {
                    if(scenario.selected.length > 0) {
                        for(const execution of scenario.executions) {
                            if(scenario.selected.find((selected) => selected === execution.key) !== undefined) {
                                execution.deleteDisabled = busy;
                            }
                            else if(execution.deleteDisabled) {
                                execution.deleteDisabled = false;
                            }
                        }
                    }
                    else {
                        for(const execution of scenario.executions) {
                            if(execution.deleteDisabled) {
                                execution.deleteDisabled = false;
                            }
                        }
                    }
                }
            },
            renderSuffix(info) {
                return h(NButton, {
                    size: "tiny",
                    disabled: info.option.deleteDisabled,
                    loading: info.option.deleting,
                    onClick() {
                        info.option.deleteDisabled = true;
                        destroyExecution(
                            props.projectId,
                            props.summaryUrl,
                            info.option.key,
                            info.option.scenario,
                            scenarios,
                            context.emit,
                            message,
                        );
                    },
                }, {
                    default: () => "Delete"
                });
            },
        };
    },
}
</script>
