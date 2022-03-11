<template>
    <n-spin v-if="state === 'loading'"/>
    <n-result
        v-else-if="state === 'error'"
        status="error"
        title="Error"
        :description="errorMessage"
    />
    <n-space v-else vertical>
        <n-tree
            block-line
            :data="alternativeList"
            :render-label="renderLabel"
            :render-suffix="renderSuffix"
        />
        <new-named-item-row
            item-name="alternative"
            @create="addAlternative"
        />
    </n-space>
</template>

<script>
import {h, onMounted, ref, toRefs, watch} from "vue/dist/vue.esm-bundler.js";
import {useDialog} from "naive-ui";
import AlternativeListLabel from "./AlternativeListLabel.vue";
import DeleteItemButton from "./DeleteItemButton.vue"
import NewNamedItemRow from "./NewNamedItemRow.vue";
import * as Communication from "../modules/communication.mjs";

function fetchAlternatives(projectId, modelUrl, alternativeList, state, errorMessage, emit) {
    Communication.fetchModelData(
        "alternatives?", projectId, modelUrl
    ).then(function(data) {
        const alternatives = data.alternatives;
        const list = [];
        alternatives.forEach(function(alternative) {
            list.push({
                label: alternative.name,
                key: alternative.name,
                id: alternative.id,
            });
        });
        alternativeList.value = list;
        state.value = "ready";
        emitAvailableAlternativesChange(alternativeList, emit);
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = "error";
    });
}

function emitAvailableAlternativesChange(alternativeList, emit) {
    const availableAlternatives = new Set(alternativeList.value.map((alternative) => alternative.label));
    emit("availableAlternativesChange", availableAlternatives);
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
        inserted: {type: Object, required: false},
    },
    emits: ["availableAlternativesChange", "alternativeInsert", "alternativeUpdate", "alternativeDelete"],
    components: {
        "new-named-item-row": NewNamedItemRow,
    },
    setup(props, context) {
        const state = ref("loading");
        const errorMessage = ref("");
        const alternativeList = ref([]);
        const dialog = useDialog();
        const renameAlternative = function(renameData) {
            const existing = alternativeList.value.find((item) => renameData.name === item.label);
            if(existing) {
                dialog.error({title: "Cannot rename", content: "An alternative with the same name already exists."});
                return;
            }
            const alternative = alternativeList.value.find((item) => renameData.previousName === item.label);
            alternative.label = renameData.name;
            alternative.key = renameData.name;
            context.emit("alternativeUpdate", renameData);
            emitAvailableAlternativesChange(alternativeList, context.emit);
        };
        const deleteAlternative = function(alternativeName) {
            const index = alternativeList.value.findIndex((info) => info.label === alternativeName);
            const alternativeId = alternativeList.value[index].id;
            alternativeList.value.splice(index, 1);
            context.emit("alternativeDelete", {id: alternativeId, name: alternativeName});
            emitAvailableAlternativesChange(alternativeList, context.emit);
        };
        onMounted(function() {
            fetchAlternatives(props.projectId, props.modelUrl, alternativeList, state, errorMessage, context.emit);
        });
        watch(toRefs(props).inserted, function(inserted) {
            if(!inserted) {
                return;
            }
            alternativeList.value.forEach(function(alternative) {
                const id = inserted[alternative.label];
                if(id !== undefined) {
                    alternative.id = id;
                }
            });
        });
        return {
            state: state,
            errorMessage: errorMessage,
            alternativeList: alternativeList,
            addAlternative(name) {
                const existing = alternativeList.value.find(function(item) {
                    return name === item.label;
                });
                if (existing) {
                    dialog.error(
                        {title: "Cannot create", content: "An alternative with the same name already exists."}
                    );
                    return;
                }
                const newAlternative = {label: name, key: name};
                const insertIndex = alternativeList.value.findIndex((row) => name < row.label);
                alternativeList.value.splice(
                    insertIndex >= 0 ? insertIndex : alternativeList.value.length, 0, newAlternative
                );
                context.emit("alternativeInsert", name);
                emitAvailableAlternativesChange(alternativeList, context.emit);
            },
            renderLabel(info) {
                return h(AlternativeListLabel, {
                    alternativeName: info.option.label,
                    alternativeId: info.option.id,
                    onRename: renameAlternative
                });
            },
            renderSuffix(info) {
                return h(DeleteItemButton, {emblem: info.option.label, onDelete: deleteAlternative});
            },
        };
    },
}
</script>
