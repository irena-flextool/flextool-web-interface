function tabulateArray(array) {
    return array.data.map((x, i) => [i + 1, x]);
}

function assignToTable(table, index, value) {
    if(value === null || typeof(value) !== "object") {
        table.push([index, value]);
    }
    else {
        const subTable = mapToTable(value.data);
        for(const subRow of subTable) {
            table.push([index, ...subRow]);
        }
    }
}

function mapToTable(mapData) {
    const table = new Array();
    if(Array.isArray(mapData)) {
        for(const row of mapData) {
            const index = row[0];
            const value = row[1];
            assignToTable(table, index, value);
        }
    }
    else {
        for(const index in mapData) {
            const value = mapData[index];
            assignToTable(table, index, value);
        }
    }
    return table;
}

function tabulateMap(map) {
    return mapToTable(map.data);
}

function arrayIndexName(array) {
    if(array.index_name !== undefined) {
        return [array.index_name];
    }
    else {
        return ["x"];
    }
}

function mapIndexNames(map, current = [], depth = 0) {
    depth += 1;
    if(current.length < depth) {
        current.push(map.index_name !== undefined ? map.index_name : "x");
    }
    if(Array.isArray(map.data)) {
        for(const row of map.data) {
            const value = row[1];
            if(value !== null && typeof(value) === "object") {
                current = mapIndexNames(value, current, depth);
            }
        }
    }
    else {
        for(const index in map.data) {
            const value = map.data[index];
            if(value !== null && typeof(value) === "object") {
                current = mapIndexNames(value, current, depth);
            }
        }
    }
    return current;
}

function tabulate(value, type) {
    if(type === "array") {
        return {indexNames: arrayIndexName(value), table: tabulateArray(value)};
    }
    else if(type === "map") {
        return {indexNames: mapIndexNames(value), table: tabulateMap(value)};
    }
    throw new Error("Unknown parameter value type.");
}

export {tabulate};
