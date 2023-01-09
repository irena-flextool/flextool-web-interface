const insert = Symbol("insert action");
const del = Symbol("delete action");
const update = Symbol("update action");

class PendingAlternative {
    constructor(action, originalName = undefined, id = undefined) {
        this.action = action;
        this.originalName = originalName;
        this.id = id;
    }
}

class PendingScenario {
    constructor(action, id = undefined) {
        this.action = action;
        this.id = id;
        this.scenarioAlternatives = undefined;
    }
}

class pendingScenarioAlternative {
    constructor(action) {
        this.action = action;
    }
}

/** Store for uncommitted changes to alternatives, scenarios and scenario alternatives.*/
class ScenarioDiff {
    #pendingAlternatives
    #pendingScenarios

    constructor() {
        this.#pendingAlternatives = new Map();
        this.#pendingScenarios = new Map();
    }

    makeCommitData() {
        const alternativeInsertions = [];
        const alternativeUpdates = [];
        const alternativeDeletions = [];
        this.#pendingAlternatives.forEach(function (pending, name) {
            const action = pending.action;
            if (action === insert) {
                alternativeInsertions.push({ name: name });
            }
            else if (action === update) {
                alternativeUpdates.push({ id: pending.id, name: name });
            }
            else if (action === del) {
                alternativeDeletions.push(pending.id);
            }
        });
        const scenarioInsertions = [];
        const scenarioDeletions = [];
        const scenarioAlternativeInsertions = [];
        this.#pendingScenarios.forEach(function (pending, name) {
            if (pending.action === insert) {
                scenarioInsertions.push({ name: name });
                if (pending.scenarioAlternatives) {
                    if (pending.id !== undefined) {
                        scenarioDeletions.push(pending.id);
                    }
                    pending.scenarioAlternatives.forEach(function (alternativeName, rank) {
                        scenarioAlternativeInsertions.push({
                            scenario_name: name,
                            alternative_name: alternativeName,
                            rank: rank,
                        });
                    });
                }
            }
            else if (pending.action === del) {
                scenarioDeletions.push(pending.id)
            }
        });
        return {
            insertions: {
                alternative: alternativeInsertions,
                scenario: scenarioInsertions,
                scenario_alternative: scenarioAlternativeInsertions,
            },
            updates: {
                alternative: alternativeUpdates,
            },
            deletions: {
                alternative: alternativeDeletions,
                scenario: scenarioDeletions,
            },
        };
    }

    /**
     * Checks if there are uncommitted changes.
     * @returns {boolean} true if there are uncommitted changes, false otherwise.
     */
    isPending() {
        return this.#pendingAlternatives.size > 0 || this.#pendingScenarios.size > 0;
    }

    /** Resets uncommitted changes. */
    clearPending() {
        this.#pendingAlternatives.clear();
        this.#pendingScenarios.clear();
    }

    insertAlternative(name) {
        this.#pendingAlternatives.set(name, new PendingAlternative(insert));
    }

    updateAlternative(previousName, id, name) {
        let pendingAlternative = this.#pendingAlternatives.get(previousName);
        if (pendingAlternative === undefined) {
            pendingAlternative = new PendingAlternative(update, previousName, id);
        }
        else {
            this.#pendingAlternatives.delete(previousName);
        }
        if (name !== pendingAlternative.originalName) {
            this.#pendingAlternatives.set(name, pendingAlternative);
        }
    }

    deleteAlternative(id, name) {
        const pendingAlternative = this.#pendingAlternatives.get(name);
        if (pendingAlternative === undefined) {
            this.#pendingAlternatives.set(name, new PendingAlternative(del, name, id));
        }
        else {
            if (pendingAlternative.action === insert) {
                this.#pendingAlternatives.delete(name);
            }
            else {
                this.#pendingAlternatives.delete(name);
                const originalName = pendingAlternative.originalName;
                this.#pendingAlternatives.set(originalName, new PendingAlternative(del, originalName, id));
            }
        }
    }

    deleteScenario(id, name) {
        const pendingScenario = this.#pendingScenarios.get(name);
        if (pendingScenario !== undefined) {
            if (pendingScenario.id === undefined) {
                this.#pendingScenarios.delete(name);
            }
            else {
                pendingScenario.action = del;
                pendingScenario.id = id;
                pendingScenario.scenarioAlternatives = undefined;
            }
        }
        else {
            this.#pendingScenarios.set(name, new PendingScenario(del, id));
        }
    }

    insertScenarioAlternatives(scenarioId, scenarioName, alternativeNames) {
        let pendingScenario = this.#pendingScenarios.get(scenarioName);
        if (pendingScenario === undefined) {
            pendingScenario = new PendingScenario(insert, scenarioId);
            this.#pendingScenarios.set(scenarioName, pendingScenario);
        }
        else {
            pendingScenario.action = insert;
        }
        pendingScenario.scenarioAlternatives = [...alternativeNames];
    }
}

export { ScenarioDiff };
