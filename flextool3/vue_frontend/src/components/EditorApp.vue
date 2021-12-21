<template>
    <n-button @click="commitSession">Save</n-button>
    <parameter-value-table :model-url="modelUrl" :project-id="projectId" @value-updated="addUpdatedValue"></parameter-value-table>
</template>

<script>
import {useMessage} from "naive-ui";
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
              alert("Updating parameter values failed: server reported a bad request.");
              return;
            }
            instance.clearPendingUpdates();
            showMessage.success("Parameter values committed successfully.");
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
        modelUrl: String,
        projectId: Number
    },
    setup(props) {
        const message = useMessage();
        return {
            addUpdatedValue(data) {
                updates.updateValue(data.id, data.value);
            },
            commitSession() {
                updates.commit(props.projectId, props.modelUrl, message);
            }
        }
    },
    components: {
        "parameter-value-table": ParameterValueTable
    }
}

</script>
