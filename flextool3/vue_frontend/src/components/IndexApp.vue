<template>
    <page
        name="Projects"
        :index-url="indexUrl"
        :logout-url="logoutUrl"
        :logo-url="logoUrl"
    >
        <template #header>
            <page-path leaf-name="Projects"></page-path>
        </template>
        <project-list id="list" :projects-url="projectsUrl"/>
    </page>
</template>
<script>
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";
import ProjectList from "./ProjectList.vue";
export default {
    props: {
        indexUrl: {type: String, required: true},
        projectsUrl: {type: String, required: true},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "page": Page,
        "page-path": PagePath,
        "project-list": ProjectList
    }
}
</script>

<style>
#list {
    max-width: 30em;
}
</style>
