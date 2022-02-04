<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}, {name: 'Model', url: editUrl}]"
        :leaf-name="className"
    />
    <n-h1>{{ className  }}</n-h1>
    <n-p v-show="classDescription !== 'None'">{{ classDescription }}</n-p>
    <n-space align="baseline">
        <n-button
            :disabled="!pendingChanges"
            :loading="committing"
            @click="showCommitMessageEditor = true"
            >
            Commit
        </n-button>
        <n-text v-if="pendingChanges">
            There are pending changes.
        </n-text>
        <n-text v-else>
            Nothing to commit.
        </n-text>
    </n-space>
    <n-grid :cols="6" :x-gap="12">
        <n-grid-item :span="2">
            <entity-list
                :project-id="projectId"
                :model-url="modelUrl"
                :class-id="classId"
                :class-type="classType"
                :inserted="insertedObjects"
                @entity-select="changeCurrentParameters"
                @entity-insert="storeEntityInsertion"
                @entity-update="storeEntityUpdate"
                @entity-delete="storeEntityDeletion"
            />
        </n-grid-item>
        <n-grid-item :span="2">
            <parameter-table
                :project-id="projectId"
                :model-url="modelUrl"
                :class-id="classId"
                :entity-key="currentEntityKey"
                :diff="pendingModelChanges"
                @open-value-editor-request="setValueEditorData"
                @close-value-editor-request="possiblyClearValueEditor"
                @value-insert="storeValueInsertion"
                @value-update="storeValueUpdate"
                @value-delete="storeValueDeletion"
            />
        </n-grid-item>
        <n-grid-item :span="2">
            <indexed-value-editor
                :value-data="valueEditorData"
                :diff="pendingModelChanges"
                @value-update="storeValueUpdate"
            />
        </n-grid-item>
    </n-grid>
    <n-modal
        :show="showCommitMessageEditor"
        @update:show="updateShowCommitMessageEditor"
    >
        <div>
            <commit-message-editor
                @commit="commit"
                @cancel="showCommitMessageEditor = false"
            />
        </div>
    </n-modal>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {useDialog, useMessage} from "naive-ui";
import CommitMessageEditor from "./CommitMessageEditor";
import * as Communication from "../modules/communication.mjs";
import {EntityDiff} from "../modules/entityDiff.mjs";
import EntityList from "./EntityList.vue";
import ParameterTable from "./ParameterTable.vue";
import IndexedValueEditor from "./IndexedValueEditor.vue";
import PagePath from "./PagePath.vue";

/**
 * Sends database commit data to server.
 * @param {Object} commitData Commit contents.
 * @param (string} message Commit message.
 * @param {number} projectId Project's id.
 * @param {string} modelUrl Model interface URL.
 * @returns {Promise} Promise that resolves to server's response object.
 */
function commit(commitData, message, projectId, modelUlr) {
    const fetchInit = Communication.makeFetchInit();
    fetchInit.body = JSON.stringify({type: "commit", projectId: projectId, message: message, ...commitData});
    return fetch(modelUlr, fetchInit).then(function(response) {
        if (!response.ok) {
            return response.text().then(function(message) {
              throw new Error(message);
            });
        }
        return response.json();
    });
}

export default {
    props: {
        indexUrl: String,
        projectUrl: String,
        projectName: String,
        projectId: Number,
        editUrl: String,
        classId: Number,
        className: String,
        classType: Number,
        classDescription: String,
        modelUrl: String,
    },
    components: {
        "commit-message-editor": CommitMessageEditor,
        "entity-list": EntityList,
        "indexed-value-editor": IndexedValueEditor,
        "page-path": PagePath,
        "parameter-table": ParameterTable,
    },
    setup(props) {
        const currentEntityKey = ref(null);
        const valueEditorData = ref(null);
        const committing = ref(false);
        const showCommitMessageEditor = ref(false);
        const pendingChanges = ref(false);
        const insertedObjects = ref({});
        const pendingModelChanges = new EntityDiff(props.classId);
        const message = useMessage();
        const dialog = useDialog();
        return {
            currentEntityKey: currentEntityKey,
            valueEditorData: valueEditorData,
            committing: committing,
            showCommitMessageEditor: showCommitMessageEditor,
            pendingChanges: pendingChanges,
            insertedObjects: insertedObjects,
            pendingModelChanges: pendingModelChanges,
            changeCurrentParameters(entityKey) {
                if(entityKey === null) {
                    valueEditorData.value = null;
                    currentEntityKey.value = null;
                }
                else if(currentEntityKey.value === null || entityKey.entityId !== currentEntityKey.value.entityId
                        || entityKey.alternativeId !== currentEntityKey.value.alternativeId) {
                    valueEditorData.value = null;
                    currentEntityKey.value = entityKey;
                }
            },
            setValueEditorData(valueData) {
                valueEditorData.value = valueData;
            },
            possiblyClearValueEditor(parameterName) {
                if(valueEditorData.value && valueEditorData.value.parameterName === parameterName) {
                    valueEditorData.value = null;
                }
            },
            storeEntityInsertion(emblem) {
                pendingModelChanges.insertEntity(emblem);
                pendingChanges.value = true;
            },
            storeEntityUpdate(updateData) {
                pendingModelChanges.updateEntity(
                    updateData.previousEmblem, updateData.id, updateData.entityEmblem
                );
                pendingChanges.value = true;
            },
            storeEntityDeletion(entityData) {
                pendingModelChanges.deleteEntity(entityData.id, entityData.entityEmblem);
                pendingChanges.value = pendingModelChanges.isPending();
            },
            storeValueInsertion(valueInfo) {
                pendingModelChanges.insertValue(
                    valueInfo.value, valueInfo.entityEmblem, valueInfo.definitionId, valueInfo.alternativeId
                );
                pendingChanges.value = true;
            },
            storeValueUpdate(valueInfo) {
                pendingModelChanges.updateValue(
                    valueInfo.value,
                    valueInfo.id,
                    valueInfo.entityEmblem,
                    valueInfo.definitionId,
                    valueInfo.alternativeId
                );
                pendingChanges.value = true;
            },
            storeValueDeletion(valueInfo) {
                pendingModelChanges.deleteValue(
                    valueInfo.id, valueInfo.entityEmblem, valueInfo.definitionId, valueInfo.alternativeId
                );
                pendingChanges.value = pendingModelChanges.isPending();
            },
            commit(commitMessage) {
                showCommitMessageEditor.value = false;
                committing.value = true;
                const commitData = pendingModelChanges.makeCommitData();
                commit(commitData, commitMessage, props.projectId, props.modelUrl).then(function(data) {
                    if(data.inserted) {
                        if(data.inserted.object) {
                            insertedObjects.value = data.inserted.object;
                        }
                    }
                    message.success("Commit successful.");
                    pendingChanges.value = false;
                }).catch(function(error) {
                    dialog.error({
                        title: "Commit failure",
                        content: error.message,
                    });
                }).finally(function() {
                    pendingModelChanges.clearPending();
                    committing.value = false;
                });
            },
            updateShowCommitMessageEditor(show) {
                showCommitMessageEditor.value = show;
            }
        };
    },
}
</script>
