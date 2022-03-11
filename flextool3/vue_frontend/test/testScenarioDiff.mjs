import assert from "assert/strict";
import {ScenarioDiff} from "../src/modules/scenarioDiff.mjs";

function makeEmptyCommitData() {
    return {
        insertions: {
            alternative: [],
            scenario: [],
            scenario_alternative: [],
        },
        updates: {
            alternative: [],
        },
        deletions: {
            alternative: [],
            scenario: [],
        },
    };
}

describe("ScenarioDiff", function() {
    describe("isPending", function() {
        it("should return false initially", function() {
            const diff = new ScenarioDiff();
            assert.equal(diff.isPending(), false);
        });
    });
    describe("makeCommitData", function() {
        it("should return correctly structured empty commit data when nothing is pending", function() {
            const diff = new ScenarioDiff();
            const expected = makeEmptyCommitData();
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("insertAlternative", function() {
        it("should generate valid commit data for insertion", function() {
            const diff = new ScenarioDiff();
            diff.insertAlternative("my_alternative");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.alternative.push({"name": "my_alternative"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("updateAlternative", function() {
        it("should generate valid update data for existing alternative", function() {
            const diff = new ScenarioDiff();
            diff.updateAlternative("my_alternative", 23, "renamed");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.updates.alternative.push({"id": 23, "name": "renamed"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should rename an insertion when inserted alternative is updated", function() {
            const diff = new ScenarioDiff();
            diff.insertAlternative("my_alternative")
            diff.updateAlternative("my_alternative", undefined, "renamed");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.alternative.push({"name": "renamed"});
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("deleteAlternative", function() {
        it("should generate valid deletion data for existing alternative", function() {
            const diff = new ScenarioDiff();
            diff.deleteAlternative(23, "my_alternative");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.alternative.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate valid deletion data for updated existing alternative", function() {
            const diff = new ScenarioDiff();
            diff.updateAlternative("my_alternative", 23, "renamed")
            diff.deleteAlternative(23, "renamed");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.alternative.push(23);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should remove inserted alternative when it gets deleted", function() {
            const diff = new ScenarioDiff();
            diff.insertAlternative("my_alternative");
            diff.deleteAlternative(undefined, "my_alternative");
            assert.equal(diff.isPending(), false);
        });
    });
    describe("deleteScenario", function() {
        it("should generate valid deletion data for existing scenario", function() {
            const diff = new ScenarioDiff();
            diff.deleteScenario(66, "my_scenario");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.scenario.push(66);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should remove inserted scenario", function() {
            const diff = new ScenarioDiff();
            diff.insertScenarioAlternatives(undefined, "my_scenario", ["my_alternative"]);
            diff.deleteScenario(undefined, "my_scenario");
            assert.equal(diff.isPending(), false);
            const expected = makeEmptyCommitData();
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should not generate scenario alternative commit when existing scenario is deleted", function() {
            const diff = new ScenarioDiff();
            diff.insertScenarioAlternatives(66, "my_scenario", ["alternative_1", "alternative_2"]);
            diff.deleteScenario(66, "my_scenario");
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.scenario.push(66);
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
    describe("insertScenarioAlternative", function() {
        it("should generate valid insertion and deletion commit for existing scenario", function() {
            const diff = new ScenarioDiff();
            diff.insertScenarioAlternatives(66, "my_scenario", ["alternative_1", "alternative_2"]);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.deletions.scenario.push(66);
            expected.insertions.scenario.push({name: "my_scenario"});
            expected.insertions.scenario_alternative.push({
                scenario_name: "my_scenario",
                alternative_name: "alternative_1",
                rank: 0,
            });
            expected.insertions.scenario_alternative.push({
                scenario_name: "my_scenario",
                alternative_name: "alternative_2",
                rank: 1,
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
        it("should generate valid insertion commit for scenario as well", function() {
            const diff = new ScenarioDiff();
            diff.insertScenarioAlternatives(undefined, "my_scenario", ["alternative_1", "alternative_2"]);
            assert.equal(diff.isPending(), true);
            const expected = makeEmptyCommitData();
            expected.insertions.scenario.push({name: "my_scenario"});
            expected.insertions.scenario_alternative.push({
                scenario_name: "my_scenario",
                alternative_name: "alternative_1",
                rank: 0,
            });
            expected.insertions.scenario_alternative.push({
                scenario_name: "my_scenario",
                alternative_name: "alternative_2",
                rank: 1,
            });
            assert.deepEqual(diff.makeCommitData(), expected);
        });
    });
});
