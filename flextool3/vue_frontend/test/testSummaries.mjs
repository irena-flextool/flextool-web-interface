import assert from "assert/strict";
import {parseSummaries} from "../src/modules/summaries.mjs";

describe("parseSummaries", function() {
    it("should handle empty input", function() {
        const summaries = parseSummaries([]);
        assert.deepEqual(summaries, []);
    });
    it("should parse single summary correctly", function() {
        const summary = [
            ["Solve", "y2020"],
            [
                "Total cost obj. function (M CUR)",
                59546.4047356,
                "Minimized total system cost as given by the solver (includes all penalty costs)"
            ],
            [
                "Total cost calculated full horizon (M CUR)",
                59546.4047356,
                "Annualized operational, penalty and investment costs"
            ],
            [
                "Total cost calculated realized periods (M CUR)",
                29773.5447224
            ],
            [
                "Time in use in years",
                0.00547945205479,
                "The amount of time the solve includes - calculated in years"
            ],
            [],
            ["Emissions"],
            [
                "CO2 (Mt)",
                0.59568,
                "System-wide annualized CO2 emissions for all periods"
            ],
            [
                "CO2 (Mt)",
                0.29784,
                "System-wide annualized CO2 emissions for realized periods"
            ],
            [],
            ["Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)"],
            ["Created", "NodeA", "p2020", 6259.3],
            ["Created", "NodeA", "p2025", 6259.3],
            ["Created", "NodeB", "p2020", 79.569],
            ["Created", "NodeB", "p2025", 79.569],
            ["NonSync", "JustA", "p2020", 3298.2],
            ["NonSync", "JustA", "p2025", 3298.2],
        ];
        const summaries = parseSummaries(summary);
        assert.deepEqual(summaries, [{
            solve: "y2020",
            solveParameters: [
                {
                    name: "Total cost obj. function (M CUR)",
                    value: 59546.4047356,
                    description: "Minimized total system cost as given by the solver (includes all penalty costs)"
                },
                {
                    name: "Total cost calculated full horizon (M CUR)",
                    value: 59546.4047356,
                    description: "Annualized operational, penalty and investment costs",
                },
                {
                    name: "Total cost calculated realized periods (M CUR)",
                    value: 29773.5447224,
                    description: ""
                },
                {
                    name: "Time in use in years",
                    value: 0.00547945205479,
                    description: "The amount of time the solve includes - calculated in years"
                }
            ],
            emissionsParameters: [
                {
                    name: "CO2 (Mt)",
                    value: 0.59568,
                    description: "System-wide annualized CO2 emissions for all periods"
                },
                {
                    name: "CO2 (Mt)",
                    value: 0.29784,
                    description: "System-wide annualized CO2 emissions for realized periods"
                }
            ],
            issueTitle: "Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)",
            issues: [
                {
                    type: "Created",
                    node: "NodeA",
                    solve: "p2020",
                    value: 6259.3
                },
                {
                    type: "Created",
                    node: "NodeA",
                    solve: "p2025",
                    value:6259.3
                },
                {
                    type: "Created",
                    node: "NodeB",
                    solve: "p2020",
                    value: 79.569
                },
                {
                    type: "Created",
                    node: "NodeB",
                    solve: "p2025",
                    value: 79.569
                },
                {
                    type: "NonSync",
                    node: "JustA",
                    solve: "p2020",
                    value: 3298.2
                },
                {
                    type: "NonSync",
                    node: "JustA",
                    solve: "p2025",
                    value: 3298.2
                },
            ],
        }]);
    });
    it("should parse two summaries correctly", function() {
        const summary = [
            ["Solve", "y2020"],
            [
                "Total cost obj. function (M CUR)",
                59546.4047356,
                "Minimized total system cost as given by the solver (includes all penalty costs)"
            ],
            [],
            ["Emissions"],
            [
                "CO2 (Mt)",
                0.59568,
                "System-wide annualized CO2 emissions for all periods"
            ],
            [],
            ["Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)"],
            ["Created", "NodeA", "p2020", 6259.3],
            [],
            [],
            ["Solve", "y2030"],
            [
                "Total cost calculated full horizon (M CUR)",
                49690.7200264,
                "Annualized operational, penalty and investment costs"
            ],
            [],
            ["Emissions"],
            [
                "CO2 (Mt)",
                0.29784,
                "System-wide annualized CO2 emissions for realized periods"
            ],
            [],
            ["Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)"],
            ["NonSync", "JustA", "p2035", 3298.2],
        ];
        const summaries = parseSummaries(summary);
        assert.deepEqual(summaries, [
            {
                solve: "y2020",
                solveParameters: [
                    {
                        name: "Total cost obj. function (M CUR)",
                        value: 59546.4047356,
                        description: "Minimized total system cost as given by the solver (includes all penalty costs)"
                    },
                ],
                emissionsParameters: [
                    {
                        name: "CO2 (Mt)",
                        value: 0.59568,
                        description: "System-wide annualized CO2 emissions for all periods"
                    },
                ],
                issueTitle: "Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)",
                issues: [
                    {
                        type: "Created",
                        node: "NodeA",
                        solve: "p2020",
                        value: 6259.3
                    },
                ],
            },
            {
                solve: "y2030",
                solveParameters: [
                    {
                        name: "Total cost calculated full horizon (M CUR)",
                        value: 49690.7200264,
                        description: "Annualized operational, penalty and investment costs"
                    },
                ],
                emissionsParameters: [
                    {
                        name: "CO2 (Mt)",
                        value: 0.29784,
                        description: "System-wide annualized CO2 emissions for realized periods"
                    },
                ],
                issueTitle: "Possible issues (creating or removing energy/matter, creating inertia, changing non-synchronous generation to synchronous)",
                issues: [
                    {
                        type: "NonSync",
                        node: "JustA",
                        solve: "p2035",
                        value: 3298.2
                    },
                ],
            },
        ]);
    });
});
