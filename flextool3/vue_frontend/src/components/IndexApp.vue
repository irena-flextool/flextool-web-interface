<template>
    <page-path leaf-name="Projects"></page-path>
    <div id="index-app">
        <project-list :projects-url="projectsUrl">
        </project-list>
    </div>
</template>
<script>
import PagePath from "./PagePath.vue";
import ProjectList from "./ProjectList.vue";
export default {
    props: {
        projectsUrl: String
    },
    components: {
        "page-path": PagePath,
        "project-list": ProjectList
    }
}
</script>
