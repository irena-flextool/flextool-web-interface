<template>
    <n-layout position="absolute">
        <n-layout-header>
            <n-card size="small">
                <navigation-menu
                    :current="name"
                    :index-url="indexUrl"
                    :project-url="projectUrl"
                    :edit-url="editUrl"
                    :run-url="runUrl"
                    :results-url="resultsUrl"
                    :logout-url="logoutUrl"
                    :logo-url="logoUrl"
                />
            </n-card>
            <div class="page-content">
                <slot name="header"></slot>
            </div>
        </n-layout-header>
        <div class="page-content">
            <slot></slot>
        </div>
    </n-layout>
</template>

<script>
import NavigationMenu from "./NavigationMenu.vue";

export default {
    props: {
        name: {type: String, required: true},
        indexUrl: {type: String, required: true},
        projectUrl: {type: String, required: false, default: null},
        editUrl: {type: String, required: false, default: null},
        runUrl: {type: String, required: false, default: null},
        resultsUrl: {type: String, required: false, default: null},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "navigation-menu": NavigationMenu,
    },
}
</script>

<style>
.page-content {
    margin-left: 1em;
    margin-right: 1em;
}
</style>
