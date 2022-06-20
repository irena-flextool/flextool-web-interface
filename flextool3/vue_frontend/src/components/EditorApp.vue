<template>
    <page
        name="Edit model"
        :index-url="indexUrl"
        :project-url="projectUrl"
        :edit-url="editUrl"
        :run-url="runUrl"
        :results-url="resultsUrl"
        :logout-url="logoutUrl"
        :logo-url="logoUrl"
    >
        <template #header>
            <page-path
                :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
                leaf-name="Model editor"
            />
        </template>
        <n-space>
            <n-space vertical>
                <n-h1>Physical classes</n-h1>
                <class-list
                    class-type="physical"
                    :project-id="projectId"
                    :model-url="modelUrl"
                />
            </n-space>
            <n-space vertical>
                <n-h1>Scenarios</n-h1>
                <n-p>
                    <n-a :href="scenariosUrl">
                        Edit alternatives and scenarios
                    </n-a>
                </n-p>
                <n-h1>Model classes</n-h1>
                <class-list
                    class-type="model"
                    :project-id="projectId"
                    :model-url="modelUrl"
                />
            </n-space>
        </n-space>
    </page>
</template>

<script>
import ClassList from "./ClassList.vue";
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";

export default {
    props: {
        indexUrl: {type: String, required: true},
        editUrl: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectName: {type: String, required:true},
        modelUrl: {type: String, required: true},
        projectId: {type: Number, required: true},
        runUrl: {type: String, required: true},
        resultsUrl: {type: String, required: true},
        scenariosUrl: {type: String, required: true},
        logoutUrl: {type: String, required: true},
        logoUrl: {type: String, required: true},
    },
    components: {
        "class-list": ClassList,
        "page": Page,
        "page-path": PagePath
    }
}
</script>
