<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-tree
            selectable
            block-node
            :data="alternatives"
            :selected-keys="selectedIds"
            @update:selected-keys="emitSelected"
        />
    </fetchable>
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
import {fetchData} from "../modules/communication.mjs";
import Fetchable from "./Fetchable.vue";

/**
 * Creates default 'Base' alternative.
 * @param {number} projectId Project id.
 * @param {string} modelUrl URL pointing to server's model interface.
 * @returns {Promise} Promise object that resolves to a list of alternatives.
 */
function makeBaseAlternative(projectId, modelUrl) {
    return fetchData(
        "make base alternative", projectId, modelUrl, {}
    ).then(function(data) {
        return data.alternatives;
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
    },
    emits: ["alternativeSelect"],
    components: {
        "fetchable": Fetchable,
    },
    setup(props, context) {
        const alternatives = ref([]);
        const selectedIds = ref([]);
        const state = ref(Fetchable.state.loading);
        const errorMessage = ref("");
        onMounted(function() {
            fetchData(
                "alternatives?", props.projectId, props.modelUrl
            ).then(async function(data) {
                if(data.alternatives.length === 0) {
                    data.alternatives = await makeBaseAlternative(props.projectId, props.modelUrl);
                }
                for(const alternative of data.alternatives) {
                    alternatives.value.push({label: alternative.name, key: alternative.id});
                }
                state.value = Fetchable.state.ready;
            }).catch(function(error) {
                state.value = Fetchable.state.error;
                errorMessage.value = error.message;
            });
        });
        return {
            alternatives: alternatives,
            selectedIds: selectedIds,
            state: state,
            errorMessage: errorMessage,
            emitSelected(keys, selectedAlternatives) {
                const alternative = selectedAlternatives[0];
                selectedIds.value = [alternative.key]
                context.emit("alternativeSelect", {
                    alternativeId: alternative.key,
                    alternativeName: alternative.label
                });
            },
        };
    },
}
</script>
