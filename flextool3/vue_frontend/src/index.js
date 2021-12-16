import * as Vue from "vue/dist/vue.esm-bundler.js";
import * as Communication from "./modules/communication.js";

const scriptData = Communication.getScriptData();
const fetchInit = Communication.makeFetchInit();
const init = Object.create(fetchInit);
const projectManager = Vue.createApp({
    data() {
        return {
            loading: true,
            projects: [],
            newProjectName: ""
        };
    },
    methods: {
        createProject() {
            if (!this.newProjectName) {
                alert("Please enter project name first.");
                return;
            }
            init["body"] = JSON.stringify({type: "create project?", name: this.newProjectName});
            fetch(scriptData.amaUrl, init).then(function(response) {
                if (!response.ok) {
                  alert("Creating project failed: server reported a bad request.");
                  return;
                }
                response.json().then(function(data) {
                    projectManager.projects.push(data.project);
                    projectManager.newProjectName = "";
                });
            });
        },
        destroyProject(index) {
            init["body"] = JSON.stringify({type: "destroy project?", name: this.projects[index].name});
            fetch(scriptData.amaUrl, init).then(function(response) {
                if (!response.ok) {
                  alert("Destroying project failed: server reported a bad request.");
                  return;
                }
                response.json().then(function(data) {
                    if (data.type !== "destroy project") {
                        alert("Unexpected response type when destroying project.")
                    }
                    projectManager.projects.splice(index, 1);
                });
            });
        }
    }
}).mount("#index-app");
init["body"] = JSON.stringify({"type": "project list?"});
fetch(scriptData.amaUrl, init).then(function(response) {
    if (!response.ok) {
      throw new Error("Network response was not OK.");
    }
    response.json().then(function(data) {
        projectManager.loading = false
        projectManager.projects = data.projects
    });
});
