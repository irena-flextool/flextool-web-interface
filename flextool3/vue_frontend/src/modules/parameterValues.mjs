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

function tabulate(value, type) {
    if(type === "array") {
        return tabulateArray(value);
    }
    else if(type === "map") {
        return tabulateMap(value);
    }
    throw new Error("Unknown parameter value type.");
}

export {tabulate};
