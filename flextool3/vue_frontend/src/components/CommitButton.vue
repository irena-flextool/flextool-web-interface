<template>
    <n-button @click="$emit('commit', {modelUrl: this.modelUrl, projectId: this.projectId})">Commit</n-button>
</template>
<script>
export default {
    props: {
        modelUrl: String,
        projectId: Number
    },
    emit: ["commit:data"],
}
</script>
