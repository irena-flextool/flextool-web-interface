<template>
  <fetchable :state="state" :error-message="errorMessage">
    <n-layout has-sider position="absolute">
      <n-layout-sider collapse-mode="width" :show-trigger="true">
        <n-menu v-model:value="selectedBoxKey" :options="boxes" @update:value="scrollToBox" />
      </n-layout-sider>
      <n-layout-content @scroll="testScrolling">
        <n-grid cols="1">
          <n-grid-item v-for="box in boxes" :key="box.key">
            <keyed-card :fingerprint="box.key" @close="dropBox">
              <plot-editor
                :id="boxElementId(box)"
                :is-custom="isCustom"
                :identifier="box.key"
                :project-id="projectId"
                :analysis-url="analysisUrl"
                :scenario-execution-ids="scenarioExecutionIds"
                :plot-specification-bundle="plotSpecificationBundle"
                @plot-type-changed="updateBoxPlotType"
                @update:title="updatePlotTitle"
              />
            </keyed-card>
          </n-grid-item>
          <n-grid-item>
            <n-button @click="addBox"> New figure </n-button>
          </n-grid-item>
        </n-grid>
      </n-layout-content>
    </n-layout>
  </fetchable>
</template>

<script>
import { h, onMounted, ref, watch } from 'vue/dist/vue.esm-bundler.js'
import { useMessage } from 'naive-ui'
import { ChartArea, ChartBar, ChartLine, Table, Th } from '@vicons/fa'
import {
  fetchDefaultPlotSpecification,
  storeDefaultPlotSpecification,
  fetchCustomPlotSpecification,
  storeCustomPlotSpecification
} from '../modules/communication.mjs'
import { makePlotSpecificationBundle } from '../modules/plots.mjs'
import Fetchable from './Fetchable.vue'
import KeyedCard from './KeyedCard.vue'
import PlotEditor from './PlotEditor.vue'

/**
 * Creates an icon for box.
 * @param {string} plotType Plot type.
 * @returns {object} Box icon.
 */
function boxIcon(plotType) {
  switch (plotType) {
    case 'line':
      return () => h(ChartLine)
    case 'stacked line':
      return () => h(ChartArea)
    case 'bar':
      return () => h(ChartBar)
    case 'stacked bar':
      return () => h(ChartBar)
    case 'heatmap':
      return () => h(Th)
    case 'table':
      return () => h(Table)
    default:
      throw new Error(`Unknown plot type '${plotType}'.`)
  }
}

const untitledLabel = '<untitled>'

/**
 * Creates a box that does not have a plot label.
 * @param {string} key Box key.
 * @param {string} plotType Plot type.
 * @returns {object} Box object.
 */
function makeBox(key, plotType) {
  return { key: key, label: untitledLabel, icon: boxIcon(plotType) }
}

/**
 * Creates an id for the box html element.
 * @param {object} box Box object.
 * @returns {string} Element id.
 */
function boxElementId(box) {
  return `box-${box.key}`
}

export default {
  props: {
    isCustom: { type: Boolean, required: true },
    name: { type: String, required: true },
    projectId: { type: Number, required: true },
    analysisUrl: { type: String, required: true }
  },
  emits: ['busy', 'ready'],
  components: {
    fetchable: Fetchable,
    'keyed-card': KeyedCard,
    'plot-editor': PlotEditor
  },
  setup(props, context) {
    const state = ref(Fetchable.state.loading)
    const errorMessage = ref('')
    const boxes = ref([])
    const selectedBoxKey = ref(null)
    const scenarioExecutionIds = ref([])
    let fetchingSpecifications = false
    const message = useMessage()
    const plotSpecificationBundle = makePlotSpecificationBundle()
    watch(plotSpecificationBundle, function (specificationBundle) {
      if (fetchingSpecifications) {
        return
      }
      const specifications = {
        plots: specificationBundle.asArray()
      }
      const storePromise = props.isCustom
        ? storeCustomPlotSpecification(
            props.projectId,
            props.analysisUrl,
            props.name,
            specifications
          )
        : storeDefaultPlotSpecification(props.projectId, props.analysisUrl, specifications)
      storePromise.catch(function (error) {
        message.warning(error.message)
      })
    })
    onMounted(function () {
      fetchingSpecifications = true
      const specificationPromise = props.isCustom
        ? fetchCustomPlotSpecification(props.projectId, props.analysisUrl, props.name)
        : fetchDefaultPlotSpecification(props.projectId, props.analysisUrl)
      specificationPromise
        .then(function (data) {
          const specifications = JSON.parse(data.plot_specification)
          for (const specification of specifications.plots) {
            const identifier = plotSpecificationBundle.add(specification)
            boxes.value.push(makeBox(identifier, specification.plot_type))
          }
        })
        .catch(function (error) {
          message.warning(error.message)
        })
        .finally(function () {
          state.value = Fetchable.state.ready
          fetchingSpecifications = false
        })
      context.emit('ready', props.name)
    })
    return {
      state,
      errorMessage,
      boxes,
      scenarioExecutionIds,
      selectedBoxKey,
      plotSpecificationBundle,
      addBox() {
        const identifier = plotSpecificationBundle.new()
        const specification = plotSpecificationBundle.get(identifier)
        boxes.value.push(makeBox(identifier, specification.plot_type))
      },
      dropBox(identifier) {
        for (const [i, box] of boxes.value.entries()) {
          if (box.identifier === identifier) {
            boxes.value.splice(i, 1)
            break
          }
        }
        plotSpecificationBundle.delete(identifier)
      },
      setScenarioExecutionIds(ids) {
        scenarioExecutionIds.value = ids
      },
      updateBoxPlotType(plotTypeData) {
        for (const box of boxes.value) {
          if (box.key === plotTypeData.identifier) {
            box.icon = boxIcon(plotTypeData.plotType)
            return
          }
        }
        throw new Error(`Box '${identifier}' not found.`)
      },
      boxElementId,
      scrollToBox(identifier) {
        for (const [i, box] of boxes.value.entries()) {
          if (box.key === identifier) {
            const boxElement = document.getElementById(boxElementId(box))
            boxElement.scrollIntoView()
            return
          }
        }
        throw new Error(`Box '${identifier}' not found.`)
      },
      updatePlotTitle({ identifier, plotTitle }) {
        for (const box of boxes.value) {
          if (box.key === identifier) {
            if (plotTitle !== undefined && plotTitle !== '') {
              box.label = plotTitle
            } else {
              box.label = untitledLabel
            }
            return
          }
        }
        throw new Error(`Box '${identifier}' not found.`)
      },
      testScrolling() {
        let topClosestToZero = Number.MAX_VALUE
        let closestBoxKey = undefined
        for (const box of boxes.value) {
          const boxElement = document.getElementById(boxElementId(box))
          const rectangle = boxElement.getBoundingClientRect()
          if (rectangle.top < topClosestToZero && rectangle.bottom >= 300) {
            topClosestToZero = rectangle.top
            closestBoxKey = box.key
          }
        }
        if (closestBoxKey !== undefined) {
          selectedBoxKey.value = closestBoxKey
        }
      },
      componentName() {
        return props.name
      }
    }
  }
}
</script>
