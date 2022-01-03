<template>
    <div id="index-app">
        <n-h1>Projects</n-h1>
        <project-list :projects-url="projectsUrl">
        </project-list>
    </div>
</template>
<script>
import ProjectList from "./ProjectList.vue";
export default {
    props: {
        projectsUrl: String
    },
    components: {
        "project-list": ProjectList
    }
}
</script>
