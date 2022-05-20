<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Results"
    />
    <n-layout has-sider style="height: 100vh">
        <n-layout-sider>
            <results-scenario-list
                :project-id="projectId"
                :run-url="runUrl"
                :summary-url="summaryUrl"
                @scenarioSelect="loadResults"
            />
        </n-layout-sider>
        <n-layout-content>
            <results-summary
                :project-id="projectId"
                :summary-url="summaryUrl"
                ref="summary"
            />
            <results-plots
                :project-id="projectId"
                :analysis-url="analysisUrl"
                :summary-url="summaryUrl"
                ref="plots"
            />
        </n-layout-content>
    </n-layout>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import PagePath from "./PagePath.vue";
import ResultsPlots from "./ResultsPlots.vue";
import ResultsScenarioList from "./ResultsScenarioList.vue";
import ResultsSummary from "./ResultsSummary.vue";

export default {
    props: {
        indexUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectId: {type: Number, required:true},
        runUrl: {type: String, required: true},
        analysisUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
    },
    components: {
        "page-path": PagePath,
        "results-plots": ResultsPlots,
        "results-scenario-list": ResultsScenarioList,
        "results-summary": ResultsSummary,
    },
    setup() {
        const summary = ref(null);
        const plots = ref(null);
        return {
            summary: summary,
            plots: plots,
            loadResults(scenarioInfo) {
                summary.value.loadSummary(scenarioInfo);
                plots.value.loadPlots(scenarioInfo);
            },
        };
    },
};
</script>
