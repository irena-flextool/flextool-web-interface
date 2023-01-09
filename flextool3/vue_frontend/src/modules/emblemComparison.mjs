/**
 * Compares two entity emblems for equality.
 * @param {[string, string[]]} emblem1 First emblem to compare.
 * @param {[string, string[]]} emblem2 Second emblem to compare.
 * @returns {boolean} True if emblems are equal, false otherwise.
 */
function emblemsEqual(emblem1, emblem2) {
    if (typeof emblem1 === "string") {
        return emblem1 === emblem2;
    }
    else {
        return relationshipEmblemsEqual(emblem1, emblem2);
    }
}

/**
 * Compares two relationship emblems for equality.
 * @param {string[]} emblem1 First emblem to compare.
 * @param {string[]} emblem2 Second emblem to compare.
 * @returns {boolean} True if emblems are equal, false otherwise.
 */
function relationshipEmblemsEqual(emblem1, emblem2) {
    for (let i = 0; i !== emblem1.length; ++i) {
        if (emblem1[i] !== emblem2[i]) {
            return false;
        }
    }
    return true;
}

export { emblemsEqual, relationshipEmblemsEqual };
