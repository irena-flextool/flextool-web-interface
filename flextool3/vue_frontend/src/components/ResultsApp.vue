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
    <fetchable :state="state" :error-message="errorMessage">
      <n-tabs type="card" placement="left" style="height: 100%">
        <n-tab-pane name="Investigate single" display-directive="show">
          <results-tab
            plot-category="single"
            :project-name="projectName"
            :project-id="projectId"
            :initialScenarios="scenarios"
            :analysis-url="analysisUrl"
            :run-url="runUrl"
            :summary-url="summaryUrl"
            @execution-remove-request="removeExecution"
            ref="investigationTab"
          />
        </n-tab-pane>
        <n-tab-pane name="Compare multiple" display-directive="show">
          <results-tab
            plot-category="multiple"
            :project-name="projectName"
            :project-id="projectId"
            :initialScenarios="scenarios"
            :analysis-url="analysisUrl"
            :run-url="runUrl"
            :summary-url="summaryUrl"
            @execution-remove-request="removeExecution"
            ref="comparisonTab"
          />
        </n-tab-pane>
      </n-tabs>
    </fetchable>
  </page>
</template>

<script>
import { ref, onMounted } from 'vue/dist/vue.esm-bundler.js'
import { useMessage } from 'naive-ui'
import { destroyScenarioExecution, fetchExecutedScenarioList } from '../modules/communication.mjs'
import { timeFormat } from '../modules/scenarios.mjs'
import Fetchable from './Fetchable.vue'
import Page from './Page.vue'
import PagePath from './PagePath.vue'
import ResultsTab from './ResultsTab.vue'

/**
 * Deletes scenario execution.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl Summary interface URL.
 * @param {number} id Scenario execution id.
 * @param {object[]} scenarios Array of scenarios.
 * @callback setExecutionBusy Callable to set widgets connected to execution busy.
 * @callback executionRemoved Callable to call after execution has been removed.
 * @param {object} message Message API.
 */
function destroyExecution(
  projectId,
  summaryUrl,
  id,
  scenarios,
  setExecutionBusy,
  executionRemoved,
  message
) {
  setExecutionBusy(id, true)
  destroyScenarioExecution(projectId, summaryUrl, id)
    .then(function () {
      for (const [scenarioIndex, scenario] of scenarios.entries()) {
        const executionIndex = scenario.executions.findIndex((e) => e.key === id)
        if (executionIndex === -1) {
          continue
        }
        scenario.executions.splice(executionIndex, 1)
        if (scenario.executions.lenght === 0) {
          scenarios.splice(scenarioIndex, 1)
        }
        executionRemoved(id)
        return
      }
      throw Error(`Couldn't find execution with id ${id}.`)
    })
    .catch(function (error) {
      message.error(error.message)
      setExecutionBusy(id, false)
    })
}

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
    fetchable: Fetchable,
    page: Page,
    'page-path': PagePath,
    'results-tab': ResultsTab
  },
  setup(props) {
    const state = ref(Fetchable.state.loading)
    const errorMessage = ref('')
    const investigationTab = ref(null)
    const comparisonTab = ref(null)
    const scenarios = []
    const message = useMessage()
    function setExecutionBusyInTabs(executionId, busy) {
      for (const tab of [investigationTab.value, comparisonTab.value]) {
        if (tab !== null) {
          tab.setExecutionBusy(executionId, busy)
        }
      }
    }
    function removeExecutionFromTabs(executionId) {
      for (const tab of [investigationTab.value, comparisonTab.value]) {
        if (tab !== null) {
          tab.removeExecution(executionId)
        }
      }
    }
    onMounted(function () {
      fetchExecutedScenarioList(props.projectId, props.summaryUrl)
        .then(function (response) {
          for (const scenarioName in response.scenarios) {
            const scenarioInfoList = []
            for (const executionInfo of response.scenarios[scenarioName]) {
              scenarioInfoList.push({
                timeStamp: new Date(executionInfo.time_stamp),
                scenarioExecutionId: executionInfo.scenario_execution_id
              })
            }
            const executions = []
            for (let i = 0; i < scenarioInfoList.length; ++i) {
              const scenarioInfo = scenarioInfoList[i]
              const timeString = timeFormat.format(scenarioInfo.timeStamp)
              const label = i == 0 ? timeString.concat(' (latest)') : timeString
              executions.push({
                label: label,
                key: scenarioInfo.scenarioExecutionId
              })
            }
            const scenario = {
              name: scenarioName,
              executions: executions
            }
            scenarios.push(scenario)
          }
          state.value = Fetchable.state.ready
        })
        .catch(function (error) {
          errorMessage.value = error.message
          state.value = Fetchable.state.error
        })
    })
    return {
      state,
      errorMessage,
      scenarios,
      investigationTab,
      comparisonTab,
      removeExecution(executionId) {
        destroyExecution(
          props.projectId,
          props.summaryUrl,
          executionId,
          scenarios,
          setExecutionBusyInTabs,
          removeExecutionFromTabs,
          message
        )
      }
    }
  }
}
</script>

<style>
.tab-icon {
  margin-right: 10px;
}
</style>
