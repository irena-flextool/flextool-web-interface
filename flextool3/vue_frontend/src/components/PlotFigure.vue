<template>
    <n-space vertical>
        <n-button
            @click="prepareDownload"
            :loading="preparingDownload"
            :disabled="downloadButtonDisabled"
            size="small"
        >
            Download CSV
        </n-button>
        <div :id="plotId"></div>
    </n-space>
</template>

<script>
import {computed, onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {useMessage} from "naive-ui";
import Plotly from "plotly.js-cartesian-dist-min";
import {toBarChartData} from "../modules/plots.mjs";
import {fetchData} from "../modules/communication.mjs";
import {relationshipClassType} from "../modules/entityClasses.mjs";

async function getEntityClassNames(entityClass, projectId, analysisUrl) {
    if(entityClass.type === relationshipClassType) {
        const data = await fetchData(
            "relationship class object classes?",
            projectId,
            analysisUrl,
            {relationship_class_id: entityClass.id},
        );
        return data.object_classes;
    }
    else {
        return [entityClass.name];
    }
}

export default {
    props: {
        identifier: {type: [String, Number], required: true},
        dataTable: {type: Array, required: true},
        indexNames: {type: Array, required: true},
        entityClass: {type: Object, required: true},
        parameterName: {type: String, required: true},
        projectId: {type: Number, required: true},
        analysisUrl: {type: String, required: true},
    },
    setup(props) {
        const plotId = ref(`plot-${props.identifier}`);
        const preparingDownload = ref(false);
        const message = useMessage();
        onMounted(function() {
            let xColumn = 0;
            if(props.dataTable) {
                xColumn = props.dataTable[0].length - 2;
            }
            const plotData = toBarChartData(props.dataTable, xColumn);
            const layout = {xaxis: {title: props.indexNames[props.indexNames.length - 1]}};
            const config = {responsive: true};
            Plotly.newPlot(plotId.value, plotData, layout, config);
        });
        return {
            plotId: plotId,
            preparingDownload: preparingDownload,
            downloadButtonDisabled: computed(() => preparingDownload.value),
            prepareDownload() {
                preparingDownload.value = true;
                getEntityClassNames(props.entityClass, props.projectId, props.analysisUrl).then(function(classNames) {
                    const createCsvStringifier = require("csv-writer").createArrayCsvStringifier;
                    const stringifier = createCsvStringifier({header: [...classNames, ...props.indexNames, "y"]});
                    const header = stringifier.getHeaderString()
                    const content = stringifier.stringifyRecords(props.dataTable);
                    const aElement = document.createElement("a");
                    aElement.setAttribute(
                        "href",
                        "data:text/plain;charset=utf-8," + encodeURIComponent(header + content)
                    );
                    aElement.setAttribute("download", `${props.entityClass.name}_${props.parameterName}.csv`);
                    aElement.style.display = "none";
                    document.body.appendChild(aElement);
                    aElement.click();
                    document.body.removeChild(aElement);
                }).catch(function(error) {
                    message.error(error.message);
                }).finally(function(){
                    preparingDownload.value = false;
                });
            },
        };
    },
}
</script>
