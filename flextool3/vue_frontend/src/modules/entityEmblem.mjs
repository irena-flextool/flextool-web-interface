/**
 * Generates name for a relationship
 * @param {string} className Relationship class name.
 * @param {string[]} emblem Relationship's entity emblem.
 * @returns {string} Relationship name.
 */
function relationshipName(className, emblem) {
    return className + "_" + emblem.join("__");
}

/**
 * Converts entity emblem to entity name.
 * @param {string} className Entity class name.
 * @param {(string|string[])} emblem Entity emblem.
 * @returns {string} Entity's name.
 */
function emblemToName(className, emblem) {
    if(typeof emblem === "string") {
        return emblem;
    }
    else {
        return relationshipName(className, emblem);
    }
}

export {emblemToName, relationshipName};