<template>
    <n-space align="baseline">
        <entity-list-relationship-object
            v-for="(name, index) in objects"
            :object-name="name"
            :dimension="index"
            :available-objects="availableObjects[index]"
            :key="index"
            @accept="emitObjectsUpdate"
        />
        <n-text>―</n-text>
        <n-text italic>{{ alternativeName }}</n-text>
    </n-space>
</template>

<script>
import EntityListRelationshipObject from "./EntityListRelationshipObject.vue";

export default {
    props: {
        objects: {type: Array, required: true},
        relationshipId: {type: Number, required: false},
        alternativeName: {type: String, required: true},
        availableObjects: {type: Array, required: true},
    },
    emits: ["objectsUpdate"],
    components: {
        "entity-list-relationship-object": EntityListRelationshipObject,
    },
    setup(props, context) {
        return {
            emitObjectsUpdate(objectData) {
                const objects = [];
                props.objects.forEach(function(currentObject, dimension) {
                    if(dimension !== objectData.dimension) {
                        objects.push(currentObject);
                    }
                    else {
                        objects.push(objectData.objectName);
                    }
                });
                context.emit("objectsUpdate", {
                    id: props.relationshipId,
                    previousEmblem: props.objects,
                    entityEmblem: objects
                });
            }
        };
    }
}
</script>
