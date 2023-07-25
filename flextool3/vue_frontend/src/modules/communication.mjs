/**
 * Returns the value of a cookie.
 * @param {string} name Name of the cookie
 * @returns {string} Value of the cookie
 */
function getCookie(name) {
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    const fingerprint = name + '='
    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.startsWith(fingerprint)) {
        return decodeURIComponent(cookie.substring(name.length + 1))
      }
    }
  }
  throw new Error(`'${name}' cookie not found`)
}

const csrftoken = getCookie('csrftoken')

/**
 * Creates skeleton settings for fetching.
 * @returns {object}: Common fetch settings.
 */
function makeFetchInit() {
  return {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-CSRFToken': csrftoken, 'Content-Type': 'application/json' }
  }
}

/**
 * Fetches data from server.
 * @param {string} requestType Request type string.
 * @param {object} additionalData Additional fields to add to the request.
 * @param {string} url URL to server's interface.
 * @param {string} errorMessagePrefix Error message's first part if response is not OK.
 * @returns {Promise} A promise that resolves to server's response.
 */
async function simpleFetch(requestType, additionalData, url, errorMessagePrefix) {
  const fetchInit = makeFetchInit()
  fetchInit.body = JSON.stringify({
    type: requestType,
    ...additionalData
  })
  const response = await fetch(url, fetchInit)
  if (!response.ok) {
    return response.text().then(function (message) {
      throw new Error(`${errorMessagePrefix}: ${message}`)
    })
  }
  return await response.json()
}

/**
 * Fetches a list of available projects.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchProjectList(projectsUrl) {
  return simpleFetch('project list?', {}, projectsUrl, 'Failed to load project list')
}

/**
 * Creates a new project.
 * @param {string} projectName Project name.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function createProject(projectName, projectsUrl) {
  return simpleFetch(
    'create project?',
    { name: projectName },
    projectsUrl,
    'Failed to create project'
  )
}

/**
 * Deletes a project.
 * @param {number} projectId Project id.
 * @param {string} projectsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function destroyProject(projectId, projectsUrl) {
  return simpleFetch('destroy project?', { id: projectId }, projectsUrl, 'Failed to delete project')
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
  return simpleFetch(
    queryType,
    { projectId: projectId, ...extraBody },
    url,
    `Failed to fetch ${queryType}`
  )
}

/**
 * Sends database commit data to server.
 * @param {Object} commitData Commit contents.
 * @param (string} message Commit message.
 * @param {number} projectId Project's id.
 * @param {string} modelUrl Model interface URL.
 * @returns {Promise} Promise that resolves to server's response object.
 */
function commit(commitData, message, projectId, modelUrl) {
  return simpleFetch(
    'commit',
    { projectId: projectId, message: message, ...commitData },
    modelUrl,
    'Failed to commit'
  )
}

/**
 * Fetches project's current execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchCurrentExecution(projectId, executionsUrl) {
  return simpleFetch(
    'current execution?',
    { projectId: projectId },
    executionsUrl,
    'Failed to fetch current run'
  )
}

/**
 * Starts execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @param {string[]} scenarios Active scenario names.
 * @returns {Promise} A promise that resolves to server's response.
 */
function executeExecution(projectId, executionsUrl, scenarios) {
  return simpleFetch(
    'solve model?',
    { projectId: projectId, scenarios: scenarios },
    executionsUrl,
    'Failed to execute'
  )
}

/**
 * Starts import Excel input file.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function executeExcelInputImport(projectId, executionsUrl) {
  return simpleFetch(
    'import excel input?',
    { projectId: projectId },
    executionsUrl,
    'Failed to import Excel file'
  )
}

/**
 * Aborts execution.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function abortExecution(projectId, executionsUrl) {
  return simpleFetch('abort?', { projectId: projectId }, executionsUrl, 'Failed to abort execution')
}

/**
 * Fetches execution status from server.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExecutionBriefing(projectId, executionsUrl) {
  return simpleFetch(
    'briefing?',
    { projectId: projectId },
    executionsUrl,
    'Failed to fetch execution status'
  )
}

/**
 * Fetches summary data from server.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @param {string} scenarioExecutionId Scenario execution id.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchSummary(projectId, summaryUrl, scenarioExecutionId) {
  return simpleFetch(
    'summary?',
    { projectId: projectId, scenarioExecutionId: scenarioExecutionId },
    summaryUrl,
    'Failed to load summary'
  )
}

/**
 * Fetches executed scenarios from server.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExecutedScenarioList(projectId, summaryUrl) {
  return simpleFetch(
    'scenario list?',
    { projectId: projectId },
    summaryUrl,
    'Failed to load scenarios'
  )
}

/**
 * Requests server to delete a scenario execution.
 * @param {number} projectId Project id.
 * @param {string} summaryUrl URL to server's interface.
 * @param {string} scenarioExecutionId Scenario execution id.
 */
function destroyScenarioExecution(projectId, summaryUrl, scenarioExecutionId) {
  return simpleFetch(
    'destroy execution?',
    { projectId: projectId, scenarioExecutionId: scenarioExecutionId },
    summaryUrl,
    'Failed to destroy scenario execution'
  )
}

/**
 * Fetches result entity classes from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultEntityClasses(projectId, analysisUrl) {
  return simpleFetch(
    'entity classes?',
    { projectId: projectId },
    analysisUrl,
    'Failed to fetch entity classes'
  )
}

/**
 * Fetches result entities from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string[]} classes Entity classes.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultEntities(projectId, analysisUrl, classes) {
  return simpleFetch(
    'entities?',
    { projectId: projectId, classes: classes },
    analysisUrl,
    'Failed to fetch entities'
  )
}

/**
 * Fetches result parameters from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string[]} classes Entity classes.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchResultParameters(projectId, analysisUrl, classes) {
  return simpleFetch(
    'parameters?',
    { projectId: projectId, classes: classes },
    analysisUrl,
    'Failed to fetch parameters'
  )
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
function fetchResultParameterValueIndexes(
  projectId,
  analysisUrl,
  scenarioExecutionIds,
  classes,
  parameters
) {
  return simpleFetch(
    'value indexes?',
    {
      projectId: projectId,
      scenarioExecutionIds: scenarioExecutionIds,
      classes: classes,
      parameters: parameters
    },
    analysisUrl,
    'Failed to fetch parameter value indexes'
  )
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
function fetchResultParameterValues(
  projectId,
  analysisUrl,
  scenarioExecutionIds,
  classes,
  objects,
  parameters
) {
  return simpleFetch(
    'values?',
    {
      projectId: projectId,
      scenarioExecutionIds: scenarioExecutionIds,
      classes: classes,
      objects: objects,
      parameters: parameters
    },
    analysisUrl,
    'Failed to fetch parameter values'
  )
}

/**
 * Fetches the default plot specification from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchDefaultPlotSpecification(projectId, analysisUrl) {
  return simpleFetch(
    'default plot specification?',
    { projectId: projectId },
    analysisUrl,
    'Failed to fetch default plot specification'
  )
}

/**
 * Stores the default plot specification to server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {object} specification Plot specification
 * @returns {Promise} A promise that resolves to server's response.
 */
function storeDefaultPlotSpecification(projectId, analysisUrl, specification) {
  return simpleFetch(
    'store default plot specification',
    { projectId: projectId, specification: specification },
    analysisUrl,
    'Failed to store plot specification'
  )
}

/**
 * Fetches the names of all custom plot specifications from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchCustomPlotSpecificationNames(projectId, analysisUrl) {
  return simpleFetch(
    'custom plot specification names?',
    { projectId: projectId },
    analysisUrl,
    'Failed to fetch the names of custom plot specifications'
  )
}

/**
 * Fetches a custom plot specifications from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string} name Name of the specification.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchCustomPlotSpecification(projectId, analysisUrl, name) {
  return simpleFetch(
    'custom plot specification?',
    { projectId: projectId, name: name },
    analysisUrl,
    'Failed to fetch custom plot specification'
  )
}

/**
 * Stores a custom plot specification to server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string} name Name of the specification.
 * @param {object} specification Plot specification
 * @returns {Promise} A promise that resolves to server's response.
 */
function storeCustomPlotSpecification(projectId, analysisUrl, name, specification) {
  return simpleFetch(
    'store custom plot specification',
    { projectId: projectId, name: name, specification: specification },
    analysisUrl,
    'Failed to store plot specification'
  )
}

/**
 * Removes a custom plot specification from server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string} name Name of the specification.
 * @returns {Promise} A promise that resolves to server's response.
 */
function removeCustomPlotSpecification(projectId, analysisUrl, name) {
  return simpleFetch(
    'remove custom plot specification',
    { projectId: projectId, name: name },
    analysisUrl,
    'Failed to remove plot specification'
  )
}

/**
 * Renames a custom plot specification on server.
 * @param {number} projectId Project id.
 * @param {string} analysisUrl URL to server's analysis interface.
 * @param {string} name Name of the specification.
 * @param {string} newName Target name.
 * @returns {Promise} A promise that resolves to server's response.
 */
function renameCustomPlotSpecification(projectId, analysisUrl, name, newName) {
  return simpleFetch(
    'rename custom plot specification',
    { projectId: projectId, name: name, newName: newName },
    analysisUrl,
    'Failed to rename plot specification'
  )
}

/**
 * Fetches a list of available examples.
 * @param {number} projectId Project id.
 * @param {string} examplesUrl URL to server's interface.
 * @returns {Promise} A promise that resolves to server's response.
 */
function fetchExampleList(projectId, examplesUrl) {
  return simpleFetch(
    'example list?',
    { projectId: projectId },
    examplesUrl,
    'Failed to load example list'
  )
}

/**
 * Requests to add an example to model database.
 * @param {number} projectId Project id.
 * @param {string} examplesUrl URL to server's interface.
 * @param {string} exampleName Name of the example to add.
 * @returns {Promise} A promise that resolves to server's response.
 */
function addExample(projectId, examplesUrl, exampleName) {
  return simpleFetch(
    'add to model',
    { projectId: projectId, name: exampleName },
    examplesUrl,
    'Failed to add example to model'
  )
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
  fetchDefaultPlotSpecification,
  storeDefaultPlotSpecification,
  fetchCustomPlotSpecificationNames,
  fetchCustomPlotSpecification,
  storeCustomPlotSpecification,
  removeCustomPlotSpecification,
  renameCustomPlotSpecification,
  fetchExampleList,
  addExample
}
