<template>
    <n-space vertical align="center">
        <n-select
            v-model:value="plotType"
            :options="plotTypeOptions"
        />
        <n-button @click=emitCreate>
            <template #icon>
                <n-icon>
                    <plus/>
                </n-icon>
            </template>
            Create
        </n-button>
    </n-space>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";
import {Plus} from '@vicons/fa'

export default {
    emits: ["create"],
    components: {
        "plus": Plus,
    },
    setup(props, context) {
        const plotTypeOptions = ref([
            {label: "heat map", value: "heat map"},
        ]);
        const plotType = ref(plotTypeOptions.value[0].value);
        return {
            plotType: plotType,
            plotTypeOptions: plotTypeOptions,
            emitCreate() {
                context.emit("create", plotType.value);
            },
        };
    },
}
</script>
