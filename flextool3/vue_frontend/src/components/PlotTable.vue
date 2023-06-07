<template>
  <n-table size="tiny">
    <n-thead>
      <n-tr>
        <n-th v-for="(name, index) in header" :key="index">
          {{ name }}
        </n-th>
      </n-tr>
    </n-thead>
    <n-tbody>
      <n-tr v-for="(row, rowIndex) in dataTable" :key="rowIndex">
        <n-td v-for="(cell, cellIndex) in row" :key="cellIndex">
          {{ cell }}
        </n-td>
      </n-tr>
    </n-tbody>
  </n-table>
</template>

<script>
import { computed } from 'vue/dist/vue.esm-bundler.js'
import { nameFromKey } from '../modules/plotEditors.mjs'

export default {
  props: {
    dataFrame: { type: Object, required: true }
  },
  setup(props) {
    const header = computed(function () {
      if (props.dataFrame === null) {
        return []
      }
      return props.dataFrame.getColumnNames().map(nameFromKey)
    })
    const dataTable = computed(function () {
      if (props.dataFrame === null) {
        return []
      }
      return props.dataFrame.toRows()
    })
    return {
      header: header,
      dataTable: dataTable
    }
  }
}
</script>
