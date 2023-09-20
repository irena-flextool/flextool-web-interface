import assert from 'assert/strict'
import { singleAttributeNotEqual } from '../src/modules/comparison.mjs'

describe('comparisons module', function () {
  describe('singleAttributeNotEqual', function () {
    it('should return false when all attributes are equal', function () {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 2 }
      assert(!singleAttributeNotEqual(obj1, obj2, 'a'))
    })
    it('should return false when other attributes attributes are not equal', function () {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 4 }
      assert(!singleAttributeNotEqual(obj1, obj2, 'a'))
    })
    it('should return false when all attributes are not equal', function () {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 3, b: 4 }
      assert(!singleAttributeNotEqual(obj1, obj2, 'a'))
    })
    it('should return true when only selected attributes are equal', function () {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 3, b: 2 }
      assert(singleAttributeNotEqual(obj1, obj2, 'a'))
    })
  })
})
