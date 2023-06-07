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
        :path="[
          { name: 'Projects', url: indexUrl },
          { name: projectName, url: projectUrl }
        ]"
        leaf-name="Results"
      />
    </template>
    <n-layout id="main-layout" has-sider position="absolute">
      <n-layout-sider>
        <results-scenario-list
          :project-id="projectId"
          :run-url="runUrl"
          :summary-url="summaryUrl"
          :is-multi-selection="multiSelectScenarios"
          @scenario-select="loadResults"
          ref="scenarioList"
        />
      </n-layout-sider>
      <n-layout-content content-style="margin-left: 1em; margin-right: 1em">
        <n-tabs @update:value="setScenarioSelectionToSingleOrMulti">
          <n-tab-pane name="Summary" display-directive="show:lazy">
            <results-summary
              :project-id="projectId"
              :summary-url="summaryUrl"
              @ready="loadSummary"
              ref="summary"
            />
          </n-tab-pane>
          <n-tab-pane name="Plotting" display-directive="show:lazy">
            <results-figures
              :project-id="projectId"
              :analysis-url="analysisUrl"
              @ready="setFiguresScenario"
              ref="figures"
            />
          </n-tab-pane>
        </n-tabs>
      </n-layout-content>
    </n-layout>
  </page>
</template>

<script>
import { ref } from 'vue/dist/vue.esm-bundler.js'
import Page from './Page.vue'
import PagePath from './PagePath.vue'
import ResultsFigures from './ResultsFigures.vue'
import ResultsScenarioList from './ResultsScenarioList.vue'
import ResultsSummary from './ResultsSummary.vue'

export default {
  props: {
    indexUrl: { type: String, required: true },
    editUrl: { type: String, required: true },
    projectName: { type: String, required: true },
    projectUrl: { type: String, required: true },
    projectId: { type: Number, required: true },
    runUrl: { type: String, required: true },
    resultsUrl: { type: String, required: true },
    analysisUrl: { type: String, required: true },
    summaryUrl: { type: String, required: true },
    logoutUrl: { type: String, required: true },
    logoUrl: { type: String, required: true }
  },
  components: {
    page: Page,
    'page-path': PagePath,
    'results-figures': ResultsFigures,
    'results-scenario-list': ResultsScenarioList,
    'results-summary': ResultsSummary
  },
  setup() {
    const scenarioList = ref(null)
    const summary = ref(null)
    const outputDirectory = ref(null)
    const figures = ref(null)
    const multiSelectScenarios = ref(false)
    let currentScenarioInfoList = []
    const loadSummary = function () {
      if (currentScenarioInfoList.length === 0) {
        return
      }
      summary.value.loadSummary(currentScenarioInfoList[0])
    }
    const setFiguresScenario = function () {
      const scenarioExecutionIds = []
      for (const scenarioInfo of currentScenarioInfoList) {
        scenarioExecutionIds.push(scenarioInfo.scenarioExecutionId)
      }
      figures.value.setScenarioExecutionIds(scenarioExecutionIds)
    }
    const loadOutputDirectory = function () {
      if (currentScenarioInfoList.length === 0) {
        return
      }
      outputDirectory.value.loadDirectory(currentScenarioInfoList[0])
    }
    return {
      summary: summary,
      outputDirectory: outputDirectory,
      figures: figures,
      scenarioList: scenarioList,
      multiSelectScenarios: multiSelectScenarios,
      loadResults(scenarioInfoList) {
        currentScenarioInfoList = scenarioInfoList
        if (summary.value !== null) {
          loadSummary()
        }
        if (outputDirectory.value !== null) {
          loadOutputDirectory()
        }
        if (figures.value !== null) {
          setFiguresScenario()
        }
      },
      loadSummary: loadSummary,
      setFiguresScenario: setFiguresScenario,
      loadOutputDirectory: loadOutputDirectory,
      setScenarioSelectionToSingleOrMulti(tabName) {
        multiSelectScenarios.value = tabName === 'Plotting'
      }
    }
  }
}
</script>

<style>
#main-layout {
  top: 100px;
  margin-left: 1em;
}
</style>
