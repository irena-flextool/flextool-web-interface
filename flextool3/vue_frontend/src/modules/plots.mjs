/**
 * Converts an input data row into y index for heat maps.
 * @param {Array} row Input data row.
 * @param {number} xColumn Column index that is taken as the x axis.
 */
function rowToName(row, xColumn) {
    const head = row.slice(0, xColumn);
    const tail = row.slice(xColumn + 1, -1)
    return head.concat(tail).join(" | ");
}

/**
 * Creates a square 2D array of nulls.
 * @param {number} width Array width.
 * @param {number} height Array height.
 * @returns {Array[]} 2D array filled with nulls.
 */
function nulls(width, height) {
    const a = new Array(height);
    for(let i = 0; i != a.length; ++i) {
        a[i] = new Array(width).fill(null);
    }
    return a;
}

/**
 * Groups data.
 * @param {Array[]} data Input data; each element is an Array in the form [index1, index2, ..., value].
 * @param {number} xColumn Column index in data that contains the x axis.
 * @returns {Object} Grouped data.
 */
function groupData(data, xColumn) {
    const grouped = new Map();
    const allNames = new Set();
    const allX = new Set();
    data.forEach(function(row) {
        const y = row.at(-1);
        const x = row[xColumn]
        allX.add(x);
        const name = rowToName(row, xColumn);
        allNames.add(name);
        let group = grouped.get(x);
        if(group === undefined) {
            group = new Map();
            grouped.set(x, group);
        }
        group.set(name, y)
    });
    return {namesSize: allNames.size, xSize: allX.size, grouped: grouped};
}

/**
 * Converts data into Plotly-compatible heat map data.
 * @param {Array[]} data Input data; each element is an Array in the form [index1, index2, ..., value].
 * @param {number} xColumn Column index in data that is taken as the x axis.
 * @returns {Object} Heat map data for plotly.
 */
function toHeatMapData(data, xColumn) {
    const groupedData = groupData(data, xColumn);
    const grouped = groupedData.grouped;
    const xSize = groupedData.xSize;
    const ySize = groupedData.namesSize;
    const xs = [];
    const xIndices = new Map();
    const ys = [];
    const yIndices = new Map();
    const zs = nulls(xSize, ySize);
    grouped.forEach(function(group, x) {
        let xIndex = xIndices.get(x);
        if(xIndex === undefined) {
            xIndex = xIndices.size;
            xIndices.set(x, xIndex);
        }
        xs[xIndex] = x;
        group.forEach(function(z, y) {
            let yIndex = yIndices.get(y);
            if(yIndex === undefined) {
                yIndex = yIndices.size;
                yIndices.set(y, yIndex);
            }
            ys[yIndex] = y;
            zs[yIndex][xIndex] = z;
        });
    });
    return {z: zs, x: xs, y: ys, type: "heatmap"};
}

/**
 * Converts data into Plotly-compatible bar chart or scatter data.
 * @param {Array[]} data Input data; each element is an Array in the form [index1, index2, ..., value].
 * @param {number} xColumn Column index in data that is taken as the x axis.
 * @param {string} plotType "scatter" or "bar".
 * @returns {Object} Bar chart data for plotly.
 */
function toBasicChartData(data, xColumn, plotType) {
    const groupedData = groupData(data, xColumn);
    const charts = new Map();
    groupedData.grouped.forEach(function(group, x) {
        group.forEach(function(y, name) {
            let chart = charts.get(name);
            if(chart === undefined) {
                chart = {x: [], y: [], name: name, type: plotType};
                charts.set(name, chart);
            }
            chart.x.push(x);
            chart.y.push(y);
        });
    });
    return [...charts.values()];
}

export {toBasicChartData, toHeatMapData};
