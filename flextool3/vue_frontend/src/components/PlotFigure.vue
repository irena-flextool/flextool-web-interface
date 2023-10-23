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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue/dist/vue.esm-bundler.js'
import Plotly from 'plotly.js-cartesian-dist-min'
import { DataFrame } from 'data-forge'
import { downloadAsCsv } from '../modules/figures.mjs'
import { fetchResultParameterValues } from '../modules/communication.mjs'
import { objectify } from '../modules/parameterValues.mjs'
import {
  filterDeselectedIndexNames,
  makeBasicChart,
  makeHeatmapChart,
  stackLines
} from '../modules/plots.mjs'
import { timeFormat } from '../modules/scenarios.mjs'
import {
  entityClassKey,
  entityKey,
  isEntityKey,
  parameterKey,
  scenarioKey,
  valueIndexKeyPrefix
} from '../modules/plotEditors.mjs'
import { singleAttributeNotEqual } from '../modules/comparison.mjs'
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

const lineShape = { shape: 'hvh' }

/**
 * Changes plot type.
 * @param {DataFrame} dataFrame Data frame to plot.
 * @param {object} plotSpecification Plot specification.
 * @param {string} plotId Plot div element id.
 * @param {Ref} plotDivStyle Plot div element.
 * @param {object} ongoingPlottingTasks Structure that contains information about running plotting tasks.
 * @return {string} Plot name.
 */
function replot(dataFrame, plotSpecification, plotId, plotDivStyle, ongoingPlottingTasks) {
  if (ongoingPlottingTasks.cancelling) {
    return null
  }
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
        { barmode: 'relative' }
      )
      break
    case 'line':
      plotObject = makeBasicChart(dataFrame, plotSpecification.dimensions, {
        line: { ...lineShape }
      })
      break
    case 'stacked line':
      plotObject = stackLines(
        makeBasicChart(dataFrame, plotSpecification.dimensions, {
          line: { ...lineShape },
          mode: 'none'
        })
      )
      break
    case 'heatmap':
      plotObject = makeHeatmapChart(dataFrame, plotSpecification.dimensions)
      break
    case 'table':
      break
    default:
      throw new Error(`Unknown plot type '${plotSpecification.plot_type}'`)
  }
  let plotName = null
  if (plotObject !== undefined && !ongoingPlottingTasks.cancelling) {
    const subplotCount =
      plotObject.layout.grid !== undefined
        ? plotObject.layout.grid.rows
        : Math.min(plotObject.data.length, 1)
    plotDivStyle.value.minHeight = plotMinHeight(subplotCount) + 'px'
    if ('layout' in plotObject) {
      plotName = plotObject.layout.title
      if (plotSpecification.name !== null) {
        plotObject.layout.title = plotSpecification.name
      }
    }
    nextTick(function () {
      if (!document.body.contains(document.getElementById(plotId))) {
        return
      }
      Plotly.newPlot(plotId, plotObject)
    })
  }
  return plotName
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
 * @param {object} ongoingPlottingTasks Structure that contains information about running plotting tasks.
 * @param {Ref} state Fetching state.
 * @param {Ref} errorMessage Fetch error message.
 * @callback plotNameChanged Function to call when plot name has changed.
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
  ongoingPlottingTasks,
  state,
  errorMessage,
  plotNameChanged
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
  ongoingPlottingTasks.chainLength += 1
  if (ongoingPlottingTasks.plottingPromise === null) {
    ongoingPlottingTasks.plottingPromise = Promise.resolve()
  } else {
    ongoingPlottingTasks.cancelling = true
  }
  ongoingPlottingTasks.plottingPromise = ongoingPlottingTasks.plottingPromise
    .then(function () {
      return fetchResultParameterValues(
        projectId,
        analysisUrl,
        scenarioExecutionIds,
        classes,
        objects,
        parameters
      )
    })
    .then(function (data) {
      const parameterValues = data.values
      if (parameterValues.length === 0) {
        state.value = Fetchable.state.ready
        hasData.value = false
        return null
      }
      if (ongoingPlottingTasks.cancelling) {
        return undefined
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
      const plotName = replot(dataFrame, plotSpecification, plotId, plotCount, ongoingPlottingTasks)
      return plotName
    })
    .then(function (plotName) {
      if (plotName !== undefined) {
        plotNameChanged(plotName)
      }
    })
    .catch(function (error) {
      if (ongoingPlottingTasks.chainLength === 1) {
        errorMessage.value = error.message
        state.value = Fetchable.state.error
      }
    })
    .finally(function () {
      ongoingPlottingTasks.chainLength -= 1
      if (ongoingPlottingTasks.chainLength === 0) {
        ongoingPlottingTasks.plottingPromise = null
      }
      if (ongoingPlottingTasks.chainLength === 1) {
        ongoingPlottingTasks.cancelling = false
      }
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
 * @param {object} ongoingPlottingTasks Structure that contains information about running plotting tasks.
 * @param {Ref} state Fetching state.
 * @param {Ref} errorMessage Fetch error message.
 * @callback plotNameChaged Function to call when plot name has changed.
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
  ongoingPlottingTasks,
  state,
  errorMessage,
  plotNameChanged
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
    ongoingPlottingTasks,
    state,
    errorMessage,
    plotNameChanged
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
  emits: ['update:name'],
  components: {
    fetchable: Fetchable,
    'plot-table': PlotTable
  },
  setup(props, context) {
    const state = ref(Fetchable.state.waiting)
    const errorMessage = ref('')
    const hasData = ref(true)
    const plotId = `plot-${props.identifier}`
    const showGraph = computed(() => hasData.value && props.plotSpecification.plot_type !== 'table')
    const showTable = computed(() => hasData.value && props.plotSpecification.plot_type === 'table')
    const currentDataFrame = ref(null)
    const plotDivStyle = ref({ minHeight: emptyPlotMinHeight + 'px' })
    const ongoingPlottingTasks = { plottingPromise: null, cancelling: false, chainLength: 0 }
    let plotSpecificationSnapshot = { ...props.plotSpecification }
    let automaticPlotName = null
    const emitPlotNameChanged = function (plotName) {
      automaticPlotName = plotName
      if (props.plotSpecification.name === null) {
        context.emit('update:name', { identifier: props.identifier, plotName })
      }
    }
    watch(props.scenarioExecutionIds, function () {
      plotIfPossible(
        props.projectId,
        props.analysisUrl,
        props.plotSpecification,
        props.scenarioExecutionIds,
        currentDataFrame,
        plotId,
        plotDivStyle,
        hasData,
        ongoingPlottingTasks,
        state,
        errorMessage,
        emitPlotNameChanged
      )
    })
    watch(
      props.plotSpecification,
      function (currentSpecification) {
        if (singleAttributeNotEqual(currentSpecification, plotSpecificationSnapshot, 'name')) {
          if (!showGraph.value) {
            return
          } else if (currentSpecification.name !== null) {
            Plotly.relayout(plotId, { title: currentSpecification.name })
          } else {
            Plotly.relayout(plotId, { title: automaticPlotName })
            context.emit('update:name', {
              identifier: props.identifier,
              plotName: automaticPlotName
            })
          }
        } else {
          plotIfPossible(
            props.projectId,
            props.analysisUrl,
            currentSpecification,
            props.scenarioExecutionIds,
            currentDataFrame,
            plotId,
            plotDivStyle,
            hasData,
            ongoingPlottingTasks,
            state,
            errorMessage,
            emitPlotNameChanged
          )
        }
        plotSpecificationSnapshot = { ...currentSpecification }
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
        ongoingPlottingTasks,
        state,
        errorMessage,
        emitPlotNameChanged
      )
    })
    onUnmounted(function () {
      if (ongoingPlottingTasks.plottingPromise !== null) {
        ongoingPlottingTasks.cancelling = true
        ongoingPlottingTasks.plottingPromise = ongoingPlottingTasks.plottingPromise.then(
          function () {
            ongoingPlottingTasks.cancelling = false
          }
        )
      }
    })
    return {
      state,
      errorMessage,
      plotId,
      showGraph,
      showTable,
      currentDataFrame,
      plotDivStyle,
      download() {
        downloadAsCsv(currentDataFrame.value)
      },
      notifyActivated() {
        if (!showGraph.value) {
          return
        }
        nextTick(() => Plotly.relayout(plotId, {}))
      }
    }
  }
}
</script>
