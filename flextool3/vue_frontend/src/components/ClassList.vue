<template>
    <n-spin v-if="state === 'loading'"/>
    <n-result v-else-if="state === 'error'" status="error" title="Error" :description="errorMessage"/>
    <n-ul v-else>
        <n-li v-for="objectClass in objectClasses" :key="objectClass.id">
            <n-a :href="objectClass.entitiesUrl">{{objectClass.name}}</n-a>
            {{objectClass.description}}
            <n-ul>
                <n-li v-for="relationshipClass in relationshipClasses[objectClass.id]" :key="relationshipClass.id">
                    <n-a :href="relationshipClass.entitiesUrl">{{relationshipClass.name}}</n-a>
                    {{relationshipClass.description}}
                </n-li>
            </n-ul>
        </n-li>
    </n-ul>
</template>

<script>
import { onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import * as Communication from "../modules/communication.mjs";


export default {
    props: {
        projectId: Number,
        modelUrl: String
    },
    setup(props) {
        const objectClasses = ref([]);
        const relationshipClasses = ref(new Map());
        const state = ref("loading");
        const errorMessage = ref("");
        onMounted(function() {
            Communication.fetchModelData("physical classes?", props.projectId, props.modelUrl).then(function(data) {
                const relationshipClassMap = new Map();
                for (const [key, value] of Object.entries(data.relationshipClasses)) {
                    relationshipClassMap[parseInt(key)] = value;
                }
                relationshipClasses.value = relationshipClassMap;
                objectClasses.value = data.objectClasses;
                state.value = "ready";
                errorMessage.value = "";
            }).catch(function(error) {
                errorMessage.value = error.message;
                state.value = "error";
            });
        });
        return {
            objectClasses: objectClasses,
            relationshipClasses: relationshipClasses,
            state: state,
            errorMessage: errorMessage
        };
    }
}
</script>
