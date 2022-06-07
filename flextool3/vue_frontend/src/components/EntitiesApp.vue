<template>
    <page
        name="Edit model"
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
                :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}, {name: 'Model', url: editUrl}]"
                :leaf-name="className"
            />
        </template>
        <commit-button
            :has-pending-changes="pendingChanges"
            :committing="committing"
            :error-message="commitErrorMessage"
            @commitRequest="commit"
        />
        <n-h1>{{ className }}</n-h1>
        <n-p v-show="classDescription !== 'None'">{{ classDescription }}</n-p>
        <n-grid :cols="6" :x-gap="12">
            <n-grid-item :span="2">
                <entity-list
                    :project-id="projectId"
                    :model-url="modelUrl"
                    :class-id="classId"
                    :class-name="className"
                    :class-type="classType"
                    :inserted="insertedEntities"
                    @entity-select="changeCurrentParameters"
                    @entity-insert="storeEntityInsertion"
                    @entity-update="storeEntityUpdate"
                    @entity-delete="storeEntityDeletion"
                    @relationships-clash="setRelationshipsClashErrorState"
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
    </page>
</template>

<script>
import {ref, watch} from "vue/dist/vue.esm-bundler.js";
import {useDialog, useMessage} from "naive-ui";
import * as Communication from "../modules/communication.mjs";
import {EntityDiff} from "../modules/entityDiff.mjs";
import {uncommittedChangesWatcher} from "../modules/eventListeners.mjs";
import CommitButton from "./CommitButton.vue"
import EntityList from "./EntityList.vue";
import ParameterTable from "./ParameterTable.vue";
import IndexedValueEditor from "./IndexedValueEditor.vue";
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";

export default {
    props: {
        indexUrl: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectId: {type: Number, required: true},
        editUrl: {type: String, required: true},
        runUrl: {type: String, required: true},
        resultsUrl: {type: String, required: true},
        classId: {type: Number, required: true},
        className: {type: String, required: true},
        classType: {type: Number, required: true},
        classDescription: {type: String, required: true},
        modelUrl: {type: String, required: true},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "commit-button": CommitButton,
        "entity-list": EntityList,
        "indexed-value-editor": IndexedValueEditor,
        "page": Page,
        "page-path": PagePath,
        "parameter-table": ParameterTable,
    },
    setup(props) {
        const currentEntityKey = ref(null);
        const valueEditorData = ref(null);
        const committing = ref(false);
        const commitErrorMessage = ref("");
        const pendingChanges = ref(false);
        const insertedEntities = ref({});
        const pendingModelChanges = new EntityDiff(props.classId, props.className);
        const message = useMessage();
        const dialog = useDialog();
        watch(pendingChanges, uncommittedChangesWatcher);
        return {
            currentEntityKey: currentEntityKey,
            valueEditorData: valueEditorData,
            committing: committing,
            commitErrorMessage: commitErrorMessage,
            pendingChanges: pendingChanges,
            insertedEntities: insertedEntities,
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
            commit() {
                committing.value = true;
                const commitData = pendingModelChanges.makeCommitData();
                Communication.commit(
                    commitData,
                    "Modified entities.",
                    props.projectId,
                    props.modelUrl
                ).then(function(data) {
                    if(data.inserted) {
                        if(data.inserted.object) {
                            insertedEntities.value = data.inserted.object;
                        }
                        else if(data.inserted.relationship) {
                            insertedEntities.value = data.inserted.relationship;
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
            setRelationshipsClashErrorState(clash) {
                if(clash) {
                    commitErrorMessage.value = "Cannot commit: some relationships have the same objects.";
                }
                else {
                    commitErrorMessage.value = "";
                }
            },
        };
    },
}
</script>
