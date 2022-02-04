/**
 * Converts string to appropriate single value.
 * @param {string} value Value as string.
 * @returns {?string|number} Converted value, e.g. a number, null or the original string.
 */
function singleValueFromString(value) {
    if(!value.trim()) {
        return null;
    }
    const number = parseFloat(value);
    if(isNaN(number)) {
        if(value.toUpperCase() === "NAN") {
            return number;
        }
        return value;
    }
    return number;
}

export {singleValueFromString};
