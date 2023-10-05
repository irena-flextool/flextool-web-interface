<template>
  <n-p v-if="!hasScenarios">
    No scenario results found. Go to the <n-a :href="runUrl">Run page</n-a> to solve the model.
  </n-p>
  <n-list v-else>
    <n-list-item v-for="(scenario, index) in scenarios" :key="index">
      <n-thing :title="scenario.name">
        <n-tree
          :data="scenario.executions"
          selectable
          :multiple="isMultiSelection"
          block-line
          :selected-keys="scenario.selected"
          :render-suffix="renderSuffix"
          @update:selected-keys="scenario.emitExecutionSelect"
        />
      </n-thing>
    </n-list-item>
  </n-list>
</template>

<script>
import { computed, h, ref } from 'vue/dist/vue.esm-bundler.js'
import { NButton } from 'naive-ui'

/**
 * Builds an array of selected execution ids.
 * @param {object[]} scenarios Array of scenarios.
 * @returns {object[]} Array of selected execution ids.
 */
function selectedExecutionIds(scenarios) {
  const executionInfoList = []
  for (const scenario of scenarios) {
    if (scenario.selected.length === 0) {
      continue
    }
    const selectedLookup = new Set(scenario.selected)
    for (const execution of scenario.executions) {
      if (selectedLookup.has(execution.key)) {
        executionInfoList.push(execution.key)
      }
    }
  }
  return executionInfoList
}

/**
 * Collects keys of executions that are busy.
 * @param {object[]} scenarios Array of scenarios.
 * @returns {Set} Busy keys.
 */
function dyingExecutionKeys(scenarios) {
  const busyIds = new Set()
  for (const scenario of scenarios) {
    for (const execution of scenario.executions) {
      if (execution.deleting) {
        busyIds.add(execution.key)
      }
    }
  }
  return busyIds
}

export default {
  props: {
    projectId: { type: Number, required: true },
    initialScenarios: { type: Array, required: true },
    runUrl: { type: String, required: true },
    summaryUrl: { type: String, required: true },
    isMultiSelection: { type: Boolean, required: true }
  },
  emits: ['executionRemoveRequest', 'executionSelect'],
  setup(props, context) {
    const scenarios = ref([])
    const hasScenarios = computed(() => scenarios.value.length > 0)
    const emitExecutionSelect = function (keys, options, scenarioName) {
      const busyKeys = dyingExecutionKeys(scenarios.value)
      if (busyKeys.length !== 0) {
        const keysToCheck = [...keys]
        for (const [index, key] of keysToCheck.entries()) {
          if (busyKeys.has(key)) {
            keys.splice(index, 1)
            options.splice(index, 1)
          }
        }
      }
      if (keys.length === 0 && !props.isMultiSelection) {
        return
      }
      const scenario = scenarios.value.find((s) => s.name === scenarioName)
      if (!props.isMultiSelection) {
        for (const otherScenario of scenarios.value) {
          otherScenario.selected.length = 0
        }
        scenario.selected = [keys[0]]
        const option = options[0]
        context.emit('executionSelect', [option.key])
      } else {
        scenario.selected = keys
        context.emit('executionSelect', selectedExecutionIds(scenarios.value))
      }
    }
    for (const scenario of props.initialScenarios) {
      const executions = []
      for (const execution of scenario.executions) {
        executions.push({
          disabled: false,
          deleteDisabled: false,
          deleting: false,
          ...execution
        })
      }
      const specificEmitExecutionSelect = (keys, option) =>
        emitExecutionSelect(keys, option, scenario.name)
      scenarios.value.push({
        name: scenario.name,
        emitExecutionSelect: specificEmitExecutionSelect,
        selected: [],
        executions
      })
    }
    return {
      scenarios: scenarios,
      hasScenarios: hasScenarios,
      setExecutionBusy(executionKey, busy) {
        for (const scenario of scenarios.value) {
          const execution = scenario.executions.find((e) => e.key === executionKey)
          if (execution === undefined) {
            continue
          }
          execution.deleteDisabled = busy
          execution.deleting = busy
          return
        }
        throw Error(`Couldn't find execution with key ${executionKey}`)
      },
      removeExecution(executionKey) {
        for (const [scenarioIndex, scenario] of scenarios.value.entries()) {
          const executionIndex = scenario.executions.findIndex((e) => e.key === executionKey)
          if (executionIndex === -1) {
            continue
          }
          const selectionIndex = scenario.selected.findIndex((key) => key === executionKey)
          if (selectionIndex !== -1) {
            scenario.selected.splice(selectionIndex, 1)
            context.emit('executionSelect', selectedExecutionIds(scenarios.value))
          }
          scenario.executions.splice(executionIndex, 1)
          if (scenario.executions.length === 0) {
            scenarios.value.splice(scenarioIndex, 1)
          }
          return
        }
        throw Error(`Couldn't find scenario for execution ${executionKey}.`)
      },
      renderSuffix(info) {
        return h(
          NButton,
          {
            size: 'tiny',
            disabled: info.option.deleteDisabled,
            loading: info.option.deleting,
            onClick() {
              context.emit('executionRemoveRequest', info.option.key)
            }
          },
          {
            default: () => 'Delete'
          }
        )
      }
    }
  }
}
</script>
