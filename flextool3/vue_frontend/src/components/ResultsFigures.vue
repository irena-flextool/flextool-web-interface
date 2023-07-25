<template>
  <fetchable :state="state" :error-message="errorMessage">
    <n-grid cols="1">
      <n-grid-item v-for="box in boxes" :key="box.identifier">
        <keyed-card :fingerprint="box.identifier" @close="dropBox">
          <plot-editor
            :is-custom="isCustom"
            :identifier="box.identifier"
            :project-id="projectId"
            :analysis-url="analysisUrl"
            :scenario-execution-ids="scenarioExecutionIds"
            :plot-specification-bundle="plotSpecificationBundle"
          />
        </keyed-card>
      </n-grid-item>
      <n-grid-item>
        <n-button @click="addBox"> New figure </n-button>
      </n-grid-item>
    </n-grid>
  </fetchable>
</template>

<script>
import { onMounted, ref, watch } from 'vue/dist/vue.esm-bundler.js'
import { useMessage } from 'naive-ui'
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
            boxes.value.push({ identifier: identifier })
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
      plotSpecificationBundle,
      addBox() {
        const identifier = plotSpecificationBundle.new()
        boxes.value.push({ identifier: identifier })
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
      componentName() {
        return props.name
      }
    }
  }
}
</script>
