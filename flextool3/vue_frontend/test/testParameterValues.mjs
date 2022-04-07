import assert from "assert/strict";
import {tabulate} from "../src/modules/parameterValues.mjs";

describe("tabulate", function() {
    it("should convert an empty array into an empty table", function() {
        const array = {
            type: "array",
            data: [],
        };
        const table = tabulate(array, "array");
        assert.deepEqual(table, []);
    });
    it("should convert an array into table of indices and values", function() {
        const array = {
            type: "array",
            data: [2.3, -2.3, 5.5],
        };
        const table = tabulate(array, "array");
        assert.deepEqual(table, [[1, 2.3], [2, -2.3], [3, 5.5]]);
    });
    it("should convert an empty map into an empty table", function() {
        const map = {
            type: "map",
            data: [],
        };
        const table = tabulate(map, "map");
        assert.deepEqual(table, []);
    });
    it("should convert a double column style a map into a table of indices and values", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: [["a", 2.3], ["b", -2.3], ["c", 5.5]],
        };
        const table = tabulate(map, "map");
        assert.deepEqual(table, [["a", 2.3], ["b", -2.3], ["c", 5.5]]);
    });
    it("should convert a dictionary style a map into a table of indices and values", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: {"a": 2.3, "b": -2.3, "c": 5.5},
        };
        const table = tabulate(map, "map");
        assert.deepEqual(table, [["a", 2.3], ["b", -2.3], ["c", 5.5]]);
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
        const table = tabulate(map, "map");
        assert.deepEqual(table, [["A", "a", 2.3], ["A", "b", -2.3], ["B", "c", 5.5]]);
    });
    it("should correctly deal with mixed two column and dictionary style nested maps", function() {
        const map = {
            type: "map",
            index_type: "str",
            data: [
                ["A", {type: "map", index_type: "str", data: {"a": 2.3}}],
            ],
        };
        const table = tabulate(map, "map");
        assert.deepEqual(table, [["A", "a", 2.3]]);
    });
});
