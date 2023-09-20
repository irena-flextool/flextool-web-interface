/**Test if a single attribute between two objects differs.
 * @param {object} obj1 First object.
 * @param {object} obj2 Second object.
 * @param {string} attribute Name of attribute that is expected to differ.
 * @return {boolean} True if only the given attribute differs, False otherwise.
 */
function singleAttributeNotEqual(obj1, obj2, attribute) {
  if (obj1[attribute] === obj2[attribute]) {
    return false
  }
  for (const [key, value1] of Object.entries(obj1)) {
    if (key === attribute) {
      continue
    }
    if (value1 !== obj2[key]) {
      return false
    }
  }
  return true
}

export { singleAttributeNotEqual }
