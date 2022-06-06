<template>
    <page-path :path="[{name: 'Projects', url: indexUrl}]" :leaf-name="projectName"></page-path>
    <n-grid :cols="2">
        <n-grid-item>
            <n-h1>Links</n-h1>
            <n-space vertical>
                <n-p><n-a :href="editUrl">Model editor</n-a> lets you to define the project's model.</n-p>
                <n-p><n-a :href="runUrl">Run</n-a> page allows you to set up scenarios and solve the model.</n-p>
                <n-p><n-a :href="viewUrl">Results</n-a> shows results of solved scenarios.</n-p>
            </n-space>
        </n-grid-item>
        <n-grid-item>
            <n-h1>Usage hints</n-h1>
            <n-p>
                Links on these pages can be opened in different browser tabs or windows.
                It is possible to e.g. open two Model editors side-by-side to compare or copy data around.
            </n-p>
        </n-grid-item>
    </n-grid>
</template>

<script>
import PagePath from "./PagePath.vue";

export default {
    props: {
        projectName: {type: String, required: true},
        indexUrl: {type: String, required: true},
        editUrl: {type: String, required: true},
        runUrl: {type: String, required: true},
        viewUrl: {type: String, required: true},
    },
    components: {
        "page-path": PagePath,
    },
}
</script>
