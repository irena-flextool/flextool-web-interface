import { ref } from 'vue'

/**Compares two select options for greatness.
 * @param {object} a Left hand side option.
 * @param {object} b Right hand side option.
 * @returns {number} Comparison result.
 */
function compareLabels(a, b) {
  return a.label < b.label ? -1 : a.label > b.label ? 1 : 0
}

/**Adds fetched entities to relevant data structures.
 * @param {object} entities Fetched entities.
 * @param {Map} selectionOptions Selection options.
 * @param {Ref} selectionSelects Selection selects.
 * @param {object} plotSpecification Plot specification.
 * @param {Ref} dimensionsOptions Dimensions select options.
 * @callback updateValueIndexes Callback to update value index selects.
 */
function addFetchedEntities(
  entities,
  selectionOptions,
  selectionSelects,
  plotSpecification,
  dimensionsOptions,
  updateValueIndexes
) {
  let dimensionCount = 1
  for (const entity of entities) {
    dimensionCount = Math.max(dimensionCount, entity.names.length)
  }
  setEntityIndexes(dimensionCount, dimensionsOptions)
  const entityOptionsMaps = []
  for (let dimension = 0; dimension < dimensionCount; ++dimension) {
    const optionKey = entityKey(dimension)
    const entityOptions = itemOptionsMap(selectionOptions.get(optionKey))
    for (const entity of entities) {
      addEntityToOptions(entity, dimension, entityOptions)
    }
    entityOptionsMaps.push(entityOptions)
  }
  for (let dimension = 0; dimension < dimensionCount; ++dimension) {
    const entityOptions = entityOptionsMaps[dimension]
    const options = makeOptions(entityOptions)
    const optionKey = entityKey(dimension)
    const label = objectLabel(dimension)
    selectionOptions.set(optionKey, options)
    if (!(optionKey in plotSpecification.selection)) {
      plotSpecification.selection[optionKey] = []
    }
    let selectionSelectUpdated = false
    for (const selectionSelect of selectionSelects.value) {
      if (selectionSelect.label === label) {
        selectionSelect.options = options
        selectionSelectUpdated = true
        break
      }
    }
    if (!selectionSelectUpdated) {
      selectionSelects.value.push(
        makeObjectOrParameterSelectionSelect(
          label,
          optionKey,
          objectPlaceholder,
          options,
          objectPriority(dimension),
          updateValueIndexes
        )
      )
    }
  }
}

/**Adds fetched parameters to relevant data structures.
 * @param {object} parameters Fetched parameters.
 * @param {Map} selectionOptions Selection options.
 * @param {Ref} selectionSelects Selection selects.
 * @param {object} plotSpecification Plot specification.
 * @param {Ref} dimensionsOptions Dimensions select options.
 * @callback updateValueIndexes Callback to update value index selects.
 */
function addFetchedParameters(
  parameters,
  selectionOptions,
  selectionSelects,
  plotSpecification,
  dimensionsOptions,
  updateValueIndexes
) {
  if (dimensionsOptions.value.every((nameOption) => nameOption.value !== parameterKey)) {
    dimensionsOptions.value.push({ label: parameterLabel, value: parameterKey, protected: true })
  }
  const parameterOptions = itemOptionsMap(selectionOptions.get(parameterKey))
  for (const parameter of parameters) {
    let existing = parameterOptions.get(parameter.name)
    const parent = { entityClass: parameter.class_name }
    if (existing === undefined) {
      existing = [parent]
      parameterOptions.set(parameter.name, existing)
    } else {
      existing.push(parent)
    }
  }
  const options = makeOptions(parameterOptions)
  selectionOptions.set(parameterKey, options)
  if (!(parameterKey in plotSpecification.selection)) {
    plotSpecification.selection[parameterKey] = []
  }
  let selectionSelectUpdated = false
  for (const selectionSelect of selectionSelects.value) {
    if (selectionSelect.label === parameterLabel) {
      selectionSelect.options = options
      selectionSelectUpdated = true
      break
    }
  }
  if (!selectionSelectUpdated) {
    selectionSelects.value.push(
      makeObjectOrParameterSelectionSelect(
        parameterLabel,
        parameterKey,
        parameterPlaceholder,
        options,
        parameterPriority,
        updateValueIndexes
      )
    )
  }
}

/**Collects select options to a map keyed by option value.
 * @param {Ref} itemSelectionOptions Selection options for specific item type.
 * @returns {Map} Option map.
 */
function itemOptionsMap(itemSelectionOptions) {
  const optionMap = new Map()
  if (itemSelectionOptions !== undefined) {
    for (const option of itemSelectionOptions.value) {
      let parents = option.parents
      if (parents === undefined) {
        parents = []
      }
      optionMap.set(option.label, parents)
    }
  }
  return optionMap
}

/**Creates item options.
 * @param {Map} itemOptions Item's options map.
 * @returns {Ref}  Select options.
 */
function makeOptions(itemOptions) {
  const options = ref([])
  for (const [label, parents] of itemOptions) {
    options.value.push({
      label: label,
      parents: parents
    })
  }
  options.value.sort(compareLabels)
  return options
}

const valueIndexKeyPrefix = 'X_'
const scenarioKey = 'scenario'
const entityClassKey = 'entity_class'
const parameterKey = 'parameter'
const entityKeyPrefix = 'entity_'
const entityKeyFingerprint = /^entity_[0-9]+$/

/**Creates entity key for select options.
 * @param {number} dimension Entity dimension.
 * @returns {string} Key.
 */
function entityKey(dimension) {
  return entityKeyPrefix + dimension
}

/**Tests whether key is entity key.
 * @param {string} key Key.
 * @returns {boolean} True if key is entity key, False otherwise.
 */
function isEntityKey(key) {
  return entityKeyFingerprint.test(key)
}

/**Removes prefix from index name key.
 * @param {string} key Index name key.
 * @returns {string} Human-readable index name label.
 */
function indexNameFromKey(key) {
  return key.substring(valueIndexKeyPrefix.length)
}

/**Converts key to human-readable label.
 * @param {string} key Key to convert.
 * @returns {string} Label.
 */
function nameFromKey(key) {
  if (key === null || key === undefined) {
    return ''
  }
  if (key.startsWith(valueIndexKeyPrefix)) {
    return indexNameFromKey(key)
  }
  return key
}

const parameterLabel = 'Parameter'

/**Creates object label for select options.
 * @param {number} dimension Object dimension.
 * @returns {string} Label.
 */
function objectLabel(dimension) {
  return `Object ${dimension + 1}`
}

const parameterPlaceholder = 'Select parameters'
const objectPlaceholder = 'Use all objects'

const entityClassPriority = 10000
const parameterPriority = entityClassPriority - 1000
const objectPriorityBase = parameterPriority - 1000

/**Creates object select option priority.
 * @param {number} dimension Object dimension.
 * @returns {number} Priority.
 */
function objectPriority(dimension) {
  return objectPriorityBase - dimension
}
const indexNamePriorityBase = objectPriorityBase - 1000

/**Creates parameter index name priority.
 * @param {number} depth Index depth.
 * @returns {number} Priority.
 */
function indexNamePriority(depth) {
  return indexNamePriorityBase - depth
}

/**Creates new select component entry.
 * @param {string} label Select label.
 * @param {string} itemType Item type.
 * @param {string} placeholder Item name to add to the component's placeholder text.
 * @param {Ref} options Options.
 * @param {number} priority Select priority.
 * @callback updateValueIndexes Callback to update value index selects.
 */
function makeObjectOrParameterSelectionSelect(
  label,
  itemType,
  placeholder,
  options,
  priority,
  updateValueIndexes
) {
  return {
    label: label,
    type: itemType,
    updateCallback: updateValueIndexes,
    placeholder: placeholder,
    options: options,
    priority: priority
  }
}

function makeEntityClassSelectionSelect(options, updateClassSelection) {
  return {
    label: 'Entity class',
    type: entityClassKey,
    updateCallback: updateClassSelection,
    placeholder: 'Select entity classes',
    options: options,
    priority: entityClassPriority
  }
}

function makeValueIndexSelectionSelect(itemType, options, priority) {
  return {
    label: indexNameFromKey(itemType),
    type: itemType,
    updateCallback: () => undefined,
    placeholder: 'Use all',
    options: options,
    priority: priority
  }
}

function addEntityToOptions(entity, dimension, entityOptions) {
  const label = entity.names[dimension]
  let existing = entityOptions.get(label)
  const parent = { entityClass: entity.class_name }
  if (existing === undefined) {
    existing = [parent]
    entityOptions.set(label, existing)
  } else {
    existing.push(parent)
  }
}

/**Adds or removes entity index name options.
 * @param {number} dimensionCount Number of entity dimensions.
 * @param {Ref} dimensionsOptions Dimensions select options.
 */
function setEntityIndexes(dimensionCount, dimensionsOptions) {
  const entityLocations = []
  for (let i = 0; i < dimensionsOptions.value.length; ++i) {
    if (isEntityKey(dimensionsOptions.value[i].value)) {
      entityLocations.push(i)
    }
  }
  const excessEntityCount = dimensionCount - entityLocations.length
  if (excessEntityCount === 0) {
    return
  }
  if (excessEntityCount > 0) {
    const newIndexNames = []
    for (let i = entityLocations.length; i < dimensionCount; ++i) {
      newIndexNames.push({ label: objectLabel(i), value: entityKey(i), protected: true })
    }
    const insertion = entityLocations.length > 0 ? entityLocations.at(-1) + 1 : 1
    dimensionsOptions.value.splice(insertion, 0, ...newIndexNames)
  } else {
    dimensionsOptions.value.splice(entityLocations.at(excessEntityCount), -excessEntityCount)
  }
}

/**Removes selected entity class dependent items that can no longer exist.
 * @param {object} plotSpecification Plot specification.
 * @param {Map} selectionOptions Selection select options.
 */
function removeExcessSelections(plotSpecification, selectionOptions) {
  const classes = new Set(plotSpecification.selection.entity_class)
  for (const [key, options] of selectionOptions.entries()) {
    if (key === entityClassKey) {
      continue
    }
    const removableOptionIndexes = []
    for (const [optionIndex, option] of options.value.entries()) {
      for (let i = option.parents.length - 1; i != -1; --i) {
        if (!classes.has(option.parents[i].entityClass)) {
          option.parents.splice(i, 1)
        }
      }
      if (option.parents.length === 0) {
        const selectedItemValues = plotSpecification.selection[key]
        const removableIndex = selectedItemValues.indexOf(option.label)
        if (removableIndex >= 0) {
          selectedItemValues.splice(removableIndex, 1)
        }
        removableOptionIndexes.push(optionIndex)
      }
    }
    for (const index of removableOptionIndexes.reverse()) {
      options.value.splice(index, 1)
    }
  }
}

/**Removes selects that do not have any options.
 * @param {Ref} selectionSelects Selects.
 */
function removeExcessSelectionSelects(selectionSelects) {
  for (let i = selectionSelects.value.length - 1; i != -1; --i) {
    const select = selectionSelects.value[i]
    if (select.label === 'Entity class') {
      continue
    }
    if (select.options.length === 0) {
      selectionSelects.value.splice(i, 1)
    }
  }
}

/**Collects elements that are in set a but not in set b.
 * @param {Set} a Set whose elements to collect.
 * @param {Set} b Set to subtract from a.
 * @returns {Array} Array of remaining elements in a.
 */
function differingElements(a, b) {
  const diff = []
  for (const e of a) {
    if (!b.has(e)) {
      diff.push(e)
    }
  }
  return diff
}

export {
  addFetchedEntities,
  addFetchedParameters,
  differingElements,
  compareLabels,
  entityClassKey,
  indexNameFromKey,
  indexNamePriority,
  makeEntityClassSelectionSelect,
  makeValueIndexSelectionSelect,
  nameFromKey,
  entityKey,
  isEntityKey,
  parameterKey,
  removeExcessSelections,
  removeExcessSelectionSelects,
  scenarioKey,
  valueIndexKeyPrefix
}
