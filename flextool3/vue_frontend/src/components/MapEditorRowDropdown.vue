<template>
    <n-dropdown
        trigger="hover"
        @select="handleSelect"
        :options=options
        >
        <n-button size="small">&#8230;</n-button>
    </n-dropdown>
</template>
<script>
import { ref } from "vue/dist/vue.esm-bundler.js";

export default {
    props: {
        rowKey: Number
    },
    emits: ["insertRowsSelected", "removeRowSelected"],
    setup(props, context) {
        const options = ref([
            {
                label: "Remove row",
                key: "remove",
            },
            {
                label: "Insert after",
                key: "insert after",
                children: [
                    {
                        label: "Single row",
                        key: "insert 1 row"
                    },
                    {
                        label: "10 rows",
                        key: "insert 10 rows"
                    },
                ]
            },
        ]);
        return {
            options: options,
            handleSelect(key) {
                switch (key) {
                    case "remove":
                        context.emit("removeRowSelected", {rowKey: props.rowKey});
                        break;
                    case "insert 1 row":
                        context.emit("insertRowsSelected", {rowKey: props.rowKey, n: 1})
                        break;
                    case "insert 10 rows":
                        context.emit("insertRowsSelected", {rowKey: props.rowKey, n: 10})
                        break;
                    default:
                        throw new Error(`Unknown dropdown selection key ${key}`);
                }
            }
        };
    }
}
</script>
