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
import { h, onMounted, ref } from "vue/dist/vue.esm-bundler.js"
import { NInput, NInputNumber, NText } from 'naive-ui'
import * as Communication from "../modules/communication.js";


function makeColumns(emit) {
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
                    return h(NInput, {defaultValue: rowData.value, onChange: (value) => emit("valueUpdated", {value: value, id: rowData.id})});
                }
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
    emit: ["valueUpdated:data"],
    setup (props, context) {
        const data = ref([]);
        const loading = ref(true);
        const columns = ref(makeColumns(context.emit));
        onMounted(function () {
            fetchObjectParameterValues(props.projectId, props.modelUrl).then(function(rows) {
                data.value = rows;
                loading.value = false;
            });
        });
        return {
            data: data,
            columns: columns,
            loading: loading,
            rowKey (rowData) {
                return rowData.id;
            }
        }
    }
}
</script>
