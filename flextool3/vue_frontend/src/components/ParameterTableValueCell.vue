<template>
  <n-space>
    <n-select
      :options="species"
      :value="currentSpecie"
      size="tiny"
      :consistent-menu-width="false"
      @update:value="changeState"
    />
    <n-input
      v-if="state === 'single value'"
      :value="currentValue"
      @update:value="changeSingleValue"
      size="tiny"
    />
    <n-select
      v-else-if="state === 'value list'"
      :value="currentValue"
      :options="valueOptions"
      size="tiny"
      :consistent-menu-width="false"
      @update:value="changeSingleValue"
    />
    <n-button v-else-if="state === 'indexed value'" size="tiny" @click="emitOpenValueEditorRequest">
      Edit
    </n-button>
  </n-space>
</template>

<script>
import { ref, toRefs, watch } from 'vue/dist/vue.esm-bundler.js'
import { singleValueFromString } from '../modules/singleValueFromString.mjs'

/**
 * Builds list of possible specie infos depending on which ones are allowed.
 * @param {object} allowedSpecies Allowed species.
 * @returns {Object[]} Specie infos.
 */
function makeSpecies(allowedSpecies) {
  const species = [{ label: 'none', value: 'none' }]
  if (allowedSpecies.constant) {
    species.push({ label: 'constant', value: 'constant' })
  }
  if (allowedSpecies.period) {
    species.push({ label: 'period', value: 'period' })
  }
  if (allowedSpecies.time) {
    species.push({ label: 'time', value: 'time' })
  }
  return species
}

/**
 * Chooses cell's current state.
 * @param {string} specie Specie's label.
 * @param {Array} allowedValues Allowed parameter values.
 * @returns {string} Appropriate state.
 */
function makeState(specie, allowedValues) {
  if (specie === 'none') {
    return 'empty'
  } else if (specie === 'constant') {
    if (allowedValues) {
      return 'value list'
    } else {
      return 'single value'
    }
  } else {
    return 'indexed value'
  }
}

function makeValueOptions(allowedValues) {
  if (!allowedValues) {
    return undefined
  }
  const options = []
  allowedValues.forEach(function (value) {
    options.push({ label: value, value: value })
  })
  return options
}

function chooseInitialValue(
  currentSpecie,
  originalSpecie,
  currentValue,
  originalValue,
  allowedValues
) {
  if (currentSpecie === 'none') {
    return undefined
  } else if (currentSpecie === 'constant') {
    switch (typeof currentValue) {
      case 'string':
        return currentValue
      case 'number':
        return new String(currentValue)
      default:
        if (originalSpecie === 'constant') {
          return originalValue !== null ? new String(originalValue) : ''
        } else {
          if (allowedValues) {
            return allowedValues[0]
          } else {
            return ''
          }
        }
    }
  } else {
    if (typeof currentValue === 'object') {
      return currentValue
    } else if (typeof originalValue === 'object') {
      return originalValue
    } else {
      return { type: 'map', index_type: 'str', index_name: currentSpecie, data: [['T0001', 0.0]] }
    }
  }
}

export default {
  props: {
    valueData: { type: Object, required: true },
    valueId: { type: Number, required: false }
  },
  emits: [
    'openValueEditorRequest',
    'closeValueEditorRequest',
    'valueInsert',
    'valueUpdate',
    'valueDelete'
  ],
  setup(props, context) {
    const species = ref(makeSpecies(props.valueData.allowedSpecies))
    const state = ref(makeState(props.valueData.specie, props.valueData.allowedValues))
    const currentSpecie = ref(props.valueData.specie)
    const currentValue = ref(
      chooseInitialValue(
        props.valueData.specie,
        props.valueData.specie,
        props.valueData.parameterValue,
        props.valueData.parameterValue,
        props.valueData.allowedValues
      )
    )
    const valueOptions = ref(makeValueOptions(props.valueData.allowedValues))
    watch(toRefs(props).valueData, function (valueData) {
      species.value = makeSpecies(valueData.allowedSpecies)
      state.value = makeState(valueData.specie, valueData.allowedValues)
      currentSpecie.value = valueData.specie
      currentValue.value = chooseInitialValue(
        valueData.specie,
        valueData.specie,
        valueData.parameterValue,
        valueData.parameterValue,
        valueData.allowedValues
      )
      valueOptions.value = makeValueOptions(valueData.allowedValues)
    })
    return {
      species: species,
      state: state,
      currentSpecie: currentSpecie,
      currentValue: currentValue,
      valueOptions: valueOptions,
      changeState(specie) {
        currentSpecie.value = specie
        const newState = makeState(specie, props.valueData.allowedValues)
        if (state.value === 'indexed value') {
          context.emit('closeValueEditorRequest')
        }
        state.value = newState
        const initialValue = chooseInitialValue(
          specie,
          props.valueData.specie,
          currentValue.value,
          props.valueData.parameterValue,
          props.valueData.allowedValues
        )
        if (initialValue === undefined) {
          context.emit('valueDelete', { id: props.valueId })
        } else {
          const isIndexed = typeof initialValue === 'object'
          const value = isIndexed ? initialValue : singleValueFromString(initialValue)
          if (props.valueId === undefined) {
            context.emit('valueInsert', { value: value })
          } else {
            context.emit('valueUpdate', { id: props.valueId, value: value })
          }
        }
        currentValue.value = initialValue
      },
      changeSingleValue(value) {
        const typedValue = singleValueFromString(value)
        if (props.valueId === undefined) {
          context.emit('valueInsert', { value: typedValue })
        } else {
          context.emit('valueUpdate', { id: props.valueId, value: typedValue })
        }
        currentValue.value = value
      },
      emitOpenValueEditorRequest() {
        context.emit('openValueEditorRequest', {
          valueId: props.valueId,
          parameterValue: currentValue
        })
      }
    }
  }
}
</script>
