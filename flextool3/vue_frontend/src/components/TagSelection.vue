<template>
    <n-dynamic-tags
        v-model:value="selected"
        :disabled="tagsDisabled"
        @update:value="emitUpdateSelection"
    >
        <template #trigger="{activate, disabled}">
            <n-button size="small" dashed :disabled="disabled" @click="activate()">
                {{ buttonLabel }}
                <template #icon>
                    <n-icon>
                        <plus/>
                    </n-icon>
                </template>
            </n-button>
        </template>
        <template #input="{submit, deactivate}">
            <n-select
                ref="select"
                size="small"
                :show="showSelect"
                v-model:value="current"
                :options="availableOptions"
                @update:show="updateShowSelect"
                @update:value="submit($event)"
                @blur="deactivate"
            />
        </template>
    </n-dynamic-tags>
</template>

<script>
import {computed, ref} from "vue/dist/vue.esm-bundler.js";
import {Plus} from '@vicons/fa';

export default{
    props: {
        buttonLabel: {type: String, required: true},
        available: {type: Array, required: true},
    },
    emits: ["update:selection"],
    components: {
        "plus": Plus,
    },
    setup(props, context) {
        const availableOptions = ref(props.available.map((name) => ({label: name, value: name})));
        const defaultValue = availableOptions.value ? availableOptions.value[0].value : null;
        const current = ref(defaultValue);
        const selected = ref([]);
        const tagsDisabled = computed(() => !props.available);
        const showSelect = ref(true);
        const select = ref(null);
        return {
            availableOptions: availableOptions,
            current: current,
            selected: selected,
            tagsDisabled: tagsDisabled,
            showSelect: showSelect,
            select: select,
            updateShowSelect(show) {
                if(!show) {
                    select.value.blur();
                }
            },
            emitUpdateSelection() {
                context.emit("update:selection", {});
            },
        };
    },
}
</script>
