<template>
    <page
        name="Results"
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
                :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
                leaf-name="Results"
            />
        </template>
        <n-layout id="main-layout" has-sider position="absolute">
            <n-layout-sider>
                <results-scenario-list
                    :project-id="projectId"
                    :run-url="runUrl"
                    :summary-url="summaryUrl"
                    @scenarioSelect="loadResults"
                    ref="scenarioList"
                />
            </n-layout-sider>
            <n-layout-content content-style="margin-left: 1em; margin-right: 1em">
                <results-summary
                    :project-id="projectId"
                    :summary-url="summaryUrl"
                    ref="summary"
                />
                <results-output-directory
                    :project-id="projectId"
                    :summary-url="summaryUrl"
                    ref="outputDirectory"
                />
                <results-figures
                    :project-id="projectId"
                    :analysis-url="analysisUrl"
                    :summary-url="summaryUrl"
                    @busy="updateBusyStatus"
                    ref="figures"
                />
            </n-layout-content>
        </n-layout>
    </page>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";
import ResultsFigures from "./ResultsFigures.vue";
import ResultsScenarioList from "./ResultsScenarioList.vue";
import ResultsSummary from "./ResultsSummary.vue";
import ResultsOutputDirectory from "./ResultsOutputDirectory.vue";

export default {
    props: {
        indexUrl: {type: String, required: true},
        editUrl: {type: String, required: true},
        projectName: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectId: {type: Number, required:true},
        runUrl: {type: String, required: true},
        resultsUrl: {type: String, required: true},
        analysisUrl: {type: String, required: true},
        summaryUrl: {type: String, required: true},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "page": Page,
        "page-path": PagePath,
        "results-figures": ResultsFigures,
        "results-scenario-list": ResultsScenarioList,
        "results-summary": ResultsSummary,
        "results-output-directory": ResultsOutputDirectory,
    },
    setup() {
        const scenarioList = ref(null);
        const summary = ref(null);
        const outputDirectory = ref(null);
        const figures = ref(null);
        let busyness = 0;
        return {
            summary: summary,
            outputDirectory: outputDirectory,
            figures: figures,
            scenarioList: scenarioList,
            loadResults(scenarioInfo) {
                summary.value.loadSummary(scenarioInfo);
                outputDirectory.value.loadDirectory(scenarioInfo);
                figures.value.loadData(scenarioInfo);
            },
            updateBusyStatus(busy) {
                const old = busyness;
                busyness += busy ? 1 : -1;
                if(old > 0 && busyness > 0) {
                    return;
                }
                scenarioList.value.setSelectedBusy(busyness > 0);
            },
        };
    },
};
</script>

<style>
#main-layout {
    top: 100px;
    margin-left: 1em;
}
</style>
