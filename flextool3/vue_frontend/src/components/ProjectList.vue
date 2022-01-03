<template>
    <n-list>
        <n-list-item v-for="project in projects" :key="project.id">
            <project-row @destroyed="deleteProject" :project-id="project.id" :project-name="project.name" :url="project.url" :projects-url="projectsUrl"></project-row>
        </n-list-item>
        <template #footer>
            <new-project-row @created="appendProject" :projects-url="projectsUrl"></new-project-row>
        </template>
    </n-list>
</template>
<script>
import { onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import { fetchProjectList } from "../modules/communication.js";
import NewProjectRow from "./NewProjectRow.vue";
import ProjectRow from "./ProjectRow.vue";

export default {
    props: {
        projectsUrl: String
    },
    setup(props) {
        const projects = ref([]);
        const newProjectRowBusy = ref(false);
        onMounted(
            function() {
                fetchProjectList(String(props.projectsUrl)).then(function(data) {
                    projects.value = data.projects;
                });
            }
        );
        return {
            projects: projects,
            newProjectRowBusy: newProjectRowBusy,
            appendProject: function(project) {
                projects.value.push(project);
            },
            deleteProject: function(projectId) {
                const index = projects.value.findIndex(function(project) {
                    return project.id === projectId;
                });
                if (index < 0) {
                    throw new Error(`Project id ${projectId} not found while deleting project.`);
                }
                projects.value.splice(index, 1);
            }
        };
    },
    components: {
        "new-project-row": NewProjectRow,
        "project-row": ProjectRow
    }
}
</script>
