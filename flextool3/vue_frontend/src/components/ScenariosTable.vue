<template>
    <n-space vertical>
        <n-text>scenario alternative_1 alternative_2…</n-text>
        <fetchable :state="state" :error-message="errorMessage">
            <n-input
                type="textarea"
                :value="text"
                placeholder="Input scenarios and scenario alternatives"
                :rows="rowCount"
                @update:value="parseUpdatedText"
            />
        </fetchable>
    </n-space>
</template>

<script>
import {ref, onMounted} from "vue/dist/vue.esm-bundler.js";
import {makeScenarioAlternativesTable, parseScenarioAlternatives} from "../modules/scenarioAlternativeTextTable.mjs";
import * as Communication from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";

function fetchScenarios(projectId, modelUrl, tableText, rowCount, state, errorMessage, emit) {
        Communication.fetchData(
        "scenarios?", projectId, modelUrl
    ).then(function(data) {
        const scenarios = [];
        data.scenarios.forEach(function(scenario) {
            scenarios.push({
                scenarioId: scenario.scenario_id,
                scenarioName: scenario.scenario_name,
                scenarioAlternatives: scenario.scenario_alternatives
            });
        });
        emit("scenarioFetch", scenarios);
        tableText.value = makeScenarioAlternativesTable(scenarios);
        rowCount.value = Math.max(10, (tableText.value.match(/\n/g) || "").length + 3);
        state.value = "ready";
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = "error";
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
    },
    emits: ["scenarioFetch", "scenarioUpdate", "duplicateScenario"],
    components: {
        "fetchable": Fetchable
    },
    setup(props, context) {
        const text = ref("");
        const rowCount = ref(10);
        const state = ref("loading");
        const errorMessage = ref("");
        onMounted(function() {
            fetchScenarios(props.projectId, props.modelUrl, text, rowCount, state, errorMessage, context.emit);
        });
        return {
            text: text,
            rowCount: rowCount,
            state: state,
            errorMessage: errorMessage,
            parseUpdatedText(newText) {
                text.value = newText;
                let scenarios = null;
                try {
                    scenarios = parseScenarioAlternatives(newText);
                } catch(e) {
                    context.emit("duplicateScenario", e.message);
                    return;
                }
                context.emit("scenarioUpdate", scenarios);
            },
            fetchScenarios() {
                fetchScenarios(props.projectId, props.modelUrl, text, rowCount, state, errorMessage, context.emit);
            }
        };
    },
}
</script>
