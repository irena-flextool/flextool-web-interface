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
                        :selected-keys="scenario.selected"
                        @update:selected-keys="emitScenarioSelect"
                    />
                </n-thing>
            </n-list-item>
        </n-list>
    </fetchable>
</template>

<script>
import {computed, onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {fetchExecutedScenarioList} from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";

export default {
    props: {
        projectId: {type: Number, required: true},
        runUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
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
        onMounted(function() {
            fetchExecutedScenarioList(props.projectId, props.summaryUrl).then(function(response) {
                const timeFormat = Intl.DateTimeFormat([], {dateStyle: "short", timeStyle: "short"});
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
                            scenario: scenarioName,
                        });
                    }
                    const scenario = {
                        name: scenarioName,
                        executions: executions,
                        selected: [],
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
            emitScenarioSelect(keys, options) {
                if(keys.length === 0) {
                    return;
                }
                for(const scenario of scenarios.value) {
                    if(scenario.key === keys[0]) {
                        scenario.selected = [keys[0]];
                    }
                    else {
                        scenario.selected.length = 0;
                    }
                }
                const option = options[0];
                context.emit("scenarioSelect", {scenario: option.scenario, scenarioExecutionId: option.key});
            },
        };
    },
}
</script>
