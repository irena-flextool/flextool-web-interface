/**
 * Extracts scenarios and scenario alternatives from a text table.
 * @param {string} text A wall of text.
 * @returns {Map} Arrays of alternative names keyed by scenario name.
 */
function parseScenarioAlternatives(text) {
    const scenarioAlternatives = new Map();
    text.split("\n").forEach(function (line) {
        line = line.trim();
        if (line) {
            const items = line.split(/\s+/);
            const scenario = items.shift();
            if (scenarioAlternatives.has(scenario)) {
                throw new Error(`Duplicate scenario '${scenario}'`);
            }
            scenarioAlternatives.set(scenario, items);
        }
    });
    return scenarioAlternatives;
}

/**
 * Creates table text from original scenarios.
 * @param {object[]} scenarios Original scenarios.
 * @returns {string} Scenario alternatives text table.
 */
function makeScenarioAlternativesTable(scenarios) {
    const lines = [];
    scenarios.forEach(function (scenario) {
        const line = scenario.scenarioName + " " + scenario.scenarioAlternatives.join(" ");
        lines.push(line);
    });
    return lines.join("\n");
}

/**
 * Compares parsed scenarios to original ones and decides required actions.
 * @param {Map} scenarioAlternatives Arrays of alternative names keyed by scenario name.
 * @param {object[]} originalScenarios Existing scenarios and scenario alternatives.
 * @returns {object}: Scenario insertions and deletions.
 */
function scenarioActions(scenarioAlternatives, originalScenarios) {
    const original = new Map();
    originalScenarios.forEach(function (scenario) {
        original.set(scenario.scenarioName, scenario)
    });
    const inserted = [];
    scenarioAlternatives.forEach(function (alternatives, scenarioName) {
        const originalScenario = original.get(scenarioName);
        if (originalScenario === undefined) {
            if (alternatives) {
                inserted.push({
                    scenarioName: scenarioName,
                    scenarioAlternatives: alternatives
                });
            }
            else {
                inserted.push({ name: scenarioName });
            }
        }
        else {
            let match = false;
            if (alternatives.length === originalScenario.scenarioAlternatives.length) {
                match = alternatives.every(function (alternative, index) {
                    return alternative == originalScenario.scenarioAlternatives[index];
                });
            }
            if (!match) {
                inserted.push({
                    scenarioName: scenarioName,
                    scenarioId: originalScenario.scenarioId,
                    scenarioAlternatives: alternatives,
                });
            }
        }
    });
    const deleted = [];
    for (const originalScenario of originalScenarios) {
        if (!scenarioAlternatives.has(originalScenario.scenarioName)) {
            deleted.push({ scenarioId: originalScenario.scenarioId, scenarioName: originalScenario.scenarioName });
        }
    }
    return { inserted: inserted, deleted: deleted };
}

export { makeScenarioAlternativesTable, parseScenarioAlternatives, scenarioActions };
