<template>
    <n-p>The {{ database }} database has been upgraded and the old version has been backed up.</n-p>
    <n-p><n-button @click="reload">Reload</n-button> the page to continue.</n-p>
</template>
<script>
export default {
    props: {
        database: {type: String, required: true},
    },
    setup() {
        return {
            reload() {
                location.reload();
            }
        };
    }
};
</script>
