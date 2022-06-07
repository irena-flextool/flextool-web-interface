<template>
    <fetchable :state="state" :error-message="errorMessage">
        <n-space vertical>
            <n-tree
                selectable
                block-node
                :data="entityList"
                :render-label="renderLabel"
                :render-suffix="renderSuffix"
                :selected-keys="selectedKeys"
                size="tiny"
                @update:selected-keys="emitEntitySelect"
            />
            <new-named-item-row
                v-if="classType === 1"
                item-name="object"
                @create="addObject"
            />
            <entity-list-new-relationship-row
                v-else
                :available-objects="availableObjects"
                @relationship-create="addRelationship"
            />
        </n-space>
    </fetchable>
</template>

<script>
import {h, onMounted, ref, toRefs, watch} from "vue/dist/vue.esm-bundler.js";
import {useDialog} from "naive-ui";
import * as Communication from "../modules/communication.mjs";
import {emblemToName} from "../modules/entityEmblem.mjs";
import {emblemsEqual, relationshipEmblemsEqual} from "../modules/emblemComparison.mjs";
import Fetchable from "./Fetchable.vue";
import EntityListObjectLabel from "./EntityListObjectLabel.vue";
import EntityListRelationshipLabel from "./EntityListRelationshipLabel.vue";
import DeleteItemButton from "./DeleteItemButton.vue";
import NewNamedItemRow from "./NewNamedItemRow.vue";
import EntityListNewRelationshipRow from "./EntityListNewRelationshipRow.vue";

function fetchObjects(projectId, modelUrl, classId, entityList, state, errorMessage) {
    const extraBody = {object_class_id: classId};
    Communication.fetchData(
        "objects?", projectId, modelUrl, extraBody
    ).then(async function(data) {
        const objects = data.objects;
        const list = [];
        objects.forEach(function(object) {
            list.push({
                entityEmblem: object.name,
                entityId: object.id,
                key: object.name,
            });
        });
        entityList.value = list;
        state.value = Fetchable.state.ready;
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = Fetchable.state.error;
    });
}

/**
 * Fetches objects that are available as given relationship's dimensions.
 * @param {number} projectId Project id.
 * @param {string} modelUrl URL pointing to server's model interface.
 * @param {number} classId Relationship class id.
 * @returns {Promise} Promise object that resolves to a list of available object lists.
 */
function fetchAvailableObjects(projectId, modelUrl, classId) {
    const extraBody = {relationship_class_id: classId};
    return Communication.fetchData(
        "available relationship objects?", projectId, modelUrl, extraBody
    ).then(function(data) {
        return data.available_objects;
    });
}

function fetchRelationships(
        projectId, modelUrl, classId , entityList, availableObjects, emit, state, errorMessage) {
    const extraBody = {relationship_class_id: classId};
    Communication.fetchData(
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
        availableObjects.value = await fetchAvailableObjects(projectId, modelUrl, classId);
        emit("entityDimensionsReveal", availableObjects.value.length);
        const list = [];
        objectLists.forEach(function(objects, relationship_id) {
            list.push({
                entityEmblem: objects,
                originalEmblem: [...objects],
                entityId: relationship_id,
                availableObjects: availableObjects,
                objectNamesClash: false,
                key: objects.join(","),
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
        state.value = Fetchable.state.ready;
    }).catch(function(error) {
        errorMessage.value = error.message;
        state.value = Fetchable.state.error;
    });
}

function makeSelectedEntityInfo(selectedEntity) {
    return {entityEmblem: selectedEntity.entityEmblem, entityId: selectedEntity.entityId};
}

export default {
    props: {
        projectId: {type: Number, required: true},
        modelUrl: {type: String, required: true},
        classId: {type: Number, required: true},
        className: {type: String, required: true},
        classType: {type: Number, required: true},
        inserted: {type: Object, required: false},
    },
    emits: [
        "entitySelect",
        "entityInsert",
        "entityUpdate",
        "entityDelete",
        "relationshipsClash",
        "entityDimensionsReveal"
    ],
    components: {
        "fetchable": Fetchable,
        "new-named-item-row": NewNamedItemRow,
        "entity-list-new-relationship-row": EntityListNewRelationshipRow,
    },
    setup(props, context) {
        const state = ref(Fetchable.state.loading);
        const entityList = ref([]);
        const errorMessage = ref("");
        const selectedKeys = ref([]);
        const availableObjects = ref([]);
        const dialog = useDialog();
        onMounted(function() {
            if(props.classType === 1) {
                fetchObjects(
                    props.projectId,
                    props.modelUrl,
                    props.classId,
                    entityList,
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
                    context.emit,
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
            const clash = existing !== undefined;
            for(const entity of entityList.value) {
                if(relationshipEmblemsEqual(updateData.previousEmblem, entity.originalEmblem)) {
                    entity.objectNamesClash = clash;
                    entity.entityEmblem = updateData.entityEmblem;
                    if(!clash) {
                        entity.originalEmblem = [...updateData.entityEmblem];
                    }
                    break;
                }
            }
            context.emit("relationshipsClash", existing);
            if(!existing) {
                context.emit("entityUpdate", updateData);
            }
        };
        watch(toRefs(props).inserted, function(inserted) {
            if(!inserted) {
                return;
            }
            entityList.value.forEach(function(entity) {
                const entityName = emblemToName(props.className, entity.entityEmblem);
                const id = inserted[entityName];
                if(id !== undefined) {
                    entity.entityId = id;
                }
            });
            selectedKeys.value.length = 0;
            context.emit("entitySelect", null);
        });
        return {
            state: state,
            entityList: entityList,
            errorMessage: errorMessage,
            selectedKeys: selectedKeys,
            availableObjects: availableObjects,
            renderLabel(info) {
                if(props.classType === 1) {
                    return h(
                        EntityListObjectLabel,
                        {
                            objectName: info.option.entityEmblem,
                            objectId: info.option.entityId,
                            onRename: renameObject,
                        }
                    );
                }
                else {
                    return h(
                        EntityListRelationshipLabel,
                        {
                            objects: info.option.entityEmblem,
                            originalObjects: info.option.originalEmblem,
                            relationshipId: info.option.entityId,
                            availableObjects: info.option.availableObjects,
                            objectNamesClash: info.option.objectNamesClash,
                            onObjectsUpdate: updateRelationshipObjects,
                        }
                    );
                }
            },
            renderSuffix(info) {
                return h(DeleteItemButton, {emblem: info.option.entityEmblem, onDelete: deleteEntity});
            },
            emitEntitySelect(keys, selectedEntities) {
                if(keys.length === 0) {
                    selectedKeys.value.length = 0;
                    return;
                }
                const selectedEntity = selectedEntities[0]
                selectedKeys.value = [selectedEntity.key];
                context.emit(
                    "entitySelect",
                    makeSelectedEntityInfo(selectedEntity),
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
                const newEntity = {
                    entityEmblem: name,
                    entityId: undefined,
                    key: name,
                };
                const insertIndex = entityList.value.findIndex((row) => name < row.entityEmblem);
                entityList.value.splice(insertIndex >= 0 ? insertIndex : entityList.value.length, 0, newEntity);
                context.emit("entityInsert", name);
                selectedKeys.value = [newEntity.key];
                context.emit("entitySelect", makeSelectedEntityInfo(newEntity));
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
                const newObjects = [...objects];
                const newEntity = {
                    entityEmblem: newObjects,
                    originalEmblem: [...newObjects],
                    entityId: undefined,
                    availableObjects: availableObjects,
                    objectNamesClash: false,
                    key: objects.join(","),
                };
                const insertIndex = entityList.value.findIndex((row) => objects[0] < row.entityEmblem);
                entityList.value.splice(insertIndex >= 0 ? insertIndex : entityList.value.length, 0, newEntity);
                context.emit("entityInsert", newObjects);
                selectedKeys.value = [newEntity.key];
                context.emit("entitySelect", makeSelectedEntityInfo(newEntity));
            }
        };
    },
}
</script>

<style>
.entity-list-select {
    max-width: 7em;
}
</style>
