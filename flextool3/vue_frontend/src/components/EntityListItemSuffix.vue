<template>
    <n-space>
        <n-button size="tiny" @click="emitDelete">Delete</n-button>
    </n-space>
</template>

<script>
export default {
    props: {
        entityEmblem: {type: [String, Array], required: true}
    },
    emits: ["delete"],
    setup(props, context) {
        return {
            emitDelete() {
                context.emit("delete", props.entityEmblem);
            }
        };
    }
}
</script>
