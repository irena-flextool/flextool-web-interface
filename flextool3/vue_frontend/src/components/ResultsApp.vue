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
                <n-tabs
                    @update:value="loadTabContentsOnDemand"
                >
                    <n-tab-pane name="Summary" display-directive="show:lazy">
                        <results-summary
                            :project-id="projectId"
                            :summary-url="summaryUrl"
                            @ready="loadSummary"
                            ref="summary"
                        />
                    </n-tab-pane>
                    <n-tab-pane name="Plots and tables" display-directive="show:lazy">
                        <results-figures
                            :project-id="projectId"
                            :analysis-url="analysisUrl"
                            :summary-url="summaryUrl"
                            @busy="updateBusyStatus"
                            @ready="loadFigures"
                            ref="figures"
                        />
                    </n-tab-pane>
                    <n-tab-pane name="CSV files" display-directive="show:lazy">
                        <results-output-directory
                            :project-id="projectId"
                            :summary-url="summaryUrl"
                            @ready="loadOutputDirectory"
                            ref="outputDirectory"
                        />
                    </n-tab-pane>
                </n-tabs>
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
        let currentScenarioInfo = null;
        return {
            summary: summary,
            outputDirectory: outputDirectory,
            figures: figures,
            scenarioList: scenarioList,
            loadResults(scenarioInfo) {
                currentScenarioInfo = scenarioInfo;
                if(summary.value !== null) {
                    summary.value.loadSummary(scenarioInfo);
                }
                if(outputDirectory.value !== null) {
                    outputDirectory.value.loadDirectory(scenarioInfo);
                }
                if(figures.value !== null) {
                    figures.value.loadData(scenarioInfo);
                }
            },
            updateBusyStatus(busy) {
                const old = busyness;
                busyness += busy ? 1 : -1;
                if(old > 0 && busyness > 0) {
                    return;
                }
                scenarioList.value.setSelectedBusy(busyness > 0);
            },
            loadSummary() {
                if(currentScenarioInfo === null) {
                    return;
                }
                summary.value.loadSummary(currentScenarioInfo);
            },
            loadFigures() {
                if(currentScenarioInfo === null) {
                    return;
                }
                figures.value.loadData(currentScenarioInfo);
            },
            loadOutputDirectory() {
                if(currentScenarioInfo === null) {
                    return;
                }
                outputDirectory.value.loadDirectory(currentScenarioInfo);
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
