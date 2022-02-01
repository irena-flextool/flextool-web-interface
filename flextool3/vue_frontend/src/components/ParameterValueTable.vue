<template>
    <n-data-table
        size="small"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="rowKey"
        :max-height="400"
    ></n-data-table>
    <n-modal
        :show="showMapEditor"
        :mask-closable="false"
        @afterEnter="sendMapToEditor"
    >
        <n-card closable @close="showMapEditor = false">
            <map-editor :parameter-row="selectedMap"></map-editor>
        </n-card>
    </n-modal>
</template>

<script>
import { h, ref, toRefs, watch } from "vue/dist/vue.esm-bundler.js";
import { NButton, NInput, NInputNumber, NText } from "naive-ui";
import MapEditor from "./MapEditor.vue";
import * as Communication from "../modules/communication.js";


function makeColumns(emit, editMapRow, showMapEditor) {
    const entityClassColumn = {
        title: "Class",
        key: "object_class_name",
    }
    const entityColumn = {
        title: "Object",
        key: "object_name",
    }
    const parameterColumn = {
        title: "Parameter",
        key: "parameter_name"
    }
    const alternativeColumn = {
        title: "Alternative",
        key: "alternative_name"
    };
    const valueColumn = {
        title: "Value",
        key: "value",
        render: function (rowData) {
            if (!rowData.type) {
                const valueType = typeof(rowData.value);
                if (valueType == "number") {
                    return h(NInputNumber, {showButton: false, defaultValue: rowData.value});
                }
                else {
                    return h(NInput, {defaultValue: rowData.value, onUpdate: (value) => emit("valueUpdated", {value: value, id: rowData.id})});
                }
            }
            else if (rowData.type === "map") {
                return h(NButton, {onClick: function() {
                    showMapEditor.value = true;
                    editMapRow.rowData = rowData;
                }}, () => "Edit");
            }
            return h(NText, {italic: true}, {default: () => rowData.type});
        }
    };
    return [
        entityClassColumn,
        entityColumn,
        parameterColumn,
        alternativeColumn,
        valueColumn
    ];
}

function fetchObjectParameterValues(classId, projectId, modelUrl) {
    return Communication.fetchModelData("object parameter values?", projectId, modelUrl, {"object_class_id": classId}).then(function(data) {
            const values = data.values;
            values.forEach((value) => {
                value.value = JSON.parse(value.value);
            });
            return values;
        });
}

export default {
    props: {
        modelUrl: String,
        projectId: Number,
        classId: Number
    },
    emits: ["valueUpdated"],
    setup (props, context) {
        const data = ref([]);
        const loading = ref(false);
        const editMapRow = {rowData: undefined}
        const selectedMap = ref({});
        const showMapEditor = ref(false);
        const columns = ref(makeColumns(context.emit, editMapRow, showMapEditor));
        const classId = toRefs(props).classId;
        watch(classId, function() {
            data.value.length = 0;
            loading.value = true;
            fetchObjectParameterValues(classId.value, props.projectId, props.modelUrl).then(function(rows) {
                data.value = rows;
                loading.value = false;
            });
        });
        return {
            data: data,
            columns: columns,
            loading: loading,
            selectedMap: selectedMap,
            showMapEditor: showMapEditor,
            rowKey (rowData) {
                return rowData.id;
            },
            sendMapToEditor() {
                // This function is a hack that seems to be required to transfer the row data
                // to map editor.
                selectedMap.value = editMapRow.rowData;
            }
        };
    },
    components: {
        "map-editor": MapEditor,
    }
}
</script>
