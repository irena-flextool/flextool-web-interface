/**Flattens a Spine Map recursively.
 * @param {object} map Map to flatten.
 * @callback indexNameTransformation
 * @param {number} depth Current recursion depth.
 * @returns {object[]} Flattened Map.
 */
function flatDicts(map, indexNameTransformation, depth=0) {
    const dicts = [];
    const indexName = indexNameTransformation(map.index_name !== undefined ? map.index_name : `x_${depth}`);
    if(Array.isArray(map.data)) {
        for(const [x, y] of map.data) {
            const dict = {
                [indexName]: x,
            };
            if(y === null || typeof(y) !== "object") {
                dict["y"] = y;
                dicts.push(dict);
            }
            else {
                const nestedDicts = flatDicts(y, indexNameTransformation, depth + 1);
                for(const nested of nestedDicts) {
                    dicts.push({...dict, ...nested});
                }
            }
        }
    }
    else {
        for(const x in map.data) {
            const dict = {
                [indexName]: x,
            };
            const y = map.data[index];
            if(y === null || typeof(y) !== "object") {
                dict["y"] = y;
                dicts.push(dict);
            }
            else {
                const nestedDicts = flatDicts(y, indexNameTransformation, depth + 1);
                for(const nested of nestedDicts) {
                    dicts.push(...dict, ...nested);
                }
            }
        }
    }
    return dicts;
}


/**Turns parameter value into an array of objects.
 * @param {object} value Parameter value.
 * @param {string} type Value's type.
 * @callback indexNameTransformation Function to transform index names.
 * @returns {object[]} Value objects.
 */
function objectify(value, type, indexNameTransformation) {
    if(type !== "map") {
        throw new Error("Unknown parameter value type.");
    }
    return flatDicts(value, indexNameTransformation);
}

export {objectify};
