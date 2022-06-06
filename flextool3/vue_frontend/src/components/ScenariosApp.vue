<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}, {name: 'Model', url: editUrl}]"
        leaf-name="scenarios"
    />
    <commit-button
        :has-pending-changes="hasPendingChanges"
        :committing="committing"
        @commit-request="commit"
    />
    <n-grid :cols="3">
        <n-grid-item>
            <n-space vertical>
                <n-h1>Alternatives</n-h1>
                <alternative-list
                    :project-id="projectId"
                    :model-url="modelUrl"
                    :inserted="insertedAlternatives"
                    @available-alternatives-change="updateAvailableAlternatives"
                    @alternative-insert="storeAlternativeInsertion"
                    @alternative-update="storeAlternativeUpdate"
                    @alternative-delete="storeAlternativeDeletion"
                />
            </n-space>
        </n-grid-item>
        <n-grid-item :span="2">
            <n-space vertical>
                <n-h1>Scenarios</n-h1>
                <scenarios-table
                    ref="scenariosTable"
                    :project-id="projectId"
                    :model-url="modelUrl"
                    @scenario-fetch="setOriginalScenarios"
                    @scenario-update="updateScenarios"
                    @duplicate-scenario="setScenarioIssues"
                />
                <text type="error">
                    {{ scenarioIssues }}
                </text>
            </n-space>
        </n-grid-item>
    </n-grid>
</template>

<script>
import {ref, watch} from "vue/dist/vue.esm-bundler.js";
import {useDialog, useMessage} from "naive-ui";
import {ScenarioDiff} from "../modules/scenarioDiff.mjs";
import {scenarioActions} from "../modules/scenarioAlternativeTextTable.mjs";
import * as Communication from "../modules/communication.mjs";
import {uncommittedChangesWatcher} from "../modules/eventListeners.mjs";
import CommitButton from "./CommitButton.vue";
import AlternativeList from "./AlternativeList.vue";
import PagePath from "./PagePath.vue";
import ScenariosTable from "./ScenariosTable.vue";

function validateScenarios(scenarios, availableAlternatives, scenarioIssues) {
    if(scenarios === null || availableAlternatives === null) {
        return;
    }
    for(const [scenarioName, scenarioAlternatives] of scenarios) {
        if(!scenarioAlternatives) {
            scenarioIssues.value = `Alternatives missing for scenario '${scenarioName}'`;
            return;
        }
        const existingAlternatives = new Set();
        for(const alternative of scenarioAlternatives) {
            if(!availableAlternatives.has(alternative)) {
                scenarioIssues.value = `Unknown alternative '${alternative}' in scenario '${scenarioName}'`;
                return;
            }
            if(existingAlternatives.has(alternative)) {
                scenarioIssues.value = `Duplicate alternative '${alternative}' in scenario '${scenarioName}'`;
                return;
            }
            existingAlternatives.add(alternative);
        }
    }
    scenarioIssues.value = "";
}

function hasPendingScenarioUpdates(scenarios, originalScenarios) {
    if(scenarios === null || originalScenarios === null) {
        return false;
    }
    if(scenarios.size != originalScenarios.length) {
        return true;
    }
    for(const original of originalScenarios) {
        if(!scenarios.has(original.scenarioName)) {
            return true;
        }
        const alternatives = scenarios.get(original.scenarioName);
        if(alternatives.length != original.scenarioAlternatives.length) {
            return true;
        }
        for(let i = 0; i != alternatives.length; ++i){
            if(alternatives[i] != original.scenarioAlternatives[i]) {
                return true
            }
        }
    }
    return false;
}

function isPending(diff, currentScenarios, originalScenarios, scenarioIssues) {
    return diff.isPending() ||
        (!scenarioIssues.value && hasPendingScenarioUpdates(currentScenarios, originalScenarios));
}

export default {
    props: {
        indexUrl: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectId: {type: Number, required: true},
        editUrl: {type: String, required: true},
        modelUrl: {type: String, required:  true},
    },
    components: {
        "commit-button": CommitButton,
        "alternative-list": AlternativeList,
        "page-path": PagePath,
        "scenarios-table": ScenariosTable
    },
    setup(props) {
        const hasPendingChanges = ref(false);
        const committing = ref(false);
        const insertedAlternatives = ref([]);
        const scenarioIssues = ref("");
        const scenariosTable = ref(null);
        const diff = new ScenarioDiff();
        let availableAlternatives = null;
        let originalScenarios = null;
        let currentScenarios = null;
        const message = useMessage();
        const dialog = useDialog();
        watch(hasPendingChanges, uncommittedChangesWatcher);
        return {
            hasPendingChanges: hasPendingChanges,
            committing: committing,
            insertedAlternatives: insertedAlternatives,
            scenarioIssues: scenarioIssues,
            scenariosTable: scenariosTable,
            commit () {
                committing.value = true;
                if(scenarioIssues.value) {
                    dialog.warning({
                        title: "Cannot commit",
                        content: "Scenarios have issues that must be solved first."
                    });
                    return;
                }
                if(currentScenarios !== null) {
                    const actions = scenarioActions(currentScenarios, originalScenarios);
                    actions.deleted.forEach(function(deleted) {
                        diff.deleteScenario(deleted.scenarioId, deleted.scenarioName);
                    });
                    actions.inserted.forEach(function(inserted) {
                        diff.insertScenarioAlternatives(
                            inserted.scenarioId, inserted.scenarioName, inserted.scenarioAlternatives
                        );
                    });
                }
                const commitData = diff.makeCommitData();
                Communication.commit(
                    commitData,
                    "Modified alternatives and scenarios.",
                    props.projectId,
                    props.modelUrl
                ).then(function(data) {
                    if(data.inserted && data.inserted.alternative) {
                        insertedAlternatives.value = data.inserted.alternative;
                    }
                    scenariosTable.value.fetchScenarios();
                    message.success("Commit successful.");
                    hasPendingChanges.value = false;
                }).catch(function(error) {
                    dialog.error({title: "Commit failure", content: error.message});
                }).finally(function() {
                    diff.clearPending();
                    committing.value = false;
                });
            },
            updateAvailableAlternatives(alternatives) {
                availableAlternatives = alternatives;
                validateScenarios(currentScenarios, alternatives, scenarioIssues);
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
            storeAlternativeInsertion(alternativeName) {
                diff.insertAlternative(alternativeName);
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
            storeAlternativeUpdate(renameData) {
                diff.updateAlternative(renameData.previousName, renameData.id, renameData.name);
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
            storeAlternativeDeletion(deletionData) {
                diff.deleteAlternative(deletionData.id, deletionData.name);
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
            setOriginalScenarios(scenarios) {
                originalScenarios = scenarios;
                currentScenarios = new Map(scenarios.map((s) => [s.scenarioName, s.scenarioAlternatives]));
            },
            setScenarioIssues(issue) {
                scenarioIssues.value = issue;
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
            updateScenarios(scenarios) {
                validateScenarios(scenarios, availableAlternatives, scenarioIssues)
                currentScenarios = scenarios;
                hasPendingChanges.value = isPending(diff, currentScenarios, originalScenarios, scenarioIssues);
            },
        };
    }
}
</script>
