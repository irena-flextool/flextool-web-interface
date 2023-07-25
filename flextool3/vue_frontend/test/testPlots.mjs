import assert from 'assert/strict'
import { DataFrame } from 'data-forge'
import {
  filterDeselectedIndexNames,
  makeBasicChart,
  makeHeatmapChart,
  makePlotSpecificationBundle
} from '../src/modules/plots.mjs'
import { valueIndexKeyPrefix } from '../src/modules/plotEditors.mjs'

describe('filterDeselectedIndexNames', function () {
  it('should filter unselected columns', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'scenario_time_stamp']: new Date('2022-12-15T12:53:00+00:00'),
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'scenario_time_stamp']: new Date('2022-12-15T12:53:00+00:00'),
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      }
    ])
    const plotSelection = {
      [valueIndexKeyPrefix + 'i']: ['your_data']
    }
    const filtered = filterDeselectedIndexNames(data, plotSelection)
    const expected = [
      {
        [valueIndexKeyPrefix + 'scenario_time_stamp']: new Date('2022-12-15T12:53:00+00:00'),
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      }
    ]
    assert.deepEqual(filtered.toArray(), expected)
  })
})

function make_empty_heat_map_plot_data() {
  return {
    data: [{ z: [], x: [], y: [], type: 'heatmap' }],
    config: { displaylogo: false, responsive: true },
    layout: { xaxis: { title: '' }, yaxis: { automargin: true } }
  }
}

function make_empty_basic_chart_plot_data(names) {
  const defaultColor = '#1f77b4'
  const charts = []
  for (const name of names) {
    charts.push({
      x: [],
      y: [],
      name: name,
      fillcolor: defaultColor,
      line: { color: defaultColor },
      marker: { color: defaultColor },
      showlegend: true
    })
  }
  return {
    data: charts,
    config: { displaylogo: false, responsive: true },
    layout: { title: '', xaxis: { title: '' }, showlegend: false }
  }
}

describe('makeBasicChart', function () {
  it('should work with single data point', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeBasicChart(data, plotDimensions)
    const expected = make_empty_basic_chart_plot_data([''])
    expected.data[0].x = ['T1']
    expected.data[0].y = [2.3]
    expected.layout.title = 'my_data'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should ignore x2 if it is the same as defaulted x1', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'x',
      x3: null,
      separate_window: null
    }
    const plotData = makeBasicChart(data, plotDimensions)
    const expected = make_empty_basic_chart_plot_data([''])
    expected.data[0].x = ['T1']
    expected.data[0].y = [2.3]
    expected.layout.title = 'my_data'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should ignore x3 if it is the same as defaulted x1', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'j']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'j',
      x3: valueIndexKeyPrefix + 'x',
      separate_window: null
    }
    const plotData = makeBasicChart(data, plotDimensions)
    const expected = make_empty_basic_chart_plot_data([''])
    expected.data[0].x = [['your_data'], ['T1']]
    expected.data[0].y = [2.3]
    expected.layout.title = 'my_data'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should create subplots correctly', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: valueIndexKeyPrefix + 'i'
    }
    const plotData = makeBasicChart(data, plotDimensions)
    const expected = make_empty_basic_chart_plot_data(['', ''])
    expected.data[0].x = ['T1']
    expected.data[0].y = [2.3]
    expected.data[0].xaxis = 'x1'
    expected.data[0].yaxis = 'y1'
    expected.data[1].x = ['T1']
    expected.data[1].y = [5.5]
    expected.data[1].xaxis = 'x2'
    expected.data[1].yaxis = 'y2'
    expected.data[1].showlegend = false
    expected.layout.title = ''
    expected.layout.xaxis.title = 'x'
    expected.layout.xaxis2 = { title: 'x' }
    expected.layout.grid = {
      rows: 2,
      columns: 1,
      pattern: 'independent'
    }
    expected.layout.annotations = [
      {
        showarrow: false,
        text: 'my_data',
        x: 0,
        xref: 'x1 domain',
        y: 1.1,
        yref: 'y1 domain'
      },
      {
        showarrow: false,
        text: 'your_data',
        x: 0,
        xref: 'x2 domain',
        y: 1.1,
        yref: 'y2 domain'
      }
    ]
    assert.deepEqual(plotData, expected)
  })
  it('should give colors with different names different colors and show them on legend', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'i']: 'data 1',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'i']: 'data 2',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: -2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeBasicChart(data, plotDimensions)
    const expected = make_empty_basic_chart_plot_data(['data 1', 'data 2'])
    expected.data[0].x = ['T1']
    expected.data[0].y = [2.3]
    expected.data[1].x = ['T1']
    expected.data[1].y = [-2.3]
    const defaultSecondColor = '#ff7f0e'
    expected.data[1].fillcolor = defaultSecondColor
    expected.data[1].line.color = defaultSecondColor
    expected.data[1].marker.color = defaultSecondColor
    expected.layout.title = ''
    expected.layout.xaxis.title = 'x'
    delete expected.layout.showlegend
    assert.deepEqual(plotData, expected)
  })
})

describe('makeHeatmapChart', function () {
  it('should return empty plot data for empty input', function () {
    const data = new DataFrame()
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    assert.deepEqual(plotData, expected)
  })
  it('should work with single data point', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1']
    expected.data[0].y = ['']
    expected.data[0].z = [[2.3]]
    expected.layout.title = '11-12-13 | my_data'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should organize data correctly for regular plot', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        alternative: 'alt_1',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        alternative: 'alt_1',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: -2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        alternative: 'alt_2',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        alternative: 'alt_2',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: -5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1', 'T2']
    expected.data[0].y = ['alt_1', 'alt_2']
    expected.data[0].z = [
      [2.3, -2.3],
      [5.5, -5.5]
    ]
    expected.layout.title = '11-12-13 | data_1'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should fill holes in data by nulls', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_2',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: 5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1', 'T2']
    expected.data[0].y = ['data_1', 'data_2']
    expected.data[0].z = [
      [2.3, undefined],
      [undefined, 5.5]
    ]
    expected.layout.title = '11-12-13'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should fill missing values in last dataset by nulls', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_1',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: -2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'data_2',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1', 'T2']
    expected.data[0].y = ['data_1', 'data_2']
    expected.data[0].z = [
      [2.3, -2.3],
      [5.5, undefined]
    ]
    expected.layout.title = '11-12-13'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should divide data into subplots correctly', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: valueIndexKeyPrefix + 'i'
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1']
    expected.data[0].y = ['']
    expected.data[0].z = [[2.3]]
    expected.data[0].xaxis = 'x1'
    expected.data[0].yaxis = 'y1'
    expected.data[0].coloraxis = 'coloraxis'
    expected.data.push({
      x: ['T1'],
      y: [''],
      z: [[5.5]],
      type: 'heatmap',
      xaxis: 'x2',
      yaxis: 'y2',
      coloraxis: 'coloraxis'
    })
    expected.layout.title = '11-12-13'
    expected.layout.xaxis.title = 'x'
    expected.layout.xaxis2 = { title: 'x' }
    expected.layout.yaxis2 = { automargin: true }
    ;(expected.layout.grid = { rows: 2, columns: 1, pattern: 'independent' }),
      (expected.layout.coloraxis = {})
    expected.layout.annotations = [
      {
        showarrow: false,
        text: 'my_data',
        x: 0,
        xref: 'x1 domain',
        y: 1.1,
        yref: 'y1 domain'
      },
      {
        showarrow: false,
        text: 'your_data',
        x: 0,
        xref: 'x2 domain',
        y: 1.1,
        yref: 'y2 domain'
      }
    ]
    assert.deepEqual(plotData, expected)
  })
  it('should get subplot title right even with a single dataset', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: null,
      x3: null,
      separate_window: valueIndexKeyPrefix + 'i'
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = ['T1']
    expected.data[0].y = ['']
    expected.data[0].z = [[2.3]]
    expected.data[0].xaxis = 'x1'
    expected.data[0].yaxis = 'y1'
    expected.data[0].coloraxis = 'coloraxis'
    expected.layout.title = '11-12-13'
    expected.layout.xaxis.title = 'x'
    ;(expected.layout.grid = { rows: 1, columns: 1, pattern: 'independent' }),
      (expected.layout.coloraxis = {})
    expected.layout.annotations = [
      {
        showarrow: false,
        text: 'my_data',
        x: 0,
        xref: 'x1 domain',
        y: 1.1,
        yref: 'y1 domain'
      }
    ]
    assert.deepEqual(plotData, expected)
  })
  it('should collect data to the same subplot', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'j']: 'A',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'j']: 'A',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 5.5
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'j']: 'A',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: -2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'j',
      x3: null,
      separate_window: valueIndexKeyPrefix + 'i'
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = [['A'], ['T1']]
    expected.data[0].y = ['11-12-13', '14-15-16']
    expected.data[0].z = [[2.3], [-2.3]]
    expected.data[0].xaxis = 'x1'
    expected.data[0].yaxis = 'y1'
    expected.data[0].coloraxis = 'coloraxis'
    expected.data.push({
      x: [['A'], ['T1']],
      y: ['11-12-13'],
      z: [[5.5]],
      type: 'heatmap',
      xaxis: 'x2',
      yaxis: 'y2',
      coloraxis: 'coloraxis'
    })
    expected.layout.title = ''
    expected.layout.xaxis.title = 'x'
    expected.layout.xaxis2 = { title: 'x' }
    expected.layout.yaxis2 = { automargin: true }
    ;(expected.layout.grid = { rows: 2, columns: 1, pattern: 'independent' }),
      (expected.layout.coloraxis = {})
    expected.layout.annotations = [
      {
        showarrow: false,
        text: 'my_data',
        x: 0,
        xref: 'x1 domain',
        y: 1.1,
        yref: 'y1 domain'
      },
      {
        showarrow: false,
        text: 'your_data',
        x: 0,
        xref: 'x2 domain',
        y: 1.1,
        yref: 'y2 domain'
      }
    ]
    assert.deepEqual(plotData, expected)
  })
  it('should get x2 category right', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: -2.3
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'i',
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = [
      ['my_data', 'your_data'],
      ['T1', 'T1']
    ]
    expected.data[0].y = ['']
    expected.data[0].z = [[2.3, -2.3]]
    expected.layout.title = '11-12-13'
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should pad data with x2 categories by null', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: 5.5
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: -2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: -5.5
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'i',
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = [
      ['my_data', 'my_data', 'your_data', 'your_data'],
      ['T1', 'T2', 'T1', 'T2']
    ]
    expected.data[0].y = ['11-12-13', '14-15-16']
    expected.data[0].z = [
      [2.3, 5.5, undefined, undefined],
      [undefined, undefined, -2.3, -5.5]
    ]
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should pad data with uneven x2 categories with nulls', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: 5.5
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: -2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: -5.5
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 99.0
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: 101.0
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'i',
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = [
      ['my_data', 'my_data', 'your_data', 'your_data'],
      ['T1', 'T2', 'T1', 'T2']
    ]
    expected.data[0].y = ['11-12-13', '14-15-16']
    expected.data[0].z = [
      [2.3, 5.5, undefined, undefined],
      [-2.3, -5.5, 99.0, 101.0]
    ]
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
  it('should not pad x-axis when there are only unique x1-x2 points', function () {
    const data = new DataFrame([
      {
        [valueIndexKeyPrefix + 'time_stamp']: '11-12-13',
        [valueIndexKeyPrefix + 'i']: 'my_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 2.3
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'your_data',
        [valueIndexKeyPrefix + 'x']: 'T1',
        y: 99.0
      },
      {
        [valueIndexKeyPrefix + 'time_stamp']: '14-15-16',
        [valueIndexKeyPrefix + 'i']: 'their_data',
        [valueIndexKeyPrefix + 'x']: 'T2',
        y: 101.0
      }
    ])
    const plotDimensions = {
      x1: null,
      x2: valueIndexKeyPrefix + 'i',
      x3: null,
      separate_window: null
    }
    const plotData = makeHeatmapChart(data, plotDimensions)
    const expected = make_empty_heat_map_plot_data()
    expected.data[0].x = [
      ['my_data', 'your_data', 'their_data'],
      ['T1', 'T1', 'T2']
    ]
    expected.data[0].y = ['11-12-13', '14-15-16']
    expected.data[0].z = [
      [2.3, undefined, undefined],
      [undefined, 99.0, 101.0]
    ]
    expected.layout.xaxis.title = 'x'
    assert.deepEqual(plotData, expected)
  })
})

describe('makePlotSpecificationBundle', function () {
  it('should make a bundle with working new method', function () {
    const bundle = makePlotSpecificationBundle()
    const bundleId = bundle.new()
    const specification = bundle.get(bundleId)
    assert.deepEqual(specification, {
      dimensions: {
        separate_window: null,
        x1: null,
        x2: null,
        x3: null
      },
      plot_type: 'line',
      selection: {
        entity_class: [],
        parameter: []
      }
    })
  })
  it('should make a bundle with working add method', function () {
    const bundle = makePlotSpecificationBundle()
    const bundleId = bundle.add({ hello: 'world' })
    assert.deepEqual(bundle.get(bundleId), { hello: 'world' })
  })
  it('should make a bundle that can delete specifications', function () {
    const bundle = makePlotSpecificationBundle()
    const bundleId = bundle.new()
    bundle.delete(bundleId)
    assert.equal(bundle.get(bundleId), undefined)
  })
  it('should make a bundle with working asArray method', function () {
    const bundle = makePlotSpecificationBundle()
    bundle.add({ number: 1 })
    bundle.add({ number: 2 })
    assert.deepEqual(bundle.asArray(), [{ number: 1 }, { number: 2 }])
  })
})
