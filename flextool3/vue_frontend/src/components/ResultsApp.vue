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
        <n-tabs
          type="card"
          v-model:value="currentTab"
          closable
          addable
          @update:value="setScenarioSelectionToSingleOrMulti"
          @close="closeTab"
          @add="addTab"
        >
          <n-tab-pane :closable="false" name="Summary" display-directive="show:lazy">
            <results-summary
              :project-id="projectId"
              :summary-url="summaryUrl"
              @ready="loadSummary"
              ref="summary"
            />
            <template #tab>
              <n-space size="small">
                <n-icon><icon-table /></n-icon>
                Summary
              </n-space>
            </template>
          </n-tab-pane>
          <n-tab-pane :closable="false" name="Default plots" display-directive="show:lazy">
            <results-figures
              :is-custom="false"
              name="default-plots"
              :project-id="projectId"
              :analysis-url="analysisUrl"
              @ready="setDefaultFiguresScenario"
              ref="defaultFigures"
            />
            <template #tab>
              <n-space size="small">
                <n-icon><icon-chart-area /></n-icon>
                Default plots
              </n-space>
            </template>
          </n-tab-pane>
          <n-tab-pane
            v-for="tab in customPlotTabs"
            :name="tab"
            :key="tab"
            display-directive="show:lazy"
          >
            <results-figures
              :is-custom="true"
              :name="tab"
              :project-id="projectId"
              :analysis-url="analysisUrl"
              @ready="setCustomFiguresScenario"
              ref="customFigures"
            />
            <template #tab>
              <editable-text :text="tab" @edited="renameTab"></editable-text>
            </template>
          </n-tab-pane>
        </n-tabs>
      </n-layout-content>
    </n-layout>
  </page>
</template>

<script>
import { ref, onMounted } from 'vue/dist/vue.esm-bundler.js'
import { useMessage } from 'naive-ui'
import { ChartArea, Table } from '@vicons/fa'
import {
  fetchCustomPlotSpecificationNames,
  storeCustomPlotSpecification,
  removeCustomPlotSpecification,
  renameCustomPlotSpecification
} from '../modules/communication.mjs'
import { makeEmptyPlotSpecification } from '../modules/plots.mjs'
import EditableText from './EditableText.vue'
import Page from './Page.vue'
import PagePath from './PagePath.vue'
import ResultsFigures from './ResultsFigures.vue'
import ResultsScenarioList from './ResultsScenarioList.vue'
import ResultsSummary from './ResultsSummary.vue'

const customPlotPrefix = 'Custom plots'
const customPlotNameRegExp = /^Custom plots [0-9]+$/

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
    'editable-text': EditableText,
    'icon-chart-area': ChartArea,
    'icon-table': Table,
    page: Page,
    'page-path': PagePath,
    'results-figures': ResultsFigures,
    'results-scenario-list': ResultsScenarioList,
    'results-summary': ResultsSummary
  },
  setup(props) {
    const currentTab = ref('Summary')
    const customPlotTabs = ref([])
    const scenarioList = ref(null)
    const summary = ref(null)
    const defaultFigures = ref(null)
    const customFigures = ref([])
    const multiSelectScenarios = ref(false)
    const message = useMessage()
    let currentScenarioInfoList = []
    const loadSummary = function () {
      if (currentScenarioInfoList.length === 0) {
        summary.value.loadSummary(null)
      } else {
        summary.value.loadSummary(currentScenarioInfoList[0])
      }
    }
    const setDefaultFiguresScenario = function () {
      const scenarioExecutionIds = []
      for (const scenarioInfo of currentScenarioInfoList) {
        scenarioExecutionIds.push(scenarioInfo.scenarioExecutionId)
      }
      defaultFigures.value.setScenarioExecutionIds(scenarioExecutionIds)
    }
    const setCustomFiguresScenario = function (tabName) {
      for (const figures of customFigures.value) {
        if (figures.componentName() === tabName) {
          const scenarioExecutionIds = []
          for (const scenarioInfo of currentScenarioInfoList) {
            scenarioExecutionIds.push(scenarioInfo.scenarioExecutionId)
          }
          figures.setScenarioExecutionIds(scenarioExecutionIds)
          return
        }
      }
      throw new Error(`Cannot find tab '${tabName}'`)
    }
    onMounted(function () {
      fetchCustomPlotSpecificationNames(props.projectId, props.analysisUrl).then(function (data) {
        const names = data.names
        for (const name of names) {
          customPlotTabs.value.push(name)
        }
      })
    })
    return {
      currentTab,
      customPlotTabs,
      summary,
      defaultFigures,
      customFigures,
      scenarioList,
      multiSelectScenarios,
      loadResults(scenarioInfoList) {
        currentScenarioInfoList = scenarioInfoList
        if (summary.value !== null) {
          loadSummary()
        }
        const scenarioExecutionIds = []
        for (const scenarioInfo of currentScenarioInfoList) {
          scenarioExecutionIds.push(scenarioInfo.scenarioExecutionId)
        }
        if (defaultFigures.value !== null) {
          defaultFigures.value.setScenarioExecutionIds(scenarioExecutionIds)
        }
        for (const figures of customFigures.value) {
          figures.setScenarioExecutionIds(scenarioExecutionIds)
        }
      },
      loadSummary: loadSummary,
      setDefaultFiguresScenario,
      setCustomFiguresScenario,
      setScenarioSelectionToSingleOrMulti(tabName) {
        multiSelectScenarios.value = tabName !== 'Summary'
      },
      addTab() {
        const numbers = []
        for (const tab of customPlotTabs.value) {
          if (customPlotNameRegExp.test(tab)) {
            const number = tab.slice(tab.lastIndexOf(' ') + 1)
            numbers.push(parseInt(number))
          }
        }
        const index = numbers.length === 0 ? 1 : Math.max(...numbers) + 1
        const tabName = `${customPlotPrefix} ${index}`
        const emptyPlotSpecification = { plots: [makeEmptyPlotSpecification()] }
        storeCustomPlotSpecification(
          props.projectId,
          props.analysisUrl,
          tabName,
          emptyPlotSpecification
        ).then(function () {
          customPlotTabs.value.push(tabName)
          currentTab.value = tabName
        })
      },
      closeTab(name) {
        for (const [index, tab] of customPlotTabs.value.entries()) {
          if (tab === name) {
            removeCustomPlotSpecification(props.projectId, props.analysisUrl, name).then(
              function () {
                customPlotTabs.value.splice(index, 1)
              }
            )
            return
          }
        }
        throw new Error(`Logic error: tab '${name}' not found`)
      },
      renameTab(renameData) {
        if (renameData.new === 'Summary' || renameData.new === 'Default plots') {
          message.error('Cannot rename tab: name already in use.')
          return
        }
        for (const tab of customPlotTabs.value) {
          if (renameData.new === tab) {
            message.error('Cannot rename tab: name already in use.')
            return
          }
        }
        for (const [i, tab] of customPlotTabs.value.entries()) {
          if (renameData.old === tab) {
            renameCustomPlotSpecification(
              props.projectId,
              props.analysisUrl,
              renameData.old,
              renameData.new
            ).then(function () {
              const wasSelected = tab === currentTab.value
              customPlotTabs.value[i] = renameData.new
              if (wasSelected) {
                currentTab.value = renameData.new
              }
            })
            return
          }
        }
        throw new Error(`Couldn't find tab '${renameData.old}' for renaming`)
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
