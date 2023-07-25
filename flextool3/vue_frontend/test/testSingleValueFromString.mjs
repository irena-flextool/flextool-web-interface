import assert from 'assert/strict'
import { singleValueFromString } from '../src/modules/singleValueFromString.mjs'

describe('singleValueFromString', function () {
  it('should return plain string as-is', function () {
    assert.equal(singleValueFromString('a'), 'a')
  })
  it('should convert string to number when possible', function () {
    assert.equal(singleValueFromString('1'), 1)
  })
  it("should convert 'NaN' to not-a-number", function () {
    assert.equal(singleValueFromString('nan'), NaN)
  })
})
