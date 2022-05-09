function parseSummaries(summaries) {
    const makeCurrent = function() {
        return {
            solve: null,
            solveParameters: [],
            emissionsParameters: [],
            issueTitle: null,
            issues: []
        };
    };
    const parsed = [];
    let summaryPart = 0;
    let current = makeCurrent();
    let currentAddedToParsed = false;
    summaries.forEach(function(row, index) {
        if(!currentAddedToParsed) {
            parsed.push(current);
            currentAddedToParsed = true;
        }
        if(row.length === 0) {
            ++summaryPart;
            if(summaryPart === 4) {
                summaryPart = 0;
                current = makeCurrent();
                currentAddedToParsed = false;
            }
        }
        else {
            if(summaryPart === 0) {
                if(row[0] === "Solve") {
                    current.solve = row[1];
                }
                else {
                    const parameters = {
                        name: row[0],
                        value: row[1],
                        description: row.length === 3 ? row[2] : "",
                    };
                    current.solveParameters.push(parameters);
                }
            }
            else if(summaryPart === 1) {
                if(row[0] !== "Emissions") {
                    const parameters = {
                        name: row[0],
                        value: row[1],
                        description: row.length === 3 ? row[2] : "",
                    };
                    current.emissionsParameters.push(parameters);
                }
            }
            else if(summaryPart === 2) {
                if(row.length === 1) {
                    current.issueTitle = row[0];
                }
                else {
                    const issue = {
                        type: row[0],
                        node: row[1],
                        solve: row[2],
                        value: row[3],
                    };
                    current.issues.push(issue);
                }
            }
        }
    });
    return parsed;
}

export {parseSummaries};
