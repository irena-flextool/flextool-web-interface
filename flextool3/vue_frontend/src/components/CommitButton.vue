<template>
    <n-space align="baseline">
        <n-button
            :disabled="!hasPendingChanges"
            :loading="committing"
            @click="emitCommitRequest"
            >
            Commit
        </n-button>
        <n-text v-if="hasPendingChanges">
            There are pending changes.
        </n-text>
        <n-text v-else>
            Nothing to commit.
        </n-text>
    </n-space>
</template>

<script>
export default {
    props: {
        hasPendingChanges: {type: Boolean, required: true},
        committing: {type: Boolean, required: true},
    },
    emit: ["commitRequest"],
    setup(props, context) {
        return {
            emitCommitRequest() {
                context.emit("commitRequest");
            },
        };
    },
}
</script>
