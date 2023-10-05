<template>
  <n-layout has-sider style="height: 100%">
    <n-layout-sider>
      <results-scenario-list
        :project-id="projectId"
        :initial-scenarios="initialScenarios"
        :run-url="runUrl"
        :summary-url="summaryUrl"
        :is-multi-selection="hasScenarioMultiSelection"
        @execution-select="loadResults"
        @execution-remove-request="emitExecutionRemoveRequest"
        ref="scenarioList"
      />
    </n-layout-sider>
    <n-layout-content>
      <n-tabs
        type="card"
        v-model:value="currentTab"
        closable
        addable
        @close="closeTab"
        @add="addTab"
        @update:value="refreshPlotsOnTab"
        style="height: 100%"
        pane-style="overflow: auto; width: calc(100% - var(--n-pane-padding-top));"
      >
        <n-tab-pane
          v-if="hasSummary"
          :closable="false"
          name="Summary"
          display-directive="show:lazy"
        >
          <results-summary
            :project-id="projectId"
            :summary-url="summaryUrl"
            @ready="loadSummary"
            ref="summary"
          />
          <template #tab>
            <n-icon class="tab-icon"><icon-table /></n-icon>
            Summary
          </template>
        </n-tab-pane>
        <n-tab-pane :closable="false" name="Default plots" display-directive="show:lazy">
          <results-figures
            :plot-category="plotCategory"
            :is-custom="false"
            name="default-plots"
            :project-id="projectId"
            :analysis-url="analysisUrl"
            @ready="setDefaultFiguresScenario"
            ref="defaultFigures"
          />
          <template #tab>
            <n-icon class="tab-icon"><icon-chart-area /></n-icon>
            Default plots
          </template>
        </n-tab-pane>
        <n-tab-pane
          v-for="tab in customPlotTabs"
          :name="tab"
          :key="tab"
          display-directive="show:lazy"
        >
          <results-figures
            :plot-category="plotCategory"
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
import ResultsFigures from './ResultsFigures.vue'
import ResultsScenarioList from './ResultsScenarioList.vue'
import ResultsSummary from './ResultsSummary.vue'

const customPlotPrefix = 'Custom plots'
const customPlotNameRegExp = /^Custom plots [0-9]+$/

export default {
  props: {
    projectName: { type: String, required: true },
    projectId: { type: Number, required: true },
    initialScenarios: { type: Array, required: true },
    analysisUrl: { type: String, required: true },
    runUrl: { type: String, required: true },
    summaryUrl: { type: String, required: true },
    plotCategory: { type: String, required: true }
  },
  emits: ['executionRemoveRequest'],
  components: {
    'editable-text': EditableText,
    'icon-chart-area': ChartArea,
    'icon-table': Table,
    'results-figures': ResultsFigures,
    'results-scenario-list': ResultsScenarioList,
    'results-summary': ResultsSummary
  },
  setup(props, context) {
    const hasSummary = props.plotCategory === 'single'
    const currentTab = ref(hasSummary ? 'Summary' : 'Default plots')
    const customPlotTabs = ref([])
    const summary = ref(null)
    const defaultFigures = ref(null)
    const customFigures = ref([])
    const scenarioList = ref(null)
    const message = useMessage()
    let currentExecutionIds = []
    const hasScenarioMultiSelection = props.plotCategory === 'multiple'
    const setDefaultFiguresScenario = function () {
      defaultFigures.value.setScenarioExecutionIds(currentExecutionIds)
    }
    const setCustomFiguresScenario = function (tabName) {
      for (const figures of customFigures.value) {
        if (figures.componentName() === tabName) {
          figures.setScenarioExecutionIds(currentExecutionIds)
          return
        }
      }
      throw new Error(`Cannot find tab '${tabName}'`)
    }
    const loadSummary = function () {
      if (currentExecutionIds.length === 0) {
        summary.value.loadSummary(null)
      } else {
        summary.value.loadSummary(currentExecutionIds[0])
      }
    }
    onMounted(function () {
      fetchCustomPlotSpecificationNames(
        props.projectId,
        props.analysisUrl,
        props.plotCategory
      ).then(function (data) {
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
      loadSummary,
      scenarioList,
      hasSummary,
      hasScenarioMultiSelection,
      loadResults(executionIds) {
        currentExecutionIds = executionIds
        if (summary.value !== null) {
          loadSummary()
        }
        if (defaultFigures.value !== null) {
          defaultFigures.value.setScenarioExecutionIds(currentExecutionIds)
        }
        for (const figures of customFigures.value) {
          figures.setScenarioExecutionIds(currentExecutionIds)
        }
      },
      emitExecutionRemoveRequest(executionId) {
        context.emit('executionRemoveRequest', executionId)
      },
      setExecutionBusy(executionKey, busy) {
        if (scenarioList.value === null) {
          return
        }
        scenarioList.value.setExecutionBusy(executionKey, busy)
      },
      removeExecution(executionKey) {
        if (scenarioList.value === null) {
          return
        }
        scenarioList.value.removeExecution(executionKey)
      },
      setDefaultFiguresScenario,
      setCustomFiguresScenario,
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
          props.plotCategory,
          emptyPlotSpecification
        ).then(function () {
          customPlotTabs.value.push(tabName)
          currentTab.value = tabName
        })
      },
      closeTab(name) {
        for (const [index, tab] of customPlotTabs.value.entries()) {
          if (tab === name) {
            removeCustomPlotSpecification(
              props.projectId,
              props.analysisUrl,
              name,
              props.plotCategory
            ).then(function () {
              customPlotTabs.value.splice(index, 1)
            })
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
              props.plotCategory,
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
      },
      refreshPlotsOnTab(tabName) {
        if (tabName === 'Summary') {
          return
        }
        if (tabName === 'Default plots' && defaultFigures.value !== null) {
          defaultFigures.value.notifyActivated()
        } else {
          const figures = customFigures.value.find((f) => f.componentName() === tabName)
          if (figures !== undefined) {
            figures.notifyActivated()
          }
        }
      }
    }
  }
}
</script>
