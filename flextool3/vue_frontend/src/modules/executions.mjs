import { fetchExecutionBriefing } from './communication.mjs'

let fetchingBriefing = false

const executionStatus = {
  yetToStart: 'YS',
  finished: 'OK',
  running: 'RU',
  aborted: 'AB',
  error: 'ER'
}

const executionType = {
  solve: 'solve',
  importExcel: 'import excel'
}

/** Returns a string corresponding to execution status.
 * @param {string} status Execution status code.
 * @returns {string} Log message.
 */
function createLastLogEntry(status) {
  switch (status) {
    case executionStatus.finished:
      return 'Run successful.'
    case executionStatus.aborted:
      return 'Run aborted.'
    case executionStatus.error:
      return 'Run failed.'
    default:
      return 'Unknown run status.'
  }
}

/** Fetches execution briefing from server at regular intervals.
 * @param {number} projectId Project id.
 * @param {string} executionsUrl Executions URL.
 * @param {Ref} logLines List of log lines.
 * @param {Ref} status Execution status.
 * @param {object} message Interface to show messages.
 * @callback finished Called when execution is finished.
 */
function followExecution(projectId, executionsUrl, logLines, status, message, finished) {
  const timer = window.setInterval(function () {
    if (fetchingBriefing) {
      return
    }
    fetchingBriefing = true
    fetchExecutionBriefing(projectId, executionsUrl)
      .then(function (data) {
        const briefing = data.briefing
        status.value = briefing.status
        logLines.value = briefing.log
        if (briefing.status !== executionStatus.running) {
          logLines.value = logLines.value.concat(createLastLogEntry(briefing.status))
          window.clearInterval(timer)
          finished()
        }
      })
      .catch(function (error) {
        window.clearInterval(timer)
        status.value = executionStatus.aborted
        finished()
        message.error(error.message)
      })
      .finally(function () {
        fetchingBriefing = false
      })
  }, 500)
}

export { executionStatus, executionType, followExecution }
