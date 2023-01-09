<template>
    <n-space align="baseline">
        <entity-list-relationship-object v-for="(name, index) in objects" :object-name="name"
            :object-names-clash="objectNamesClash" :dimension="index" :available-objects="availableObjects[index]"
            :key="index" @accept="emitObjectsUpdate" />
    </n-space>
</template>

<script>
import EntityListRelationshipObject from "./EntityListRelationshipObject.vue";

export default {
    props: {
        objects: { type: Array, required: true },
        originalObjects: { type: Array, required: true },
        relationshipId: { type: Number, required: false },
        availableObjects: { type: Array, required: true },
        objectNamesClash: { type: Boolean, required: false, default: false },
    },
    emits: ["objectsUpdate"],
    components: {
        "entity-list-relationship-object": EntityListRelationshipObject,
    },
    setup(props, context) {
        return {
            emitObjectsUpdate(objectData) {
                const objects = [];
                props.objects.forEach(function (currentObject, dimension) {
                    if (dimension !== objectData.dimension) {
                        objects.push(currentObject);
                    }
                    else {
                        objects.push(objectData.objectName);
                    }
                });
                const previousObjects = props.originalObjects !== null ? props.originalObjects : props.objects;
                context.emit("objectsUpdate", {
                    id: props.relationshipId,
                    previousEmblem: previousObjects,
                    entityEmblem: objects,
                });
            }
        };
    }
}
</script>
