<template>
    <n-select
        v-model:value="currentObject"
        ref="instance"
        filterable
        :options="options"
        size="small"
        @blur="accept"
        @keydown="handleKey"
    />
</template>

<script>
import {onMounted, ref} from "vue/dist/vue.esm-bundler.js";
export default {
    props: {
        objectName: {type: String, required: true},
        availableObjects: {type: Array, required: true},
    },
    emits: ["accept", "cancel"],
    setup(props, context) {
        const objectsList = [];
        props.availableObjects.forEach(function(object) {
            objectsList.push({
                label: object,
                value: object,
            });
        });
        const options = ref(objectsList);
        const currentObject = ref(props.objectName);
        const instance = ref(null);
        onMounted(function () {
            instance.value?.focus();
        });
        const accept = function() {
            if(currentObject.value === props.objectName) {
                context.emit("cancel");
                return;
            }
            context.emit("accept", currentObject.value);
        };
        const cancel = function() {
            context.emit("cancel");
        };
        return {
            options: options,
            currentObject: currentObject,
            instance: instance,
            accept: accept,
            cancel: cancel,
            handleKey(keyInfo) {
                switch(keyInfo.key) {
                    case "Enter":
                        accept();
                        break;
                    case "Escape":
                        cancel();
                        break;
                }
            },
        };
    }
}
</script>
