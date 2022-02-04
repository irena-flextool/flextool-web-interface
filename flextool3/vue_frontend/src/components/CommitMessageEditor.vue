<template>
    <n-card
        title="Commit changes"
        closable
        @close="cancel"
    >
        <n-input
            type="textarea"
            placeholder="Type commit message"
            :value="commitMessage"
            @update:value="updateCommitMessage"
        />
        <template #footer>
            <n-space justify="end">
                <n-button
                    :disabled="!commitMessage"
                    type="primary"
                    @click="commit"
                >
                    Commit
                </n-button>
                <n-button
                    @click="cancel"
                >
                    Cancel
                </n-button>
            </n-space>
        </template>
    </n-card>
</template>

<script>
import {ref} from "vue/dist/vue.esm-bundler.js";

export default {
    emits: ["commit", "cancel"],
    setup(props, context) {
        const commitMessage = ref("");
        return {
            commitMessage: commitMessage,
            cancel() {
                context.emit("cancel");
            },
            commit() {
                context.emit("commit", commitMessage.value);
            },
            updateCommitMessage(text) {
                commitMessage.value = text;
            }
        };
    }
}
</script>
