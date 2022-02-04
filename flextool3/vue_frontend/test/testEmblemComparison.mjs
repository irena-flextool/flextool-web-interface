import assert from "assert/strict";
import {emblemsEqual, relationshipEmblemsEqual} from "../src/modules/emblemComparison.mjs";

describe("emblemsEqual", function() {
    it("same object names are equal", function() {
        assert.equal(emblemsEqual("a", "a"), true);
    });
    it("different object names are unequal", function() {
        assert.equal(emblemsEqual("a", "b"), false);
    });
    it("same relationship objects are equal", function() {
        assert.equal(emblemsEqual(["a", "b"], ["a", "b"]), true);
    });
    it("different relationship objects are unequal", function() {
        assert.equal(emblemsEqual(["a", "b"], ["a", "c"]), false);
    });
});

describe("relationshipEmblemsEqual", function() {
    it("same relationship objects are equal", function() {
        assert.equal(relationshipEmblemsEqual(["a", "b"], ["a", "b"]), true);
    });
    it("different relationship objects are unequal", function() {
        assert.equal(relationshipEmblemsEqual(["a", "b"], ["a", "c"]), false);
    });
});
