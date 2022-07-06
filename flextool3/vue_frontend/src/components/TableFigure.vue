<template>
    <n-space vertical>
        <n-space>
            <n-button
                @click="download"
                size="small"
            >
                Download CSV
            </n-button>
        </n-space>
        <n-table size="tiny">
            <n-thead>
                <n-tr>
                    <n-th v-for="(name, index) in header" :key="index">
                        {{ name }}
                    </n-th>
                    <n-th>
                        value
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
    </n-space>
</template>

<script>
import {} from "vue/dist/vue.esm-bundler.js";
import {downloadAsCsv, headerNames, makeProps} from "../modules/figures.mjs";

export default {
    props: makeProps(),
    setup(props) {
        const header = [...headerNames(props.entityClass), ...props.indexNames];
        return {
            header: header,
            download() {
                downloadAsCsv(
                    props.dataTable,
                    props.entityClass,
                    props.parameterName,
                    props.indexNames,
                );
            },
        };
    },
}
</script>
