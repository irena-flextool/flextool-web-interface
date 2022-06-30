<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-space vertical>
            <n-text strong>{{ title }}</n-text>
            <n-list>
                <n-list-item v-for="(table, tableIndex) in tables" :key="tableIndex">
                    <n-text type="info">{{ table.title }}</n-text>
                    <n-table :bordered="false" size="small">
                        <n-thead v-show="table.header !== null">
                            <n-tr>
                                <n-th v-for="(headerColumn, headerIndex) in table.header" :key="headerIndex">
                                    {{ headerColumn }}
                                </n-th>
                            </n-tr>
                        </n-thead>
                        <n-tbody>
                            <n-tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
                                <n-td
                                    v-for="(column, bodyColumnIndex) in row"
                                    :key="bodyColumnIndex"
                                >
                                    {{ column }}
                                </n-td>
                            </n-tr>
                        </n-tbody>
                    </n-table>
                </n-list-item>
            </n-list>
        </n-space>
    </fetchable>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {fetchSummary} from "../modules/communication.mjs";
import {parseSummary} from "../modules/summaries.mjs";
import Fetchable from "./Fetchable.vue";

export default {
    props: {
        projectId: {type: Number, required: true},
        summaryUrl: {type: String, required: true},
    },
    components: {
        "fetchable": Fetchable,
    },
    setup(props) {
        const title = ref("");
        const tables = ref([]);
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        return {
            title: title,
            tables: tables,
            state: state,
            errorMessage: errorMessage,
            loadSummary(scenarioInfo) {
                state.value = Fetchable.state.loading;
                fetchSummary(
                    props.projectId,
                    props.summaryUrl,
                    scenarioInfo.scenarioExecutionId
                ).then(function(data) {
                    const summaryData = data.summary;
                    if(summaryData.length === 0) {
                        return;
                    }
                    const titleRows = summaryData.splice(0, 1);
                    title.value = titleRows[0][0]
                    if(summaryData.length === 0) {
                        return;
                    }
                    tables.value = parseSummary(summaryData);
                }).catch(function(error) {
                    errorMessage.value = error.message;
                    state.value = Fetchable.state.error;
                }).finally(function() {
                    if(state.value === Fetchable.state.loading) {
                        state.value = Fetchable.state.ready;
                    }
                });
            },
        };
    },
}
</script>
