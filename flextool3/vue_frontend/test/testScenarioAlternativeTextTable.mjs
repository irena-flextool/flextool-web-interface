import assert from "assert/strict";
import {
    makeScenarioAlternativesTable,
    parseScenarioAlternatives,
    scenarioActions
} from "../src/modules/scenarioAlternativeTextTable.mjs";

describe("parseScenarioAlternatives", function () {
    it("should return empty Map for empty input text", function () {
        const scenarioAlternatives = parseScenarioAlternatives("");
        assert.equal(scenarioAlternatives.size, 0);
    });
    it("should parse single scenario entry correctly", function () {
        const scenarioAlternatives = parseScenarioAlternatives(
            "my_scenario alternative_1 alternative_2"
        );
        assert.deepEqual([...scenarioAlternatives], [["my_scenario", ["alternative_1", "alternative_2"]]]);
    });
    it("should ignore extra whitespace", function () {
        const scenarioAlternatives = parseScenarioAlternatives(
            " my_scenario  alternative_1 \t alternative_2"
        );
        assert.deepEqual([...scenarioAlternatives], [["my_scenario", ["alternative_1", "alternative_2"]]]);
    });
    it("should work also with scenarios without alternatives", function () {
        const scenarioAlternatives = parseScenarioAlternatives(
            "my_scenario"
        );
        assert.deepEqual([...scenarioAlternatives], [["my_scenario", []]]);
    });
});

describe("makeScenarioAlternativesTable", function () {
    it("should generate empty table when there are no scenarios", function () {
        const text = makeScenarioAlternativesTable([]);
        assert.equal(text, "");
    });
    it("should generate correct line for scenario with alternatives", function () {
        const text = makeScenarioAlternativesTable([{
            scenarioName: "my_scenario",
            scenarioAlternatives: ["alternative_1", "alternative_2"]
        }]);
        assert.equal(text, "my_scenario alternative_1 alternative_2");
    });
    it("should generate a single line for each scenario and its alternatives", function () {
        const text = makeScenarioAlternativesTable([
            {
                scenarioName: "scenario_1",
                scenarioAlternatives: ["alternative_1", "alternative_2"]
            },
            {
                scenarioName: "scenario_2",
                scenarioAlternatives: ["alternative_3", "alternative_2"]
            },
        ]);
        assert.equal(text, "scenario_1 alternative_1 alternative_2\nscenario_2 alternative_3 alternative_2");
    });
});

describe("scenarioActions", function () {
    it("should return empty actions when inputs are empty", function () {
        const actions = scenarioActions(new Map(), []);
        assert.deepEqual(actions, { inserted: [], deleted: [] });
    });
    it("should delete missing scenario", function () {
        const actions = scenarioActions(new Map(), [{
            scenarioName: "my_scenario",
            scenarioId: 66,
            scenarioAlternatives: ["my_alternative"]
        }]);
        assert.deepEqual(actions, { inserted: [], deleted: [{ scenarioId: 66, scenarioName: "my_scenario" }] })
    });
    it("should insert a new scenario", function () {
        const scenarioAlternatives = new Map();
        scenarioAlternatives.set("my_scenario", ["my_alternative"]);
        const actions = scenarioActions(scenarioAlternatives, []);
        assert.deepEqual(actions, {
            inserted: [{
                scenarioName: "my_scenario",
                scenarioAlternatives: ["my_alternative"]
            }], deleted: []
        })
    });
    it("should insert a new scenario also when there are existing scenarios", function () {
        const scenarioAlternatives = new Map();
        scenarioAlternatives.set("existing", ["Base"]);
        scenarioAlternatives.set("my_scenario", ["my_alternative"]);
        const actions = scenarioActions(scenarioAlternatives, [{
            scenarioName: "existing", scenarioId: 66, scenarioAlternatives: ["Base"]
        }]);
        assert.deepEqual(actions, {
            inserted: [{
                scenarioName: "my_scenario",
                scenarioAlternatives: ["my_alternative"]
            }], deleted: []
        })
    });
    it("should reinsert an updated scenario", function () {
        const scenarioAlternatives = new Map();
        scenarioAlternatives.set("my_scenario", ["alternative_1", "alternative_2"]);
        const actions = scenarioActions(scenarioAlternatives, [{
            scenarioName: "my_scenario",
            scenarioId: 66,
            scenarioAlternatives: ["my_alternative"]
        }]);
        assert.deepEqual(actions, {
            inserted: [{
                scenarioName: "my_scenario",
                scenarioAlternatives: ["alternative_1", "alternative_2"],
                scenarioId: 66,
            }], deleted: []
        })
    });
});
