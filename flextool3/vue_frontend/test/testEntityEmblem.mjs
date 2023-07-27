import assert from 'assert/strict'
import { emblemToName, relationshipName } from '../src/modules/entityEmblem.mjs'

describe('entityEmblem module', function () {
  describe('emblemToName', function () {
    it('should return object name as is', function () {
      const name = emblemToName('my_class', 'my_object')
      assert.equal(name, 'my_object')
    })
    it('should combine class name and object names to a relationship name', function () {
      const name = emblemToName('my_class', ['object_1', 'object_2'])
      assert.equal(name, 'my_class_object_1__object_2')
    })
  })

  describe('relationshipName', function () {
    it('should combine class name and object names to a relationship name', function () {
      const name = relationshipName('my_class', ['object_1', 'object_2'])
      assert.equal(name, 'my_class_object_1__object_2')
    })
  })
})
