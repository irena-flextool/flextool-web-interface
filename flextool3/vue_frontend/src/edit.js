import * as Vue from "vue/dist/vue.esm-bundler.js";
import * as Communication from "./modules/communication.js";

const modelEditor = Vue.createApp({
    data() {
        return {
            objectClasses: [],
            objects: [],
            objectParameterValues: []
        };
    },
    methods: {
        objectsForClass(objectClass) {
            const objects = Array();
            for (const object of this.objects) {
                if (object.class_id === objectClass.id) {
                    objects.push(object);
                }
            }
            return objects;
        },
        valuesForObject(object) {
            if (object == undefined) {
                console.log("valuesForObject: object is undefined")
                return []
            }
            if (!this.objects) {
                return [];
            }
            const values = Array();
            for (const value of this.objectParameterValues) {
                if (value.object_id == this.objects[0].id) {
                    values.push(value);
                }
            }
            return values;
        }
    }
}).mount("#editor-app");
const toggler = document.querySelectorAll(".caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
}
const scriptData = Communication.getScriptData();
const fetchInit = Communication.makeFetchInit();
const pathNames = window.location.pathname.split("/")
const projectId = parseInt(pathNames[pathNames.length - 3])
const init = Object.create(fetchInit);
init["body"] = JSON.stringify({"type": "object classes?", "projectId": projectId});
fetch(scriptData.modelUrl, init).then(function(response) {
    if (!response.ok) {
      throw new Error("Network response was not OK.");
    }
    response.json().then(function(data) {
        modelEditor.objectClasses = data.classes;
    });
});
init["body"] = JSON.stringify({"type": "objects?", "projectId": projectId});
fetch(scriptData.modelUrl, init).then(function(response) {
    if (!response.ok) {
      throw new Error("Network response was not OK.");
    }
    response.json().then(function(data) {
        modelEditor.objects = data.objects;
    });
});
init["body"] = JSON.stringify({"type": "object parameter values?", "projectId": projectId});
fetch(scriptData.modelUrl, init).then(function(response) {
    if (!response.ok) {
      throw new Error("Network response was not OK.");
    }
    response.json().then(function(data) {
        modelEditor.objectParameterValues = data.values;
    });
});
