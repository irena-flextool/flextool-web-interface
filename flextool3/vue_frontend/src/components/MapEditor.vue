<template>
    <n-space vertical>
        <n-space>
            <n-button @click="removeSelectedRows">Remove selected</n-button>
        </n-space>
        <n-data-table
            size="small"
            :columns="columns"
            @update:checked-row-keys="updateCheckedRowKeys"
            :data="data"
            :row-key="rowKey"
        ></n-data-table>
    </n-space>
    <n-space justify="end">
        <n-button @click="accept">Validate</n-button>
    </n-space>
</template>
<script>
import { h, ref, toRefs, watch } from "vue/dist/vue.esm-bundler.js";
import { NInput, NInputNumber, useMessage } from 'naive-ui';
import Dropdown from "./MapEditorRowDropdown.vue";

let rowCounter = 0;

function parseMap(map) {
    const rowDatas = [];
    if (Array.isArray(map.data)) {
        map.data.forEach(function(row) {
            rowDatas.push({x: row[0], y: row[1], id: rowCounter});
            rowCounter += 1;
        })
    }
    else {
        for (const x in map.data) {
            rowDatas.push({x: x, y: map.data[x], id: rowCounter})
            rowCounter += 1;
        }
    }
    return rowDatas;
}

// TODO createMap() need to find a new home
/*
function createMap(data, columns) {
    const mapData = [];
    data.value.forEach(function(element) {
        mapData.push([element.x, element.y]);
    });
    const map = {
        index_type: "str",
        index_name: columns.value.find((element) => element.key === "x").title,
        data: mapData
    };
    return map;
}*/

function mapIndexName(map) {
    if ("index_name" in map) {
        return map.index_name;
    }
    else {
        return "x";
    }
}

function makeColumns(indexName, parameterName, insertRows, removeRows) {
    const selectionColumn = {
        type: "selection",
    };
    const dropdownColumn = {
        render: function(rowData) {
            return h(
                Dropdown,
                {
                    rowKey: rowData.id,
                    onInsertRowsSelected: insertRows,
                    onRemoveRowSelected: removeRows,
                    size: "small"
            });
        }
    };
    const xColumn = {
        title: indexName,
        key: "x",
        render: function(rowData) {
            return h(NInput, {
                defaultValue: rowData.x,
                onUpdateValue: (value) => rowData.x = value,
                size: "small"
            });
        }
    };
    const yColumn = {
        title: parameterName,
        key: "y",
        render: function(rowData) {
            return h(NInputNumber, {showButton: false,
                defaultValue: rowData.y,
                onUpdateValue: (value) => rowData.y = value,
                size: "small"
            });
        }
    };
    return [selectionColumn, dropdownColumn, xColumn, yColumn];
}

export default {
    props: {
        valueData: Object
    },
    emits: ["valueChanged"],
    setup(props) {
        const message = useMessage();
        const data = ref([]);
        const checkedRowKeys = ref([]);
        function insertRows(insertData) {
            const index = data.value.findIndex(function(element) {
                return element.id === insertData.rowKey;
            });
            const inserted = [];
            for (let i = 0; i < insertData.n; i++) {
                inserted.push({x: "none", "y": 0.0, id: rowCounter});
                rowCounter += 1;
            }
            data.value.splice(index + 1, 0, ...inserted);
        }
        function removeRow(removeData) {
            const index = data.value.findIndex(function(element) {
                return element.id === removeData.rowKey;
            });
            data.value.splice(index, 1);
        }
        const columns = ref(makeColumns("x", "y", insertRows, removeRow));
        const valueData = toRefs(props).valueData;
        watch(valueData, function() {
            if (!valueData.value.parameterValue) {
                data.value.length = 0;
                checkedRowKeys.value.length = 0;
                return;
            }
            rowCounter = 0;
            const map = valueData.value.parameterValue;
            const indexName = mapIndexName(map);
            columns.value = makeColumns(
                indexName, valueData.value.parameterName, insertRows, removeRow);
            data.value = parseMap(map);
        });
        return {
            columns: columns,
            data: data,
            checkedRowKeys: checkedRowKeys,
            rowKey(rowData) {
                return rowData.id;
            },
            updateCheckedRowKeys: function(rowKeys) {
                checkedRowKeys.value = rowKeys;
            },
            removeSelectedRows: function() {
                if (checkedRowKeys.value.length === data.value.length) {
                    data.value.length = 0;
                    return
                }
                checkedRowKeys.value.forEach(function(key) {
                    const index = data.value.findIndex(function(element) {
                        return element.id === key;
                    });
                    data.value.splice(index, 1);
                });
            },
            accept: function() {
                // This function exists solely to preserve the validation code.
                // TODO: Remove the Validate button, validate Map when value is saved instead.
                const validated = new Set();
                let row = 0;
                for (const element of data.value) {
                    row += 1;
                    if (!element.x) {
                        message.error(`Index missing on row ${row}.`);
                        return;
                    }
                    else if (validated.has(element.x)) {
                        message.error(`Duplicate index ${element.x} on row ${row}.`);
                        return;
                    }
                    else {
                        validated.add(element.x);
                    }
                }
            }
        };
    }
}
</script>
