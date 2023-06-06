function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie("csrftoken");

/**
 * Creates skeleton settings for fetching.
 * @returns {object}: Common fetch settings.
 */
function makeFetchInit() {
    return {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRFToken": csrftoken, 'Content-Type': 'application/json' }
    };
}

/**
 * Fetches a list of available projects.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchProjectList(projectsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ "type": "project list?" });
    return fetch(projectsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to load project list: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Creates a new project.
 * @param {string} projectName Project name.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function createProject(projectName, projectsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "create project?", name: projectName });
    return fetch(projectsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to create project: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Deletes a project.
 * @param {number} projectId Project id.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function destroyProject(projectId, projectsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "destroy project?", id: projectId });
    return fetch(projectsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to delete project: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches model data from server.
 * @param {string} queryType Fetch query type.
 * @param {number} projectId Project id.
 * @param {string} url URL to server's interface.
 * @param {object} extraBody Additional fields for fetch query.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchData(queryType, projectId, url, extraBody = {}) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: queryType, projectId: projectId, ...extraBody });
    return fetch(url, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch ${queryType}: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Sends database commit data to server.
 * @param {Object} commitData Commit contents.
 * @param (string} message Commit message.
 * @param {number} projectId Project's id.
 * @param {string} modelUrl Model interface URL.
 * @returns {Promise} Promise that resolves to server's response object.
 */
function commit(commitData, message, projectId, modelUlr) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({ type: "commit", projectId: projectId, message: message, ...commitData });
    return fetch(modelUlr, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(message);
            });
        }
        return response.json();
    });
}

/**
 * Fetches project's current execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchCurrentExecution(projectId, executionsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({ type: "current execution?", projectId: projectId });
    return fetch(executionsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch current run: ${message}`);
            });
        }
        return response.json()
    });
}

/**
 * Starts execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @param {string[]} scenarios Active scenario names.
 * @returns {Promise} A promise that resolves to server's response.
 */
function executeExecution(projectId, executionsUrl, scenarios) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "solve model?", projectId: projectId, scenarios: scenarios });
    return fetch(executionsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to execute: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Starts import Excel input file.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function executeExcelInputImport(projectId, executionsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "import excel input?", projectId: projectId });
    return fetch(executionsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to execute: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Aborts execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function abortExecution(projectId, executionsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "abort?", projectId: projectId });
    return fetch(executionsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to abort execution: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches execution status from server.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExecutionBriefing(projectId, executionsUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "briefing?", projectId: projectId });
    return fetch(executionsUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch execution status: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches summary data from server.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @param {string} scenarioExecutionId Scenario execution id.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchSummary(projectId, summaryUrl, scenarioExecutionId) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "summary?",
        projectId: projectId,
        scenarioExecutionId: scenarioExecutionId,
    });
    return fetch(summaryUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to load summary: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches executed scenarios from server.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExecutedScenarioList(projectId, summaryUrl) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({ type: "scenario list?", projectId: projectId });
    return fetch(summaryUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to load scenarios: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Requests server to delete a scenario execution.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @param {string} scenarioExecutionId Scenario execution id.
 */
function destroyScenarioExecution(projectId, summaryUrl, scenarioExecutionId) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "destroy execution?",
        projectId: projectId,
        scenarioExecutionId: scenarioExecutionId,
    });
    return fetch(summaryUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to destroy scenario execution: ${message}`);
            });
        }
        return;
    });
}

/**
 * Fetches result entity classes from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultEntityClasses(projectId, analysisUrl) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "entity classes?",
        projectId: projectId,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch entity classes: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches result entities from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string[]} classes Entity classes.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultEntities(projectId, analysisUrl, classes) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "entities?",
        projectId: projectId,
        classes: classes,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch entities: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches result parameters from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string[]} classes Entity classes.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultParameters(projectId, analysisUrl, classes) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "parameters?",
        projectId: projectId,
        classes: classes,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch parameters: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches result parameter value indexes from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {number[]} scenarioExecutionIds Scenario execution ids.
 * @param {string[]} classes Entity class names.
 * @param {string[]} parameters: Parameter names.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultParameterValueIndexes(projectId, analysisUrl, scenarioExecutionIds, classes, parameters) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "value indexes?",
        projectId: projectId,
        scenarioExecutionIds: scenarioExecutionIds,
        classes: classes,
        parameters: parameters,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch parameter value indexes: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches result parameter values from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {number[]} scenarioExecutionIds Scenario execution ids.
 * @param {string[]} classes Entity class names.
 * @param {Array[]} objects Object names per dimension.
 * @param {string[]} parameters: Parameter names.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultParameterValues(projectId, analysisUrl, scenarioExecutionIds, classes, objects, parameters) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "values?",
        projectId: projectId,
        scenarioExecutionIds: scenarioExecutionIds,
        classes: classes,
        objects: objects,
        parameters: parameters,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch parameter values: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches plot specification from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchPlotSpecification(projectId, analysisUrl) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "plot specification?",
        projectId: projectId,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to fetch plot specification: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches plot specification from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {object} specification Plot specification
 * @returns {Promise} A promise that resolves to server's response.
 */
function storePlotSpecification(projectId, analysisUrl, specification) {
    const fetchInit = makeFetchInit();
    fetchInit.body = JSON.stringify({
        type: "store plot specification",
        projectId: projectId,
        specification: specification,
    });
    return fetch(analysisUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to store plot specification: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Fetches a list of available examples.
 * @param {number} projectId Project id.
 * @param {string} examplesUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExampleList(projectId, examplesUrl) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "example list?", projectId: projectId });
    return fetch(examplesUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to load example list: ${message}`);
            });
        }
        return response.json();
    });
}

/**
 * Requests to add an example to model database.
 * @param {number} projectId Project id.
 * @param {string} examplesUrl URL to server's interface.
 * @param {string} exampleName Name of the example to add.
 * @returns {Promise} A promise that resolves to server's response.
 */
function addExample(projectId, examplesUrl, exampleName) {
    const fetchInit = makeFetchInit();
    fetchInit["body"] = JSON.stringify({ type: "add to model", name: exampleName, projectId: projectId });
    return fetch(examplesUrl, fetchInit).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (message) {
                throw new Error(`Failed to add example to model: ${message}`);
            });
        }
        return response.json();
    });
}

export {
    csrftoken,
    makeFetchInit,
    fetchData,
    commit,
    fetchProjectList,
    createProject,
    destroyProject,
    fetchCurrentExecution,
    executeExecution,
    executeExcelInputImport,
    abortExecution,
    fetchExecutionBriefing,
    fetchExecutedScenarioList,
    fetchSummary,
    destroyScenarioExecution,
    fetchResultEntityClasses,
    fetchResultEntities,
    fetchResultParameters,
    fetchResultParameterValueIndexes,
    fetchResultParameterValues,
    fetchPlotSpecification,
    storePlotSpecification,
    fetchExampleList,
    addExample,
};
