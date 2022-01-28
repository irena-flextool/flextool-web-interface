<template>
    <page-path :index-url="indexUrl" :project-url="projectUrl" :project-name="projectName" leaf-name="Results"></page-path>
    <n-p>Results coming here in the near future.</n-p>
</template>
<script>
import PagePath from "./PagePath.vue";
export default {
    props: {
        indexUrl: String,
        projectName: String,
        projectUrl: String
    },
    setup() {
    },
    components: {
        "page-path": PagePath
    }
};
</script>
