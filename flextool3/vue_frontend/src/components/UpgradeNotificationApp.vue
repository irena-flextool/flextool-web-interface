<template>
    <n-p>The model database has been upgraded and the old version has been backed up.</n-p>
    <n-p><n-a :href="editUrl">Continue to Model editor</n-a></n-p>
</template>
<script>
export default {
    props: {
        editUrl: String
    },
};
</script>
