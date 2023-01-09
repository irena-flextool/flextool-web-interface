<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-grid cols="1">
            <n-grid-item v-for="box in boxes" :key="box.identifier">
                <keyed-card :fingerprint="box.identifier" @close="dropBox">
                    <plot-editor :identifier="box.identifier" :project-id="projectId" :analysis-url="analysisUrl"
                        :scenario-execution-ids="scenarioExecutionIds" />
                </keyed-card>
            </n-grid-item>
            <n-grid-item>
                <n-button @click="addBox">
                    New figure
                </n-button>
            </n-grid-item>
        </n-grid>
    </fetchable>
</template>

<script>
import { onMounted, ref, watch } from "vue/dist/vue.esm-bundler.js";
import { useMessage } from "naive-ui";
import { fetchPlotSpecification, storePlotSpecification } from "../modules/communication.mjs";
import { plotSpecifications } from "../modules/plots.mjs";
import Fetchable from "./Fetchable.vue";
import KeyedCard from "./KeyedCard.vue";
import PlotEditor from "./PlotEditor.vue";

export default {
    props: {
        projectId: { type: Number, required: true },
        analysisUrl: { type: String, required: true },
    },
    emits: ["busy", "ready"],
    components: {
        "fetchable": Fetchable,
        "keyed-card": KeyedCard,
        "plot-editor": PlotEditor,
    },
    setup(props, context) {
        const state = ref(Fetchable.state.loading);
        const errorMessage = ref("");
        const boxes = ref([]);
        const scenarioExecutionIds = ref([]);
        let fetchingSpecifications = false;
        const message = useMessage();
        watch(plotSpecifications, function (newSpecifications) {
            if (fetchingSpecifications) {
                return;
            }
            const specifications = {
                plots: newSpecifications.asArray(),
            };
            storePlotSpecification(props.projectId, props.analysisUrl, specifications).catch(function (error) {
                message.warning(error.message);
            });
        });
        onMounted(function () {
            fetchingSpecifications = true;
            fetchPlotSpecification(props.projectId, props.analysisUrl).then(function (data) {
                const specifications = JSON.parse(data.plot_specification);
                for (const specification of specifications.plots) {
                    const identifier = plotSpecifications.add(specification);
                    boxes.value.push({ identifier: identifier });
                }
            }).catch(function (error) {
                message.warning(error.message)
            }).finally(function () {
                state.value = Fetchable.state.ready;
                fetchingSpecifications = false;
            });
            context.emit("ready");
        });
        return {
            state: state,
            errorMessage: errorMessage,
            boxes: boxes,
            scenarioExecutionIds: scenarioExecutionIds,
            addBox() {
                const identifier = plotSpecifications.new();
                boxes.value.push({ identifier: identifier });
            },
            dropBox(identifier) {
                for (const [i, box] of boxes.value.entries()) {
                    if (box.identifier === identifier) {
                        boxes.value.splice(i, 1);
                        break;
                    }
                }
                plotSpecifications.delete(identifier);
            },
            setScenarioExecutionIds(ids) {
                scenarioExecutionIds.value = ids;
            },
        };
    },
}
</script>
