<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}, {name: 'Model', url: editUrl}]"
        leaf-name="solves"
    />
    <n-h1>Welcome to solve!</n-h1>
</template>

<script>
import PagePath from "./PagePath.vue";

export default {
    props: {
        projectName: {type: String, required: true},
        projectUrl: {type: String, required: true},
        indexUrl: {type: String, required: true},
        editUrl: {type: String, required: true},
    },
    components: {
        "page-path": PagePath,
    },
    setup() {
        return {};
    }
};
</script>
