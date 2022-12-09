import {reactive} from "vue";
import dataForge from "data-forge";
import {
    entityClassKey,
    nameFromKey,
    objectKeyPrefix,
    parameterKey,
    scenarioKey,
    scenarioTimeStampKey
} from "./plotEditors.mjs";

const defaultConfig = {responsive: true, displaylogo: false}

let nextSpecificationId = 0;

const plotSpecifications = reactive({
    specifications: new Map(),

    get(identifier) {
        return this.specifications.get(identifier);
    },
    add(specification) {
        const identifier = nextSpecificationId;
        ++nextSpecificationId;
        this.specifications.set(identifier, specification);
        return identifier;
    },
    new() {
        return this.add(makeSpecification());
    },
    delete(identifier) {
        this.specifications.delete(identifier);
    },
    asArray() {
        const identifiers = [];
        for(const identifier of this.specifications.keys()) {
            identifiers.push(identifier);
        }
        identifiers.sort();
        const specifications = [];
        for(const identifier of identifiers) {
            specifications.push(this.specifications.get(identifier));
        }
        return specifications;
    },
});

/**Creates an empty plot specification.
 * @returns {object} Empty plot specification.
 */
function makeSpecification() {
    return {
        plot_type: "line",
        selection: {entity_class: [], parameter: []},
        dimensions: {
            separate_window: null,
            x1: null,
            x2: null,
            x3: null,
        },
    };
}

const protectedNames = new Set([entityClassKey, parameterKey, scenarioKey, scenarioTimeStampKey]);

/** Tests if name is parameter index name.
 * @param {string} name Name to test.
 * @returns {boolean} True if name is parameter index name, false otherwise.
 */
function isParameterIndexName(name) {
    return !protectedNames.has(name)  && !name.startsWith(objectKeyPrefix);
}

/**Creates a plot object for basic chart types.
 * @param {DataFrame} dataFrame Plot data.
 * @param {object} plotDimensions Plot dimensions specification.
 * @param {object} staticData Additional static plot data.
 * @param {object} staticLayout Additional static layout data.
 * @returns {object} Plot object.
 */
function makeBasicChart(dataFrame, plotDimensions, staticData={}, staticLayout={}) {
    const specialColumns = declareSpecialColumns(dataFrame, plotDimensions);
    const categoryColumns = makeCategoryColumns(specialColumns);
    let {lineWindows, plotTitle} = prepareForPlotting(dataFrame, categoryColumns, plotDimensions.separate_window);
    let subplot = null;
    if(plotDimensions.separate_window !== null) {
        subplot = makeSubplotData(lineWindows, plotDimensions.separate_window, specialColumns);
        lineWindows = subplot.lineWindows;
    }
    const data = [];
    for(const window of lineWindows) {
        let subplotData = {};
        if(subplot !== null) {
            const subplotCategory = subplot.windowSubplotCategories.splice(0, 1)[0];
            subplotData = subplot.windowSubplotData.get(subplotCategory);
        }
        const name = makeLineLabel(window, categoryColumns);
        const x = buildX(window, specialColumns);
        data.push({
            x: x,
            y: window.deflate((row) => row.y).toArray(),
            name: name,
            ...subplotData,
            ...staticData,
        });
    }
    const layout = {
        xaxis: {title: nameFromKey(specialColumns.x1)},
        ...(subplot !== null ? subplot.subplotLayout : {}),
        ...staticLayout,
    };
    if(plotTitle !== undefined) {
        layout.title = plotTitle;
    }
    const config = {...defaultConfig};
    return {
        data: data,
        layout: layout,
        config: config,
    };
}

/**Creates a plot object for heatmap chart types.
 * @param {DataFrame} dataFrame Plot data.
 * @param {object} plotDimensions Plot dimensions specification.
 * @returns {object} Plot object.
 */
function makeHeatmapChart(dataFrame, plotDimensions) {
    if(plotDimensions.separate_window !== null) {
        dataFrame = dataFrame.orderBy(row => row[plotDimensions.separate_window]);
    }
    const specialColumns = declareSpecialColumns(dataFrame, plotDimensions);
    const categoryColumns = makeCategoryColumns(specialColumns);
    dataFrame = padCategoriesByNulls(dataFrame, specialColumns);
    let {lineWindows, plotTitle} = prepareForPlotting(dataFrame, categoryColumns, plotDimensions.separate_window);
    let subplot = null;
    if(plotDimensions.separate_window !== null) {
        const windowSets = new Map();
        for(const window of lineWindows) {
            const subplotName = window.first()[plotDimensions.separate_window];
            if(!windowSets.has(subplotName)) {
                windowSets.set(subplotName, windowSets.size);
            }
        }
        subplot = makeSubplotData(lineWindows, plotDimensions.separate_window, specialColumns, {automargin: true});
        lineWindows = subplot.lineWindows;
    }
    const data = [];
    let currentCategory = null;
    let currentData = null;
    const subplotCategories = subplot !== null ? subplot.windowSubplotCategories : new Array(lineWindows.length);
    for(const window of lineWindows) {
        const subplotCategory = subplotCategories.splice(0, 1)[0];
        if(currentCategory !== subplotCategory) {
            currentCategory = subplotCategory;
            currentData = {
                x: buildX(window, specialColumns),
                y: [],
                z: [],
                type: "heatmap",
            };
            if(subplot !== null) {
                currentData = {
                    ...currentData,
                    ...subplot.windowSubplotData.get(subplotCategory),
                    coloraxis: "coloraxis",
                }
            }
            data.push(currentData);
        }
        currentData.y.push(makeLineLabel(window, categoryColumns));
        const heat = [];
        window.forEach(row => heat.push(row.y));
        currentData.z.push(heat);
    }
    if(data.length === 0) {
        data.push({
            x: [],
            y: [],
            z: [],
            type: "heatmap",
        });
    }
    let layout = {
        xaxis: {title: nameFromKey(specialColumns.x1)},
        yaxis: {automargin: true},
    };
    if(subplot !== null) {
        layout = {...layout, ...subplot.subplotLayout, coloraxis: {}};
    }
    if(plotTitle !== undefined) {
        layout.title = plotTitle;
    }
    const config = {...defaultConfig};
    return {
        data: data,
        layout: layout,
        config: config,
    };
}

/**Generates data needed to break plot into subplots.
 * @param {DataFrame[]} lineWindows Line window data frames.
 * @param {string} separateWindow Index name that divides the subplots.
 * @param {object} specialColumns Special columns.
 * @param {object} staticLayoutYAxis Additional static layout data for subplot y-axes.
 * @returns {object} Subplot data.
 */
function makeSubplotData(lineWindows, separateWindow, specialColumns, staticLayoutYAxis) {
    const separatedWindows = []
    const subplotLayout = {};
    const windowSubplotData = new Map();
    const windowSubplotCategories = [];
    const subplotAnnotations = [];
    for(const window of lineWindows) {
        const subplotCategory = window.first()[separateWindow];
        windowSubplotCategories.push(subplotCategory);
        if(!windowSubplotData.has(subplotCategory)) {
            const axisNumber = windowSubplotData.size + 1;
            windowSubplotData.set(subplotCategory, {xaxis: `x${axisNumber}`, yaxis: `y${axisNumber}`});
            subplotAnnotations.push({
                text: subplotCategory,
                showarrow: false,
                x: 0,
                y: 1.1,
                xref: `x${axisNumber} domain`,
                yref: `y${axisNumber} domain`,
            });
        }
        separatedWindows.push(window.dropSeries(separateWindow));
    }
    for(let i = 2; i != windowSubplotData.size + 1; ++i) {
        subplotLayout[`xaxis${i}`] = {title: nameFromKey(specialColumns.x1)};
        if(staticLayoutYAxis !== undefined) {
            subplotLayout[`yaxis${i}`] = {...staticLayoutYAxis};
        }
    }
    const columnCount = 2;
    subplotLayout.grid = {
        rows: Math.ceil(windowSubplotData.size / columnCount),
        columns: columnCount,
        pattern: "independent",
    };
    subplotLayout.annotations = subplotAnnotations;
    return {
        lineWindows: separatedWindows,
        subplotLayout: subplotLayout,
        windowSubplotData: windowSubplotData,
        windowSubplotCategories: windowSubplotCategories,
        subplotAnnotations: subplotAnnotations,
    };
}

/**Creates x data for plotting.
 * @param {DataFrame} dataFrame Data frame.
 * @param {object} specialColumns Special column definition.
 * @returns {Array} Plot x data.
 */
function buildX(dataFrame, specialColumns) {
    if(specialColumns.x2 !== undefined) {
        const x = [];
        if(specialColumns.x3 !== undefined) {
            const x2x3 = dataFrame.deflate((row) => `${row[specialColumns.x3]} / ${row[specialColumns.x2]}`).toArray();
            x.push(x2x3);
        }
        else {
            x.push(dataFrame.getSeries(specialColumns.x2).toArray());
        }
        x.push(dataFrame.getSeries(specialColumns.x1).toArray());
        return x;
    }
    return dataFrame.getSeries(specialColumns.x1).toArray();
}

/** Adds nulls to data frame to fill gaps between missing categories.
 * @param {DataFrame} dataFrame Data frame.
 * @param {object} specialColumns Special column definition.
 * @returns {DataFrame} Padded data frame.
 */
function padCategoriesByNulls(dataFrame, specialColumns) {
    const categoryDimensions = [specialColumns.x1, specialColumns.x2, specialColumns.x3].filter((d) => d !== undefined);
    if(categoryDimensions.length === 0) {
        return dataFrame;
    }
    const categoriesMatch = (category1, category2) => category1.every((c, i) => c === category2[i]);
    const categoryWindows = dataFrame.variableWindow(function(a, b) {
        return categoryDimensions.every((d) => a[d] === b[d]);
    });
    const batchCategories = [];
    for(const window of categoryWindows) {
        const categories = [];
        const firstRow = window.first();
        for(const dimension of categoryDimensions) {
            categories.push(firstRow[dimension]);
        }
        if(batchCategories.length === 0 || batchCategories.every((c) => !categoriesMatch(c, categories))) {
            batchCategories.push(categories);
        }
    }
    const batches = [];
    const seriesGenerator = {
        y: () => null,
    };
    const batchDefiningColumns = new Set(Object.values(specialColumns).filter((c) => c !== undefined));
    const windowCommonColumns = dataFrame.getColumnNames().slice(0, -1).filter((a) => !batchDefiningColumns.has(a));
    const windows = dataFrame.variableWindow(function(a, b) {
        for(const column of windowCommonColumns) {
            if(a[column] !== b[column]) {
                return false;
            }
        }
        return true;
    });
    const rowCategories = function(row) {
        const categories = [];
        for(const dimension of categoryDimensions) {
            categories.push(row[dimension]);
        }
        return categories;
    }
    for(const window of windows) {
        const categoriesBefore = rowCategories(window.first());
        const windowStartLoc = batchCategories.findIndex((c) => categoriesMatch(c, categoriesBefore));
        const preceding = batchCategories.slice(0, windowStartLoc);
        const headFrame = window.head(1);
        for(const precedingCategory of preceding) {
            for(const [i, dimension] of categoryDimensions.entries()) {
                seriesGenerator[dimension] = () => precedingCategory[i];
            }
            const batch = headFrame.generateSeries(seriesGenerator);
            batches.push(batch);
        }
        batches.push(window);
        const categoriesAfter = rowCategories(window.last());
        const windowEndLoc = batchCategories.findIndex((c) => categoriesMatch(c, categoriesAfter));
        const subsequent = batchCategories.slice(windowEndLoc + 1, batchCategories.length);
        const tailFrame = window.tail(1);
        for(const subsequentCategory of subsequent) {
            for(const [i, dimension] of categoryDimensions.entries()) {
                seriesGenerator[dimension] = () => subsequentCategory[i];
            }
            const batch = tailFrame.generateSeries(seriesGenerator);
            batches.push(batch);
        }
    }
    return dataForge.DataFrame.concat(batches);
}

/**Puts line label together.
 * @param {DataFrame} lineWindow Line data.
 * @param {Set} categoryColumns Category columns
 * @returns {string} Line label.
 */
function makeLineLabel(lineWindow, categoryColumns) {
    const firstRow = lineWindow.first();
    const nameParts = [];
    for(const column of lineWindow.getColumnNames().slice(0, -1)) {
        if(!categoryColumns.has(column)) {
            nameParts.push(firstRow[column]);
        }
    }
    return nameParts.join(" | ");
}

function distinctColumns(dataFrame) {
    let columns = dataFrame.getColumnNames();
    const distinct = new Map();
    for(const row of dataFrame) {
        const surviving = [];
        for(const column of columns) {
            if(column === "y") {
                continue;
            }
            const existing = distinct.get(column);
            if(existing === undefined) {
                distinct.set(column, row[column]);
                surviving.push(column);
            }
            else if(row[column] === existing) {
                surviving.push(column);
            }
        }
        columns = surviving;
        if(surviving.length === 0) {
            break;
        }
    }
    return columns;
}

/**Decides which columns are special.
 * @param {DataFrame} dataFrame Plot data.
 * @param {object} plotDimensions Plot dimensions specification.
 * @returns {object} Special columns.
 */
function declareSpecialColumns(dataFrame, plotDimensions) {
    const defaultX1 = dataFrame.getColumnNames().at(-2);
    const x1Column = plotDimensions.x1 !== null ? plotDimensions.x1 : defaultX1;
    const x2Column = plotDimensions.x2 !== null && plotDimensions.x2 !== x1Column ? plotDimensions.x2 : undefined;
    const x3Column = (x2Column !== undefined && plotDimensions.x3 !== null && plotDimensions.x3 !== x1Column) ? plotDimensions.x3 : undefined;
    return {x1: x1Column, x2: x2Column, x3: x3Column};
}

/**Creates category columns set.
 * @param {object} specialColumns Special columns.
 * @returns {Set} Category columns.
 */
function makeCategoryColumns(specialColumns) {
    const categoryColumns = new Set([specialColumns.x1, specialColumns.x2, specialColumns.x3].filter((c) => c !== undefined));
    return categoryColumns;
}

function filterDeselectedIndexNames(dataFrame, plotSelection) {
    const filterPassingIndexes = new Map();
    for(const indexName in plotSelection) {
        if(!isParameterIndexName(indexName)) {
            continue;
        }
        const selected = plotSelection[indexName];
        if(selected.length > 0) {
            filterPassingIndexes.set(indexName, new Set(selected));
        }
    }
    if(filterPassingIndexes.size > 0) {
        dataFrame = dataFrame.where(function(row) {
            for(const [indexName, selected] of filterPassingIndexes.entries()) {
                if(!selected.has(row[indexName])) {
                    return false;
                }
            }
            return true;
        });
    }
    return dataFrame;
}

/**Breaks data into lines.
 * @param {DataFrame} dataFrame Data frame to prepare.
 * @param {Set} categoryColumns Category columns.
 * @return {Array} Lines and plot title.
 */
function prepareForPlotting(dataFrame, categoryColumns, subplotTitleColumn) {
    const distinct = distinctColumns(dataFrame);
    let plotTitle = undefined;
    if(distinct.length > 0) {
        const actuallyNonDistinctColumns = new Set(categoryColumns);
        if(subplotTitleColumn !== undefined) {
            actuallyNonDistinctColumns.add(subplotTitleColumn);
        }
        for(const droppableColumn of actuallyNonDistinctColumns){
            const droppedIndex = distinct.indexOf(droppableColumn);
            if(droppedIndex >= 0) {
                distinct.splice(droppedIndex, 1);
            }
        }
        const names = [];
        for(const column of distinct) {
            names.push(dataFrame.first()[column]);
        }
        dataFrame = dataFrame.dropSeries(distinct);
        plotTitle = names.join(" | ")
    }
    const columns = dataFrame.getColumnNames().slice(0, -1).filter((name) => !categoryColumns.has(name));
    const lineWindows = dataFrame.variableWindow(function(a, b) {
        for(const column of columns) {
            if(a[column] !== b[column]) {
                return false;
            }
        }
        return true;
    });
    return {lineWindows: lineWindows, plotTitle: plotTitle};
}



export {
    filterDeselectedIndexNames,
    isParameterIndexName,
    makeBasicChart,
    makeHeatmapChart,
    plotSpecifications
};
