import assert from "assert/strict";
import {toHeatMapData, toBasicChartData} from "../src/modules/plots.mjs";

function make_empty_heat_map_plot_data() {
    return {z: [], x: [], y:[], type: "heatmap"};
}

function make_empty_bar_chart_plot_data(names) {
    const charts = new Array(names.length);
    for(let i = 0; i != names.length; ++i) {
        charts[i] = {x: [], y: [], name: names[i], type: "bar"};
    }
    return charts;
}

describe("toHeatMapData", function() {
    it("should return empty plot data for empty input", function() {
        const data = [];
        const plotData = toHeatMapData(data, 0);
        const expected = make_empty_heat_map_plot_data();
        assert.deepEqual(plotData, expected);
    });
    it("should work with single data point", function() {
        const data = [["my_data", "T1", 2.3]];
        const plotData = toHeatMapData(data, 1);
        const expected = make_empty_heat_map_plot_data();
        expected.x = ["T1"];
        expected.y = ["my_data"];
        expected.z = [[2.3]];
        assert.deepEqual(plotData, expected);
    });
    it("should organize data correctly for regular plot", function() {
        const data = [
            ["data_1", "alt_1", "T1", 2.3],
            ["data_1", "alt_1", "T2", -2.3],
            ["data_1", "alt_2", "T1", 5.5],
            ["data_1", "alt_2", "T2", -5.5],
        ];
        const plotData = toHeatMapData(data, 2);
        const expected = make_empty_heat_map_plot_data();
        expected.x = ["T1", "T2"];
        expected.y = ["data_1 | alt_1", "data_1 | alt_2"];
        expected.z = [[2.3, -2.3], [5.5, -5.5]];
        assert.deepEqual(plotData, expected);
    });
    it("should fill holes in data by nulls", function() {
        const data = [
            ["data_1", "T1", 2.3],
            ["data_2", "T2", 5.5],
        ];
        const plotData = toHeatMapData(data, 1);
        const expected = make_empty_heat_map_plot_data();
        expected.x = ["T1", "T2"];
        expected.y = ["data_1", "data_2"];
        expected.z = [[2.3, null], [null, 5.5]];
        assert.deepEqual(plotData, expected);
    });
});

describe("toBasicChartData", function() {
    it("should return empty chart array for empty input", function() {
        const data = [];
        const plotData = toBasicChartData(data, 0, "bar");
        assert.equal(plotData.length, 0);
    });
    it("should work with single data point", function() {
        const data = [["data_1", "T1", 2.3]];
        const plotData = toBasicChartData(data, 1, "bar");
        const expected = make_empty_bar_chart_plot_data(["data_1"]);
        expected[0].x = ["T1"];
        expected[0].y = [2.3];
        assert.deepEqual(plotData, expected);
    });
    it("should organize data correctly for regular plot", function() {
        const data = [
            ["data_1", "alt_1", "T1", 2.3],
            ["data_1", "alt_2", "T1", 5.5],
            ["data_1", "alt_1", "T2", -2.3],
            ["data_1", "alt_2", "T2", -5.5],
        ];
        const plotData = toBasicChartData(data, 2, "bar");
        const expected = make_empty_bar_chart_plot_data(["data_1 | alt_1", "data_1 | alt_2"]);
        expected[0].x = ["T1", "T2"];
        expected[0].y = [2.3, -2.3];
        expected[1].x = ["T1", "T2"];
        expected[1].y = [5.5, -5.5];
        assert.deepEqual(plotData, expected);
    });
    it("should ignore holes in data", function() {
        const data = [
            ["data_1", "T1", 2.3],
            ["data_2", "T2", 5.5],
        ];
        const plotData = toBasicChartData(data, 1, "bar");
        const expected = make_empty_bar_chart_plot_data(["data_1", "data_2"]);
        expected[0].x = ["T1"];
        expected[0].y = [2.3];
        expected[1].x = ["T2"];
        expected[1].y = [5.5];
        assert.deepEqual(plotData, expected);
    });
});
