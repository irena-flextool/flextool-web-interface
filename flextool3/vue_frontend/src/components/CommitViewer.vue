<template>
    <n-data-table v-if="!errorMessage"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-keys="rowKeys"
        size="small"
    />
    <n-result v-else
        status="error"
        title="Error"
        :description="errorMessage"
    />
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import * as Communication from "../modules/communication.mjs";

function makeColumns() {
    const dateColumn = {
        title: "Date",
        key: "date"
    };
    const messageColumn = {
        title: "Message",
        key: "comment"
    };
    const userColumn = {
        title: "User",
        key: "user"
    };
    return [dateColumn, messageColumn, userColumn];
}

export default {
    props: {
        projectId: Number,
        modelUrl: String,
    },
    setup(props) {
        const columns = ref(makeColumns());
        const data = ref([]);
        const loading = ref(true);
        const errorMessage = ref("");
        onMounted(function() {
            Communication.fetchModelData("commits?", props.projectId, props.modelUrl).then(function(response) {
                data.value = response.commits;
            }).catch(function(error) {
                errorMessage.value = error.message;
            }).finally(function() {
                loading.value = false;
            });
        });
        return {
            columns: columns,
            data: data,
            loading: loading,
            errorMessage: errorMessage,
            rowKeys(rowData) {
                return rowData.id;
            },
        };
    }
}
</script>
