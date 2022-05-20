<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-space vertical>
            <n-text strong>{{ title }}</n-text>
            <n-list>
                <n-list-item v-for="(summary, index) in summaries" :key="index">
                    <n-text type="info">Solve {{ summary.solve }}</n-text>
                    <n-table :bordered="false" size="small">
                        <n-tbody>
                            <n-tr v-for="(parameter, index) in summary.solveParameters" :key="index">
                                <n-th>{{ parameter.name }}</n-th>
                                <n-th>{{ parameter.value }}</n-th>
                                <n-th>{{ parameter.description }}</n-th>
                            </n-tr>
                        </n-tbody>
                    </n-table>
                    <n-text type="info">Emissions</n-text>
                    <n-table :bordered="false" size="small">
                        <n-tbody>
                            <n-tr v-for="(parameter, index) in summary.emissionsParameters" :key="index">
                                <n-th>{{ parameter.name }}</n-th>
                                <n-th>{{ parameter.value }}</n-th>
                                <n-th>{{ parameter.description }}</n-th>
                            </n-tr>
                        </n-tbody>
                    </n-table>
                    <n-text type="info">{{ summary.issueTitle }}</n-text>
                    <n-table :bordered="false" size="small">
                        <n-tbody>
                            <n-tr v-for="(issue, index) in summary.issues" :key="index">
                                <n-th>{{ issue.type }}</n-th>
                                <n-th>{{ issue.node }}</n-th>
                                <n-th>{{ issue.solve }}</n-th>
                                <n-th>{{ issue.value }}</n-th>
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
import {parseSummaries} from "../modules/summaries.mjs";
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
        const summaries = ref([]);
        const state = ref(Fetchable.state.waiting);
        const errorMessage = ref("");
        return {
            title: title,
            summaries: summaries,
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
                    const titleRows = summaryData.splice(0, 2);
                    title.value = titleRows[0][0]
                    if(summaryData.length === 0) {
                        return;
                    }
                    summaries.value = parseSummaries(summaryData);
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
