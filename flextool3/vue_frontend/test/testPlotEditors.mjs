import assert from 'assert/strict'
import { ref } from 'vue'
import {
  addFetchedEntities,
  addFetchedParameters,
  differingElements,
  entityKey,
  isEntityKey,
  parameterKey,
  removeExcessSelections,
  removeExcessSelectionSelects
} from '../src/modules/plotEditors.mjs'

function dummy() {}

function assertObjectSelectionSelects(selectionSelects, expectedOptions) {
  assert.equal(selectionSelects.value.length, expectedOptions.length)
  for (let dimension = 0; dimension < expectedOptions.length; ++dimension) {
    assert.deepEqual(selectionSelects.value[dimension].label, `Object ${dimension + 1}`)
    assert.equal(selectionSelects.value[dimension].updateCallback, dummy)
    assert.equal(selectionSelects.value[dimension].placeholder, 'Use all objects')
    assert.deepEqual(selectionSelects.value[dimension].options, expectedOptions[dimension].value)
    assert.equal(selectionSelects.value[dimension].priority, 8000 - dimension)
  }
}

describe('plotEditors module', function () {
  describe('addFetchedEntities', function () {
    it('should correctly add new entity to otherwise empty structures', function () {
      const entities = [
        {
          names: ['object a'],
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedEntities(
        entities,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      const expectedOptions = new Map()
      expectedOptions.set(
        entityKey(0),
        ref([{ label: 'object a', parents: [{ entityClass: 'my_class' }] }])
      )
      assert.deepEqual(selectionOptions, expectedOptions)
      assertObjectSelectionSelects(selectionSelects, [selectionOptions.get(entityKey(0))])
      const expectedSpecification = { selection: { entity_0: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Object 1', value: entityKey(0), protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
    it('should deal with two dimensional relationships', function () {
      const entities = [
        {
          names: ['object a', 'object b'],
          class_name: 'my_relation_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedEntities(
        entities,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      const expectedOptions = new Map()
      expectedOptions.set(
        entityKey(0),
        ref([{ label: 'object a', parents: [{ entityClass: 'my_relation_class' }] }])
      )
      expectedOptions.set(
        entityKey(1),
        ref([{ label: 'object b', parents: [{ entityClass: 'my_relation_class' }] }])
      )
      assert.deepEqual(selectionOptions, expectedOptions)
      assertObjectSelectionSelects(selectionSelects, [
        selectionOptions.get(entityKey(0)),
        selectionOptions.get(entityKey(1))
      ])
      const expectedSpecification = { selection: { entity_0: [], entity_1: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Object 1', value: entityKey(0), protected: true },
        { label: 'Object 2', value: entityKey(1), protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
    it('should correctly add new entity after previous one', function () {
      const entities_1 = [
        {
          names: ['object a'],
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedEntities(
        entities_1,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      const entities_2 = [
        {
          names: ['object b'],
          class_name: 'another_class'
        }
      ]
      addFetchedEntities(
        entities_2,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      assert.deepEqual([...selectionOptions.keys()], [entityKey(0)])
      assert.equal(selectionOptions.get(entityKey(0)).value.length, 2)
      assert.equal(selectionOptions.get(entityKey(0)).value[0].label, 'object a')
      assert.equal(selectionOptions.get(entityKey(0)).value[0].parents.length, 1)
      assert.equal(selectionOptions.get(entityKey(0)).value[0].parents[0].entityClass, 'my_class')
      assert.equal(selectionOptions.get(entityKey(0)).value[1].label, 'object b')
      assert.equal(selectionOptions.get(entityKey(0)).value[1].parents.length, 1)
      assert.equal(
        selectionOptions.get(entityKey(0)).value[1].parents[0].entityClass,
        'another_class'
      )
      assertObjectSelectionSelects(selectionSelects, [selectionOptions.get(entityKey(0))])
      const expectedSpecification = { selection: { entity_0: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Object 1', value: entityKey(0), protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
    it('should add new one after previous one has been removed', function () {
      const entities_1 = [
        {
          names: ['object a'],
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedEntities(
        entities_1,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      selectionOptions.set(entityKey(0), ref([]))
      plotSpecification.selection.entity_0 = []
      dimensionsOptions.value = []
      const entities_2 = [
        {
          names: ['object b'],
          class_name: 'another_class'
        }
      ]
      addFetchedEntities(
        entities_2,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      assert.deepEqual([...selectionOptions.keys()], [entityKey(0)])
      assert.equal(selectionOptions.get(entityKey(0)).value.length, 1)
      assert.equal(selectionOptions.get(entityKey(0)).value[0].label, 'object b')
      assert.equal(selectionOptions.get(entityKey(0)).value[0].parents.length, 1)
      assert.equal(
        selectionOptions.get(entityKey(0)).value[0].parents[0].entityClass,
        'another_class'
      )
      assertObjectSelectionSelects(selectionSelects, [selectionOptions.get(entityKey(0))])
      const expectedSpecification = { selection: { entity_0: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Object 1', value: entityKey(0), protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
  })

  function assertParameterSelectionSelects(selectionSelects, expectedOptions) {
    assert.equal(selectionSelects.value.length, 1)
    assert.deepEqual(selectionSelects.value[0].label, 'Parameter')
    assert.equal(selectionSelects.value[0].updateCallback, dummy)
    assert.equal(selectionSelects.value[0].placeholder, 'Select parameters')
    assert.deepEqual(selectionSelects.value[0].options, expectedOptions.value)
    assert.equal(selectionSelects.value[0].priority, 9000)
  }

  describe('addFetchedParameters', function () {
    it('should correctly add new parameter to otherwise empty structures', function () {
      const parameterData = [
        {
          name: 'my_parameter',
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedParameters(
        parameterData,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      const expectedOptions = new Map()
      expectedOptions.set(
        parameterKey,
        ref([{ label: 'my_parameter', parents: [{ entityClass: 'my_class' }] }])
      )
      assert.deepEqual(selectionOptions, expectedOptions)
      assertParameterSelectionSelects(selectionSelects, selectionOptions.get(parameterKey))
      const expectedSpecification = { selection: { parameter: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Parameter', value: parameterKey, protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
    it('should correctly add new parameter after previous one', function () {
      const parameters_1 = [
        {
          name: 'my_parameter',
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedParameters(
        parameters_1,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      const parameters_2 = [
        {
          name: 'another_parameter',
          class_name: 'another_class'
        }
      ]
      addFetchedParameters(
        parameters_2,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      assert.deepEqual([...selectionOptions.keys()], [parameterKey])
      assert.equal(selectionOptions.get(parameterKey).value.length, 2)
      assert.equal(selectionOptions.get(parameterKey).value[0].label, 'another_parameter')
      assert.equal(selectionOptions.get(parameterKey).value[0].parents.length, 1)
      assert.equal(
        selectionOptions.get(parameterKey).value[0].parents[0].entityClass,
        'another_class'
      )
      assert.equal(selectionOptions.get(parameterKey).value[1].label, 'my_parameter')
      assert.equal(selectionOptions.get(parameterKey).value[1].parents.length, 1)
      assert.equal(selectionOptions.get(parameterKey).value[1].parents[0].entityClass, 'my_class')
      assertParameterSelectionSelects(selectionSelects, selectionOptions.get(parameterKey))
      const expectedSpecification = { selection: { parameter: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Parameter', value: parameterKey, protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
    it('should add new one after previous one has been removed', function () {
      const parameters_1 = [
        {
          name: 'my_parameter',
          class_name: 'my_class'
        }
      ]
      const selectionOptions = new Map()
      const selectionSelects = ref([])
      const plotSpecification = { selection: {} }
      const dimensionsOptions = ref([])
      addFetchedParameters(
        parameters_1,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      selectionOptions.set(parameterKey, ref([]))
      plotSpecification.selection.parameter = []
      dimensionsOptions.value = []
      const parameters_2 = [
        {
          name: 'another_parameter',
          class_name: 'another_class'
        }
      ]
      addFetchedParameters(
        parameters_2,
        selectionOptions,
        selectionSelects,
        plotSpecification,
        dimensionsOptions,
        dummy
      )
      assert.deepEqual([...selectionOptions.keys()], [parameterKey])
      assert.equal(selectionOptions.get(parameterKey).value.length, 1)
      assert.equal(selectionOptions.get(parameterKey).value[0].label, 'another_parameter')
      assert.equal(selectionOptions.get(parameterKey).value[0].parents.length, 1)
      assert.equal(
        selectionOptions.get(parameterKey).value[0].parents[0].entityClass,
        'another_class'
      )
      assertParameterSelectionSelects(selectionSelects, selectionOptions.get(parameterKey))
      const expectedSpecification = { selection: { parameter: [] } }
      assert.deepEqual(plotSpecification, expectedSpecification)
      const expectedDimensionsOptions = ref([
        { label: 'Parameter', value: parameterKey, protected: true }
      ])
      assert.deepEqual(dimensionsOptions.value, expectedDimensionsOptions.value)
    })
  })

  describe('differingElements', function () {
    it('should filter elements properly', function () {
      const a = new Set([1, 2])
      const b = new Set([2, 3])
      const diff = differingElements(a, b)
      assert.deepEqual(diff, [1])
    })
  })

  describe('removeExcessSelections', function () {
    it('should remove object when entity class id matches', function () {
      const plotSpecification = { selection: { entity_class: [], [entityKey(0)]: ['my_object'] } }
      const selectionOptions = new Map()
      selectionOptions.set(entityKey(0), {
        value: [{ label: 'my_object', parents: [{ entityClass: 'my_class' }] }]
      })
      removeExcessSelections(plotSpecification, selectionOptions)
      assert.deepEqual(plotSpecification, { selection: { entity_class: [], [entityKey(0)]: [] } })
      assert.deepEqual(selectionOptions, new Map([[entityKey(0), { value: [] }]]))
    })
  })

  describe('revmoveExcessSelectionSelects', function () {
    it("should remove selects that don't have options", function () {
      const selectionSelects = {
        value: [
          { label: 'Object 1', options: [] },
          { label: 'Object 2', options: [{}] }
        ]
      }
      removeExcessSelectionSelects(selectionSelects)
      const expected = { value: [{ label: 'Object 2', options: [{}] }] }
      assert.deepEqual(selectionSelects, expected)
    })
    it("shouldn't remove entity class selects", function () {
      const selectionSelects = {
        value: [
          { label: 'Entity class', options: [] },
          { label: 'Object 1', options: [] },
          { label: 'Parameter', options: [] }
        ]
      }
      removeExcessSelectionSelects(selectionSelects)
      const expected = { value: [{ label: 'Entity class', options: [] }] }
      assert.deepEqual(selectionSelects, expected)
    })
  })

  describe('isEntityKey', function () {
    it('should accept the prefix followed by number', function () {
      assert.ok(isEntityKey('entity_3'))
    })
    it("should reject 'entity_class'", function () {
      assert.ok(!isEntityKey('entity_class'))
    })
  })
})
