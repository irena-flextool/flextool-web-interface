<template>
    <page name="Manage project" :index-url="indexUrl" :project-url="projectUrl" :edit-url="editUrl" :run-url="runUrl"
        :results-url="resultsUrl" :logout-url="logoutUrl" :logo-url="logoUrl">
        <template #header>
            <page-path :path="[{ name: 'Projects', url: indexUrl }]" :leaf-name="projectName"></page-path>
        </template>
        <n-space>
            <n-space vertical>
                <n-h1>Links</n-h1>
                <n-space vertical>
                    <n-p><n-a :href="editUrl">Model editor</n-a> lets you to define the project's model.</n-p>
                    <n-p><n-a :href="runUrl">Run</n-a> page allows you to set up scenarios and solve the model.</n-p>
                    <n-p><n-a :href="resultsUrl">Results</n-a> shows results of solved scenarios.</n-p>
                </n-space>
                <n-h1>Import or export model</n-h1>
                <n-p>Download model database <n-a :href="modelExportUrl">here</n-a>.</n-p>
                <n-upload name="model_database" :action="modelImportUrl" :headers="uploadHeaders" accept=".sqlite">
                    <n-button>Upload model database</n-button>
                </n-upload>
                <n-p>Warning: uploading database will overwrite model data.</n-p>
            </n-space>
            <n-space vertical>
                <n-h1>Usage hints</n-h1>
                <n-p>
                    Links on these pages can be opened in different browser tabs or windows.
                    It is possible to e.g. open two Model editors side-by-side to compare or copy data around.
                </n-p>
                <n-h1>Example systems</n-h1>
                <n-p>Add example systems to the model from the list below.</n-p>
                <examples :project-id="projectId" :examples-url="examplesUrl" />
            </n-space>
        </n-space>
    </page>
</template>

<script>
import { csrftoken } from "../modules/communication.mjs";
import Examples from "./Examples.vue";
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";

export default {
    props: {
        projectName: { type: String, required: true },
        projectId: { type: Number, required: true },
        projectUrl: { type: String, required: true },
        indexUrl: { type: String, required: true },
        editUrl: { type: String, required: true },
        runUrl: { type: String, required: true },
        resultsUrl: { type: String, required: true },
        examplesUrl: { type: String, required: true },
        logoutUrl: { type: String, required: true },
        logoUrl: { type: String, required: true },
        modelExportUrl: { type: String, required: true },
        modelImportUrl: { type: String, required: true },
    },
    components: {
        "examples": Examples,
        "page": Page,
        "page-path": PagePath,
    },
    setup() {
        return {
            uploadHeaders() {
                return { "X-CSRFToken": csrftoken };
            },
        };
    },
}
</script>
