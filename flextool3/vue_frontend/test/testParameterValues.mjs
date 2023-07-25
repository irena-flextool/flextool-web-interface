import assert from 'assert/strict'
import { objectify } from '../src/modules/parameterValues.mjs'

describe('objectify', function () {
  it('should work with column-style 1D map', function () {
    const map = {
      type: 'map',
      index_name: 'index 1',
      data: [
        ['a', 2.3],
        ['b', -2.3],
        ['c', 5.5]
      ]
    }
    const objectified = objectify(map, 'map', (name) => name)
    assert.deepEqual(objectified, [
      { 'index 1': 'a', y: 2.3 },
      { 'index 1': 'b', y: -2.3 },
      { 'index 1': 'c', y: 5.5 }
    ])
  })
  it('should work with column-style nested map', function () {
    const map = {
      type: 'map',
      index_type: 'str',
      index_name: 'index 1',
      data: [
        [
          'A',
          {
            type: 'map',
            index_type: 'str',
            index_name: 'index 2',
            data: [
              ['a', 2.3],
              ['b', -2.3]
            ]
          }
        ],
        [
          'B',
          {
            type: 'map',
            index_type: 'str',
            index_name: 'index 2',
            data: [['c', 5.5]]
          }
        ]
      ]
    }
    const objectified = objectify(map, 'map', (name) => name)
    assert.deepEqual(objectified, [
      { 'index 1': 'A', 'index 2': 'a', y: 2.3 },
      { 'index 1': 'A', 'index 2': 'b', y: -2.3 },
      { 'index 1': 'B', 'index 2': 'c', y: 5.5 }
    ])
  })
  it('uses index name transformation callback', function () {
    const map = {
      type: 'map',
      index_name: 'index 1',
      data: [['a', 2.3]]
    }
    const objectified = objectify(map, 'map', (name) => 'test_' + name)
    assert.deepEqual(objectified, [{ 'test_index 1': 'a', y: 2.3 }])
  })
  it('appends a depth number to unnamed index names to avoid ambiguities', function () {
    const map = {
      type: 'map',
      index_type: 'str',
      data: [
        [
          'A',
          {
            type: 'map',
            index_type: 'str',
            data: [['a', 2.3]]
          }
        ],
        [
          'B',
          {
            type: 'map',
            index_type: 'str',
            data: [['a', 5.5]]
          }
        ]
      ]
    }
    const objectified = objectify(map, 'map', (name) => name)
    assert.deepEqual(objectified, [
      { x_0: 'A', x_1: 'a', y: 2.3 },
      { x_0: 'B', x_1: 'a', y: 5.5 }
    ])
  })
})
