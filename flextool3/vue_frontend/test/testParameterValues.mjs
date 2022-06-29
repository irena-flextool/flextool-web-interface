import assert from "assert/strict";
import {tabulate} from "../src/modules/parameterValues.mjs";

describe("tabulate", function() {
    it("should convert an empty array into an empty table", function() {
        const array = {
            type: "array",
            data: [],
        };
        const tabulated = tabulate(array, "array");
        assert.deepEqual(tabulated, {indexNames: ["x"], table: []});
    });
    it("should convert an array into table of indices and values", function() {
        const array = {
            type: "array",
            data: [2.3, -2.3, 5.5],
        };
        const tabulated = tabulate(array, "array");
        assert.deepEqual(tabulated, {indexNames: ["x"], table: [[1, 2.3], [2, -2.3], [3, 5.5]]});
    });
    it("should convert an empty map into an empty table", function() {
        const map = {
            type: "map",
            data: [],
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {indexNames: ["x"], table: []});
    });
    it("should convert a double column style map into a table of indices and values", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: [["a", 2.3], ["b", -2.3], ["c", 5.5]],
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {indexNames: ["x"], table: [["a", 2.3], ["b", -2.3], ["c", 5.5]]});
    });
    it("should convert a dictionary style a map into a table of indices and values", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: {"a": 2.3, "b": -2.3, "c": 5.5},
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {indexNames: ["x"], table: [["a", 2.3], ["b", -2.3], ["c", 5.5]]});
    });
    it("should convert a double column style nested map into a table with sufficient depth", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: [
                ["A", {type: "map", index_type: "str", data: [
                    ["a", 2.3],
                    ["b", -2.3],
                ]}],
                ["B", {type: "map", index_type: "str", data: [
                    ["c", 5.5],
                ]}],
            ],
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {
            indexNames: ["x", "x"],
            table: [["A", "a", 2.3], ["A", "b", -2.3], ["B", "c", 5.5]]
        });
    });
    it("should correctly deal with mixed two column and dictionary style nested maps", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: [
                ["A", {type: "map", index_type: "str", data: {"a": 2.3}}],
            ],
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {indexNames: ["x", "x"], table: [["A", "a", 2.3]]});
    });
    it("should read index names from mixed style nested map", function() {
        const map = {
            type: "map",
            index_type: "str",
            index_name: "dimension_1",
            data: [
                ["A", {type: "map", index_name: "dimension_2", index_type: "str", data: {"a": 2.3}}],
            ],
        };
        const tabulated = tabulate(map, "map");
        assert.deepEqual(tabulated, {indexNames: ["dimension_1", "dimension_2"], table: [["A", "a", 2.3]]});
    });
    it("should read index name of an array", function() {
        const array = {
            type: "array",
            index_name: "dimension_1",
            data: [2.3],
        };
        const tabulated = tabulate(array, "array");
        assert.deepEqual(tabulated, {indexNames: ["dimension_1"], table: [[1, 2.3]]});
    });
});
