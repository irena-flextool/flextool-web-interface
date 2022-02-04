<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Results"
    />
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
