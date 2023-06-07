<template>
  <fetchable :state="state" :error-message="errorMessage">
    <n-space vertical>
      <n-space>
        <n-button @click="download" size="small"> Download CSV </n-button>
      </n-space>
      <div v-if="showGraph" :id="plotId" :style="plotDivStyle" />
      <plot-table v-else-if="showTable" :data-frame="currentDataFrame" />
      <n-empty v-else description="Nothing to plot."></n-empty>
    </n-space>
  </fetchable>
</template>

<script>
import { computed, nextTick, onMounted, ref, toRef, watch } from 'vue/dist/vue.esm-bundler.js'
import Plotly from 'plotly.js-cartesian-dist-min'
import { DataFrame } from 'data-forge'
import { downloadAsCsv } from '../modules/figures.mjs'
import { fetchResultParameterValues } from '../modules/communication.mjs'
import { objectify } from '../modules/parameterValues.mjs'
import { filterDeselectedIndexNames, makeBasicChart, makeHeatmapChart } from '../modules/plots.mjs'
import { timeFormat } from '../modules/scenarios.mjs'
import {
  entityClassKey,
  entityKey,
  isEntityKey,
  parameterKey,
  scenarioKey,
  valueIndexKeyPrefix
} from '../modules/plotEditors.mjs'
import Fetchable from './Fetchable.vue'
import PlotTable from './PlotTable.vue'

const emptyPlotMinHeight = 0
const plotMinHeightStep = 600

/**
 * Computes minimum height for the plot div element.
 * @param {number} subplotCount Number of subplots.
 * @returns {number} Minimum height in pixels.
 */
function plotMinHeight(subplotCount) {
  if (subplotCount === 0) {
    return emptyPlotMinHeight
  } else {
    return subplotCount > 1 ? subplotCount * plotMinHeightStep : plotMinHeightStep
  }
}

/**
 * Changes plot type.
 * @param {DataFrame} dataFrame Data frame to plot.
 * @param {object} plotSpecification Plot specification.
 * @param {string} plotId Plot div element id.
 * @param {Ref} plotDivStyle Plot div element.
 */
function replot(dataFrame, plotSpecification, plotId, plotDivStyle) {
  let plotObject = undefined
  switch (plotSpecification.plot_type) {
    case 'bar':
      plotObject = makeBasicChart(dataFrame, plotSpecification.dimensions, { type: 'bar' })
      break
    case 'stacked bar':
      plotObject = makeBasicChart(
        dataFrame,
        plotSpecification.dimensions,
        { type: 'bar' },
        { barmode: 'stack' }
      )
      break
    case 'line':
      plotObject = makeBasicChart(dataFrame, plotSpecification.dimensions, {
        line: { shape: 'hvh' }
      })
      break
    case 'stacked line':
      plotObject = makeBasicChart(dataFrame, plotSpecification.dimensions, {
        line: { shape: 'hvh' },
        mode: 'none',
        stackgroup: 'a'
      })
      break
    case 'heatmap':
      plotObject = makeHeatmapChart(dataFrame, plotSpecification.dimensions)
      break
    case 'table':
      break
    default:
      throw Error(`Unknown plot type '${plotSpecification.plot_type}'`)
  }
  if (plotObject !== undefined) {
    const subplotCount =
      plotObject.layout.grid !== undefined
        ? plotObject.layout.grid.rows
        : Math.min(plotObject.data.length, 1)
    plotDivStyle.value.minHeight = plotMinHeight(subplotCount) + 'px'
    nextTick(() => Plotly.newPlot(plotId, plotObject))
  }
}

/**Fetches parameter values and creates the data frame.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to the analysis interface.
 * @param {object} plotSpecification Plot specification.
 * @param {number[]} scenarioExecutionids Scenario execution ids.
 * @param {Ref} currentDataFrame Current data frame.
 * @param {string} plotId Plot div element id.
 * @param {Ref} plotCount Subplot count.
 * @param {Ref} hasData Flag indicating if the there is data to plot.
 * @param {Ref} state Fetching state.
 * @param {Ref} errorMessage Fetch error message.
 */
function fetchDataFrame(
  projectId,
  analysisUrl,
  plotSpecification,
  scenarioExecutionIds,
  currentDataFrame,
  plotId,
  plotCount,
  hasData,
  state,
  errorMessage
) {
  errorMessage.value = ''
  state.value = Fetchable.state.loading
  if (scenarioExecutionIds.length === 0) {
    return
  }
  const classes = plotSpecification.selection.entity_class
  if (classes.length === 0) {
    return
  }
  const objectDimensions = new Map()
  for (const key in plotSpecification.selection) {
    if (!isEntityKey(key)) {
      continue
    }
    const dimension = new Number(key.split('_')[1])
    objectDimensions.set(dimension, plotSpecification.selection[key])
  }
  const objects = new Array(objectDimensions.size)
  for (const [i, object] of objectDimensions) {
    objects[i] = object
  }
  const parameters = plotSpecification.selection.parameter
  if (parameters.length === 0) {
    return
  }
  fetchResultParameterValues(
    projectId,
    analysisUrl,
    scenarioExecutionIds,
    classes,
    objects,
    parameters
  )
    .then(function (data) {
      const parameterValues = data.values
      if (parameterValues.length === 0) {
        state.value = Fetchable.state.ready
        hasData.value = false
        return
      }
      hasData.value = true
      const valueObjects = []
      const baseColumnNames = [entityClassKey, parameterKey, scenarioKey]
      let maxDimensions = 0
      const indexNameLocations = new Map()
      for (const value of parameterValues) {
        maxDimensions = Math.max(maxDimensions, value.objects.length)
        const valueParts = objectify(
          JSON.parse(value.value),
          value.type,
          (name) => valueIndexKeyPrefix + name
        )
        for (const [i, name] of Object.keys(valueParts[0]).slice(0, -1).entries()) {
          const nameIndex = indexNameLocations.get(name)
          if (nameIndex === undefined || i > nameIndex) {
            indexNameLocations.set(name, i)
          }
        }
        const objectPart = {}
        for (let dimension = 0; dimension !== value.objects.length; ++dimension) {
          objectPart[entityKey(dimension)] = value.objects[dimension]
        }
        const fullScenario = `${value.scenario} ${timeFormat.format(new Date(value.time_stamp))}`
        for (const valuePart of valueParts) {
          valueObjects.push({
            [entityClassKey]: value.class,
            [parameterKey]: value.parameter,
            [scenarioKey]: fullScenario,
            ...objectPart,
            ...valuePart
          })
        }
      }
      const indexColumnNames = [...indexNameLocations.keys()]
      indexColumnNames.sort((a, b) => indexNameLocations.get(a) - indexNameLocations.get(b))
      const objectColumnNames = []
      for (let dimension = 0; dimension != maxDimensions; ++dimension) {
        objectColumnNames.push(entityKey(dimension))
      }
      const columnNames = baseColumnNames.concat(objectColumnNames).concat(indexColumnNames)
      columnNames.push('y')
      let dataFrame = new DataFrame({ columnNames: columnNames, values: valueObjects })
      dataFrame = filterDeselectedIndexNames(dataFrame, plotSpecification.selection)
      currentDataFrame.value = dataFrame
      state.value = Fetchable.state.ready
      nextTick(() => replot(dataFrame, plotSpecification, plotId, plotCount))
    })
    .catch(function (error) {
      errorMessage.value = error.message
      state.value = Fetchable.state.error
    })
}

/**Checks if it makes sense to plot and if it does, plots..
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to the analysis interface.
 * @param {object} plotSpecification Plot specification.
 * @param {number[]} scenarioExecutionids Scenario execution ids.
 * @param {Ref} currentDataFrame Current data frame.
 * @param {string} plotId Plot div element id.
 * @param {Ref} plotCount Subplot count.
 * @param {Ref} hasData Flag indicating if the there is data to plot.
 * @param {Ref} state Fetching state.
 * @param {Ref} errorMessage Fetch error message.
 */
function plotIfPossible(
  projectId,
  analysisUrl,
  plotSpecification,
  scenarioExecutionIds,
  currentDataFrame,
  plotId,
  plotCount,
  hasData,
  state,
  errorMessage
) {
  if (
    plotSpecification.selection.entity_class.length === 0 ||
    plotSpecification.selection.parameter.length === 0
  ) {
    return
  }
  fetchDataFrame(
    projectId,
    analysisUrl,
    plotSpecification,
    scenarioExecutionIds,
    currentDataFrame,
    plotId,
    plotCount,
    hasData,
    state,
    errorMessage
  )
}

export default {
  props: {
    identifier: { type: Number, required: true },
    projectId: { type: Number, required: true },
    analysisUrl: { type: String, required: true },
    scenarioExecutionIds: { type: Array, required: true },
    plotSpecification: { type: Object, required: true }
  },
  components: {
    fetchable: Fetchable,
    'plot-table': PlotTable
  },
  setup(props) {
    const state = ref(Fetchable.state.waiting)
    const errorMessage = ref('')
    const hasData = ref(true)
    const plotId = `plot-${props.identifier}`
    const showGraph = computed(() => hasData.value && props.plotSpecification.plot_type !== 'table')
    const showTable = computed(() => hasData.value && props.plotSpecification.plot_type === 'table')
    const currentDataFrame = ref(null)
    const plotDivStyle = ref({ minHeight: emptyPlotMinHeight + 'px' })
    watch(toRef(props, 'scenarioExecutionIds'), function () {
      plotIfPossible(
        props.projectId,
        props.analysisUrl,
        props.plotSpecification,
        props.scenarioExecutionIds,
        currentDataFrame,
        plotId,
        plotDivStyle,
        hasData,
        state,
        errorMessage
      )
    })
    watch(
      () => toRef(props, 'plotSpecification'),
      function () {
        plotIfPossible(
          props.projectId,
          props.analysisUrl,
          props.plotSpecification,
          props.scenarioExecutionIds,
          currentDataFrame,
          plotId,
          plotDivStyle,
          hasData,
          state,
          errorMessage
        )
      },
      { deep: true }
    )
    onMounted(function () {
      plotIfPossible(
        props.projectId,
        props.analysisUrl,
        props.plotSpecification,
        props.scenarioExecutionIds,
        currentDataFrame,
        plotId,
        plotDivStyle,
        hasData,
        state,
        errorMessage
      )
    })
    return {
      state: state,
      errorMessage: errorMessage,
      plotId: plotId,
      showGraph: showGraph,
      showTable: showTable,
      currentDataFrame: currentDataFrame,
      plotDivStyle: plotDivStyle,
      download() {
        downloadAsCsv(currentDataFrame.value)
      }
    }
  }
}
</script>
