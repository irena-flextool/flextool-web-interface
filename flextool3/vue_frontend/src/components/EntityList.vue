<template>
    <n-spin v-if="state === 'loading'"/>
    <n-result v-else-if="state === 'error'" status="error" title="Error" :description="errorMessage"/>
    <n-space v-else vertical>
        <n-tree
            selectable
            block-node
            :data="entityList"
            :render-label="renderLabel"
            :render-suffix="renderSuffix"
            :selected-keys="selectedKeys"
            @update:selected-keys="emitEntitySelect"
        />
        <entity-list-new-object-row
            v-if="classType === 1"
            v-show="alternatives"
            @object-create="addObject"
        />
        <entity-list-new-relationship-row
            v-else
            v-show="alternatives"
            :available-objects="availableObjects"
            @relationship-create="addRelationship"
        />
    </n-space>
</template>

<script>
import {h, onMounted, ref, toRefs, watch} from "vue/dist/vue.esm-bundler.js";
import {useDialog} from "naive-ui";
import * as Communication from "../modules/communication.mjs";
import {emblemsEqual, relationshipEmblemsEqual} from "../modules/emblemComparison.mjs";
import EntityListObjectLabel from "./EntityListObjectLabel.vue";
import EntityListRelationshipLabel from "./EntityListRelationshipLabel.vue";
import EntityListItemSuffix from "./EntityListItemSuffix.vue";
import EntityListNewObjectRow from "./EntityListNewObjectRow.vue";
import EntityListNewRelationshipRow from "./EntityListNewRelationshipRow.vue";

/**
 * Fetches alternatives.
 * @param {number} projectId Project id.
 * @param {string} modelUrl URL pointing to server's model interface.
 * @returns {Promise} Promise object that resolves to a list of alternatives.
 */
function fetchAlternatives(projectId, modelUrl) {
    return Communication.fetchModelData(
        "alternatives?", projectId, modelUrl
    ).then(async function(data) {
        return data.alternatives;
    });
}

function fetchObjects(projectId, modelUrl, classId, entityList, alternatives, state, errorMessage) {
    const alternativesPromise = fetchAlternatives(projectId, modelUrl);
    const extraBody = {object_class_id: classId};
    Communication.fetchModelData(
        "objects?", projectId, modelUrl, extraBody
    ).then(async function(data) {
        const objects = data.objects;
        alternatives.value = await alternativesPromise;
        const list = [];
        objects.forEach(function(object) {
            alternatives.value.forEach(function(alternative) {
                list.push({
                    entityEmblem: object.name,
                    entityId: object.id,
                    alternativeName:alternative.name,
                    alternativeId: alternative.id,
                    key: `${object.name}:${alternative.id}`,
                });
            });
        });
        entityList.value = list;
        state.value = "ready";
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = "error";
    });
}

/**
 * Fetches objects that are available as given alternative's dimensions.
 * @param {number} projectId Project id.
 * @param {string} modelUrl URL pointing to server's model interface.
 * @param {number} classId Relationship class id.
 * @returns {Promise} Promise object that resolves to a list of available object lists.
 */
function fetchAvailableObjects(projectId, modelUrl, classId) {
    const extraBody = {relationship_class_id: classId};
    return Communication.fetchModelData(
        "available relationship objects?", projectId, modelUrl, extraBody
    ).then(function(data) {
        return data.available_objects;
    });
}

function fetchRelationships(
        projectId, modelUrl, classId , entityList, availableObjects, alternatives, state, errorMessage) {
    const alternativesPromise = fetchAlternatives(projectId, modelUrl);
    const extraBody = {relationship_class_id: classId};
    Communication.fetchModelData(
        "relationships?", projectId, modelUrl, extraBody
    ).then(async function(data) {
        const relationships = data.relationships;
        const objectLists = new Map();
        relationships.forEach(function(relationship) {
            let list = objectLists.get(relationship.id);
            if(list === undefined) {
                list = [];
                objectLists.set(relationship.id, list);
            }
            list.push(relationship.object_name);
        });
        alternatives.value = await alternativesPromise;
        availableObjects.value = await fetchAvailableObjects(projectId, modelUrl, classId);
        const list = [];
        objectLists.forEach(function(objects, relationship_id) {
            alternatives.value.forEach(function(alternative) {
                list.push({
                    entityEmblem: objects,
                    entityId: relationship_id,
                    alternativeName:alternative.name,
                    alternativeId: alternative.id,
                    availableObjects: availableObjects,
                    key: `${objects.join(",")}:${alternative.id}`,
                });
            });
        });
        list.sort(function(item1, item2) {
            for(let i = 0; i < item1.entityEmblem.length; ++i) {
                const emblem1 = item1.entityEmblem[i].toUpperCase();
                const emblem2 = item2.entityEmblem[i].toUpperCase();
                if(emblem1 === emblem2) {
                    continue;
                }
                return emblem1 > emblem2;
            }
            return false;
        });
        entityList.value = list;
        state.value = "ready";
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = "error";
    });
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
        classId: {type: Number, required: true},
        classType: {type: Number, required: true},
        inserted: {type: Object, required: false},
    },
    emits: ["entitySelect", "entityInsert", "entityUpdate", "entityDelete"],
    components: {
        "entity-list-new-object-row": EntityListNewObjectRow,
        "entity-list-new-relationship-row": EntityListNewRelationshipRow,
    },
    setup(props, context) {
        const state = ref("loading");
        const entityList = ref([]);
        const errorMessage = ref("");
        const selectedKeys = ref([]);
        const alternatives = ref([]);
        const availableObjects = ref([]);
        const dialog = useDialog();
        onMounted(function() {
            if(props.classType === 1) {
                fetchObjects(
                    props.projectId,
                    props.modelUrl,
                    props.classId,
                    entityList,
                    alternatives,
                    state,
                    errorMessage
                );
            }
            else {
                fetchRelationships(
                    props.projectId,
                    props.modelUrl,
                    props.classId,
                    entityList,
                    availableObjects,
                    alternatives,
                    state,
                    errorMessage
                );
            }
        });
        const deleteEntity = function(entityEmblem) {
            let entityId = undefined;
            for (let i = entityList.value.length - 1; i != -1; --i) {
                const entity = entityList.value[i]
                if(emblemsEqual(entity.entityEmblem, entityEmblem)) {
                    entityId = entity.entityId;
                    entityList.value.splice(i, 1);
                }
            }
            context.emit("entityDelete", {id: entityId, entityEmblem: entityEmblem});
        };
        const renameObject = function(renameData) {
            const existing = entityList.value.find(function(item) {
                return renameData.entityEmblem === item.entityEmblem;
            });
            if(existing) {
                dialog.error({title: "Cannot rename", content: "An object with the same name already exists."});
                return;
            }
            entityList.value.forEach(function(item) {
                if(item.entityEmblem == renameData.previousEmblem) {
                    item.entityEmblem = renameData.entityEmblem;
                }
            });
            context.emit("entityUpdate", renameData);
        };
        const updateRelationshipObjects = function(updateData) {
            const existing = entityList.value.find(function(item) {
                return relationshipEmblemsEqual(updateData.entityEmblem, item.entityEmblem);
            });
            if(existing) {
                dialog.error({
                    title: "Cannot change dimension",
                    content: "A relationship with the same objects already exists."
                });
                return;
            }
            entityList.value.forEach(function(item) {
                for(let i = 0; i !== updateData.previousEmblem.length; ++i) {
                    if(updateData.previousEmblem[i] !== item.entityEmblem[i]) {
                        return;
                    }
                }
                item.entityEmblem = updateData.entityEmblem;
            });
            context.emit("entityUpdate", updateData);
        };
        watch(toRefs(props).inserted, function(inserted) {
            if(!inserted) {
                return;
            }
            entityList.value.forEach(function(entity) {
                const id = inserted[entity.entityEmblem];
                if(id !== undefined) {
                    entity.entityId = id;
                }
            });
            selectedKeys.value.length = 0;
            context.emit("entitySelect", {});
        });
        return {
            state: state,
            entityList: entityList,
            errorMessage: errorMessage,
            selectedKeys: selectedKeys,
            alternatives: alternatives,
            availableObjects: availableObjects,
            renderLabel(info) {
                if(props.classType === 1) {
                    return h(
                        EntityListObjectLabel,
                        {
                            objectName: info.option.entityEmblem,
                            objectId: info.option.entityId,
                            alternativeName: info.option.alternativeName,
                            onRename: renameObject,
                        }
                    );
                }
                else {
                    return h(
                        EntityListRelationshipLabel,
                        {
                            objects: info.option.entityEmblem,
                            relationshipId: info.option.entityId,
                            alternativeName: info.option.alternativeName,
                            availableObjects: info.option.availableObjects,
                            onObjectsUpdate: updateRelationshipObjects,
                        }
                    );
                }
            },
            renderSuffix(info) {
                return h(EntityListItemSuffix, {entityEmblem: info.option.entityEmblem, onDelete: deleteEntity});
            },
            emitEntitySelect(newSelectedKeys, selectedNodes) {
                const selected = selectedNodes.find(function(row) {
                    return row && row.key === newSelectedKeys[0];
                });
                context.emit(
                    "entitySelect",
                    selected ? {
                        entityEmblem: selected.entityEmblem,
                        entityId: selected.entityId,
                        alternativeName: selected.alternativeName,
                        alternativeId: selected.alternativeId,
                    } : null
                );
            },
            addObject(name) {
                const existing = entityList.value.find(function(item) {
                    return name === item.entityEmblem;
                });
                if (existing) {
                    dialog.error({title: "Cannot create", content: "An entity with the same name already exists."});
                    return;
                }
                const newEntities = [];
                alternatives.value.forEach(function(alternative) {
                    newEntities.push({
                        entityEmblem: name,
                        entityId: undefined,
                        alternativeName:alternative.name,
                        alternativeId: alternative.id,
                        key: `${name}:${alternative.id}`,
                    });
                });
                const insertIndex = entityList.value.findIndex((row) => name < row.entityEmblem);
                entityList.value.splice(insertIndex >= 0 ? insertIndex : entityList.value.length, 0, ...newEntities);
                context.emit("entityInsert", name);
            },
            addRelationship(objects) {
                const existing = entityList.value.find(function(item) {
                    return relationshipEmblemsEqual(objects, item.entityEmblem);
                });
                if(existing) {
                    dialog.error({
                        title: "Cannot create relationship",
                        content: "A relationship with the same objects already exists."
                    });
                    return;
                }
                const newEntities = [];
                alternatives.value.forEach(function(alternative) {
                    newEntities.push({
                        entityEmblem: objects,
                        entityId: undefined,
                        alternativeName:alternative.name,
                        alternativeId: alternative.id,
                        availableObjects: availableObjects,
                        key: `${objects.join(",")}:${alternative.id}`,
                    });
                });
                const insertIndex = entityList.value.findIndex((row) => objects[0] < row.entityEmblem);
                entityList.value.splice(insertIndex >= 0 ? insertIndex : entityList.value.length, 0, ...newEntities);
                context.emit("entityInsert", objects);
            }
        };
    },
}
</script>