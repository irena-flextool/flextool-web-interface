<template>
    <n-tree
        remote
        selectable
        :data="data"
        :on-load="fetchChildren"
        :expanded-keys="expandedKeys"
        @update:expanded-keys="handleExpandedKeysChange"
        :selected-keys="selectedKeys"
        @update:selected-keys="handleSelectedKeysChange"
    />
</template>

<script>
import { ref } from "vue/dist/vue.esm-bundler.js";
import * as Communication from "../modules/communication.js";

function fetchObjectClasses(projectId, modelUrl) {
    return Communication.fetchModelData("object classes?", projectId, modelUrl).then(function(data) {
            return data.classes;
        });
}

function fetchObjects(classId, projectId, modelUrl) {
    return Communication.fetchModelData("objects?", projectId, modelUrl, {"object_class_id": classId}).then(function(data) {
        return data.objects;
    });
}


export default {
    props: {
        modelUrl: String,
        projectId: Number
    },
    emit: ["objectClassSelected:classId"],
    setup(props, context) {
        const data = ref([{label: "Classes", key: -1, isLeaf: false}]);
        const expandedKeys = ref([-1]);
        const selectedKeys = ref([]);
        return {
            data: data,
            expandedKeys: expandedKeys,
            handleExpandedKeysChange(newExpandedKeys) {
                expandedKeys.value = newExpandedKeys;
            },
            selectedKeys: selectedKeys,
            handleSelectedKeysChange(newSelectedKeys, selectedNodes) {
                const selectedKey = newSelectedKeys[0];
                if (selectedKey === -1) {
                    selectedKeys.value.length = 0;
                }
                else if (Number.isInteger(selectedKey)) {
                    selectedKeys.value = newSelectedKeys;
                    context.emit("objectClassSelected", selectedKey);
                }
                else {
                    const node = selectedNodes[0];
                    const ids = node.key.split(":");
                    const class_id = parseInt(ids[0]);
                    if (!selectedKeys.value.length || class_id !== selectedKeys.value[0]) {
                        selectedKeys.value = [class_id];
                        context.emit("objectClassSelected", class_id);
                    }
                }
            },
            fetchChildren(node) {
                if (node.key === -1) {
                    return fetchObjectClasses(props.projectId, props.modelUrl).then(function(classes) {
                        const classNodes = [];
                        for (let objectClass of classes) {
                            classNodes.push({
                                label: objectClass.name,
                                key: objectClass.id,
                                isLeaf: false
                            });
                        }
                        node.children = classNodes;
                    });
                }
                return fetchObjects(node.key, props.projectId, props.modelUrl).then(function(objects) {
                    const objectNodes = [];
                    for (let object of objects) {
                        objectNodes.push({
                            label: object.name,
                            key: `${node.key}:${object.id}`,
                            isLeaf: true
                        });
                    }
                    node.children = objectNodes;
                });
            }
        };
    }
}
</script>
