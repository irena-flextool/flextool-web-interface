<template>
    <n-data-table
        size="small"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="rowKey"
        :max-height="400"
    />
</template>

<script>
import { h, onMounted, reactive, ref } from "vue/dist/vue.esm-bundler.js"
import * as Communication from "../modules/communication.js";


function makeColumns() {
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
            const value = rowData.value;
            let renderValue = value;
            const valueType = typeof(value);
            if (valueType != "string") {
                if (valueType == "number") {
                    renderValue = String(value);
                }
                else if (valueType == "object") {
                    renderValue = rowData.type;
                }
                else {
                    renderValue = "Unknown type"
                }
            }
            return h("p", {}, renderValue);
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

function fetchObjectParameterValues(projectId, modelUrl) {
    const fetchInit = Communication.makeFetchInit();
    const init = Object.create(fetchInit);
    init["body"] = JSON.stringify({"type": "object parameter values?", "projectId": projectId});
    return fetch(modelUrl, init).then(function(response) {
        if (!response.ok) {
          throw new Error("Network response was not OK.");
        }
        return response.json().then(function(data) {
            const values = data.values;
            values.forEach((value) => {
                value.value = JSON.parse(value.value);
            });
            return values;
        });
    });
}

export default {
    props: {
        modelUrl: String,
        projectId: Number
    },
    setup (props) {
        const data = ref([]);
        const loading = ref(true);
        const columns = ref(makeColumns());
        const entityClassColumn = reactive(columns.value[0]);
        const entityColumn = reactive(columns.value[1]);
        const parameterColumn = reactive(columns.value[2]);
        const alternativeColumn = reactive(columns.value[3]);
        const valueColumn = reactive(columns.value[4]);
        onMounted(function () {
            fetchObjectParameterValues(props.projectId, props.modelUrl).then(function(rows) {
                data.value = rows;
                loading.value = false;
            });
        });
        return {
            data: data,
            columns: columns,
            entityClassColumn: entityClassColumn,
            entityColumn: entityColumn,
            parameterColumn: parameterColumn,
            alternativeColumn: alternativeColumn,
            valueColumn: valueColumn,
            loading: loading,
            rowKey (rowData) {
                return rowData.id;
            }
        }
    }
}
</script>
