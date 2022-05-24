<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Model editor"
    />
    <n-grid :cols="3">
        <n-grid-item>
            <n-h1>Physical classes</n-h1>
            <class-list
                class-type="physical"
                :project-id="projectId"
                :model-url="modelUrl"
            />
        </n-grid-item>
        <n-grid-item>
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
        </n-grid-item>
        <n-grid-item>
            <n-h1>Commits</n-h1>
            <commit-viewer :project-id="projectId" :modelUrl="modelUrl"/>
        </n-grid-item>
    </n-grid>
</template>

<script>
import ClassList from "./ClassList.vue";
import CommitViewer from "./CommitViewer.vue";
import PagePath from "./PagePath.vue";

export default {
    props: {
        indexUrl: {type: String, required: true},
        projectUrl: {type: String, required: true},
        projectName: {type: String, required:true},
        modelUrl: {type: String, required: true},
        projectId: {type: Number, required: true},
        scenariosUrl: {type: String, required: true},
    },
    components: {
        "class-list": ClassList,
        "commit-viewer": CommitViewer,
        "page-path": PagePath
    }
}
</script>
