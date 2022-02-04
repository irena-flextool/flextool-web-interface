<template>
    <n-input
        :value="value"
        ref="instance"
        @update:value="updateValue"
        @blur="cancel"
        @keydown="handleKey"
        maxlength=155
        size="small"
        clearable
    />
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
export default {
    props: {
        objectName: String
    },
    emits: ["accept", "cancel"],
    setup(props, context) {
        const value = ref(props.objectName);
        const instance = ref(null);
        onMounted(function() {
            instance.value?.select();
        });
        return {
            instance: instance,
            value: value,
            cancel() {
                value.value = props.objectName;
                context.emit("cancel");
            },
            updateValue(newValue) {
                value.value = newValue;
            },
            handleKey(keyInfo) {
                const sanitized = value.value.trim();
                switch(keyInfo.key) {
                    case "Enter":
                        if (sanitized && sanitized !== props.objectName) {
                            context.emit("accept", sanitized);
                        }
                        else {
                            value.value = props.objectName;
                            context.emit("cancel");
                        }
                        break;
                    case "Escape":
                        value.value = props.objectName;
                        context.emit("cancel");
                        break;
                }
            }
        };
    }
}
</script>
