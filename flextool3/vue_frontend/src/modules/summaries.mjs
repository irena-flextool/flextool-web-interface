/**
 * Add padding to table header and rows such that all are of same length.
 */
function evenOutRows(table, width) {
  const fill = function (row, width) {
    const filler = new Array(width - row.length)
    filler.fill('')
    row.splice(row.length, 0, ...filler)
  }

  if (table.header !== null && table.header.length < width) {
    fill(table.header, width)
  }
  for (const row of table.rows) {
    if (row.length < width) {
      fill(row, width)
    }
  }
}

/**
 * Breaks raw summary table into subtables with titles and headers.
 * @param {Array} rawSummary Raw summary without the two initial title rows.
 * @returns {object[]} Summary's subtables.
 */
function parseSummary(rawSummary) {
  const makeTable = function () {
    return {
      title: '',
      header: [''],
      rows: []
    }
  }
  const tables = []
  let currentTable = null
  let tableRowIndex = 0
  let width = -1
  for (const row of rawSummary) {
    if (row.length === 0) {
      if (currentTable !== null) {
        evenOutRows(currentTable, width)
      }
      currentTable = makeTable()
      tables.push(currentTable)
      tableRowIndex = 0
      continue
    }
    if (tableRowIndex === 0) {
      currentTable.title = row[0]
      if (row.length > 1) {
        currentTable.header.splice(currentTable.header.length, 0, ...row.slice(1))
      } else {
        currentTable.header = null
      }
    } else {
      currentTable.rows.push(row)
    }
    width = Math.max(width, row.length)
    ++tableRowIndex
  }
  if (currentTable !== null) {
    evenOutRows(currentTable, width)
  }
  return tables
}

export { parseSummary }
