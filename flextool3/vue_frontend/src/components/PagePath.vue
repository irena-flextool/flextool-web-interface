<template>
    <n-breadcrumb>
        <n-breadcrumb-item v-for="part in path" :href="part.url" :key="part.id">
            {{ part.name }}
        </n-breadcrumb-item>
        <n-breadcrumb-item>
            {{ leafName }}
        </n-breadcrumb-item>
    </n-breadcrumb>
</template>
<script>
import { ref } from "vue/dist/vue.esm-bundler.js";
export default {
    props: {
        indexUrl: String,
        projectUrl: String,
        projectName: String,
        leafName: String
    },
    setup: function(props) {
        const parts = [];
        if (props.indexUrl) {
            parts.push({name: "Projects", url: props.indexUrl, id: 0});
        }
        if (props.projectUrl) {
            parts.push({name: props.projectName, url: props.projectUrl, id: 1});
        }
        const path = ref(parts);
        return {
            path: path
        };
    }
}
</script>