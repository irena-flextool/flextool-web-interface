import assert from 'assert/strict'
import { parseSummary } from '../src/modules/summaries.mjs'

describe('summaries module', function () {
  describe('parseSummary', function () {
    it('should handle empty input', function () {
      const tables = parseSummary([])
      assert.deepEqual(tables, [])
    })
    it('should parse table without header correctly', function () {
      const summary = [
        [],
        ['Emissions'],
        ['CO2 (Mt)', 2.27734, 'System-wide annualized CO2 emissions for all periods'],
        ['CO2 (Mt)', 1.1268, 'System-wide annualized CO2 emissions for realized periods']
      ]
      const tables = parseSummary(summary)
      assert.deepEqual(tables, [
        {
          title: 'Emissions',
          header: null,
          rows: [
            ['CO2 (Mt)', 2.27734, 'System-wide annualized CO2 emissions for all periods'],
            ['CO2 (Mt)', 1.1268, 'System-wide annualized CO2 emissions for realized periods']
          ]
        }
      ])
    })
    it('should parse table with header correctly', function () {
      const summary = [
        [],
        ['Solve', 'y2020'],
        [
          'Total cost obj. function (M CUR)',
          124252.931498,
          'Minimized total system cost as given by the solver (includes all penalty costs)'
        ],
        [
          'Total cost (calculated) full horizon (M CUR)',
          124266.495566,
          'Annualized operational, penalty and investment costs'
        ],
        ['Total cost (calculated) realized periods (M CUR)', 21468.7588177],
        ['Operational costs for realized periods (M CUR)', 418.071998891],
        ['Investment costs for realized periods (M CUR)', 0],
        ['Retirement costs (negative salvage value) for realized periods (M CUR)', 0],
        ['Penalty (slack) costs for realized periods (M CUR)', 21050.6868188]
      ]
      const tables = parseSummary(summary)
      assert.deepEqual(tables, [
        {
          title: 'Solve',
          header: ['', 'y2020', ''],
          rows: [
            [
              'Total cost obj. function (M CUR)',
              124252.931498,
              'Minimized total system cost as given by the solver (includes all penalty costs)'
            ],
            [
              'Total cost (calculated) full horizon (M CUR)',
              124266.495566,
              'Annualized operational, penalty and investment costs'
            ],
            ['Total cost (calculated) realized periods (M CUR)', 21468.7588177, ''],
            ['Operational costs for realized periods (M CUR)', 418.071998891, ''],
            ['Investment costs for realized periods (M CUR)', 0, ''],
            ['Retirement costs (negative salvage value) for realized periods (M CUR)', 0, ''],
            ['Penalty (slack) costs for realized periods (M CUR)', 21050.6868188, '']
          ]
        }
      ])
    })
  })
})
