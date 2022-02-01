<template>
    <page-path
        :index-url="indexUrl"
        :project-url="projectUrl"
        :project-name="projectName"
        leaf-name="Model editor"
    ></page-path>
    <n-layout>
        <n-layout-header>
            <n-space justify="end">
                <n-button @click="commitSession">Save</n-button>
            </n-space>
        </n-layout-header>
        <n-layout has-sider>
            <n-layout-sider>
                <object-tree
                    :model-url="modelUrl"
                    :project-id="projectId"
                    @object-class-selected="showParametersForObjectClass"
                ></object-tree>
            </n-layout-sider>
            <n-layout-content>
                <parameter-value-table
                    :model-url="modelUrl"
                    :project-id="projectId"
                    :class-id="currentObjectClassId"
                    @value-updated="addUpdatedValue"
                ></parameter-value-table>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script>
import { ref } from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";
import PagePath from "./PagePath.vue";
import EntityTree from "./EntityTree.vue";
import ParameterValueTable from "./ParameterValueTable.vue";
import * as Communication from "../modules/communication.js";

class DatabaseUpdates {
    #valueUpdates
    #committing

    constructor() {
        this.#valueUpdates = new Map();
        this.#committing = false;
    }

    commit(projectId, modelUlr, showMessage) {
        if (this.#committing) {
            alert("Database commit in progress. Please try again later.");
            return;
        }
        this.#committing = true;
        const fetchInit = Communication.makeFetchInit();
        const updates = [];
        for (const [id, value] of this.#valueUpdates) {
            updates.push({id: id, value: value});
        }
        fetchInit["body"] = JSON.stringify({
            type: "update values",
            projectId: projectId,
            updates: updates
        });
        const instance = this;
        fetch(modelUlr, fetchInit).then(function(response) {
            instance.commitFinished();
            if (!response.ok) {
              return response.text().then(function(message) {
                throw new Error(`Failed to save parameter values: ${message}`);
              });
            }
            instance.clearPendingUpdates();
            showMessage.success("Parameter values committed successfully.");
        }).catch(function(error){
            showMessage.error(error.message);
        });
    }

    commitFinished() {
        this.#committing = false;
    }

    clearPendingUpdates() {
        this.#valueUpdates.clear();
    }

    updateValue(id, value) {
        this.#valueUpdates.set(id, value);
    }
}
const updates = new DatabaseUpdates();

export default {
    props: {
        indexUrl: String,
        projectUrl: String,
        projectName: String,
        modelUrl: String,
        projectId: Number
    },
    setup(props) {
        const message = useMessage();
        const currentObjectClassId = ref();
        return {
            currentObjectClassId: currentObjectClassId,
            addUpdatedValue(data) {
                updates.updateValue(data.id, data.value);
            },
            commitSession() {
                updates.commit(props.projectId, props.modelUrl, message);
            },
            showParametersForObjectClass(classId) {
                currentObjectClassId.value = classId;
            }
        }
    },
    components: {
        "page-path": PagePath,
        "object-tree": EntityTree,
        "parameter-value-table": ParameterValueTable
    }
}

</script>
