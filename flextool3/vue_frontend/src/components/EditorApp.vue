<template>
    <page-path
        :path="[{name: 'Projects', url: indexUrl}, {name: projectName, url: projectUrl}]"
        leaf-name="Model editor"
    />
    <n-grid :cols="2">
        <n-grid-item>
            <n-h1>Physical classes</n-h1>
            <class-list
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
        indexUrl: String,
        projectUrl: String,
        projectName: String,
        modelUrl: String,
        projectId: Number
    },
    components: {
        "class-list": ClassList,
        "commit-viewer": CommitViewer,
        "page-path": PagePath
    }
}
</script>
