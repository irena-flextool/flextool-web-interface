<template>
    <n-space vertical>
        <text strong v-if="!disabled">
            {{ parameterName }}({{ indexName }})
        </text>
        <text v-else>
            -
        </text>
        <n-input
            :disabled="disabled"
            :value="content"
            type="textarea"
            placeholder="index value"
            :rows=20
            @update:value="updateContent"
        />
    </n-space>
</template>

<script>
import {ref, toRefs, watch} from "vue/dist/vue.esm-bundler.js";

/**
 * Gets index name from indexed value.
 * @param {Object} value An indexed value.
 * @returns {string} Index name.
 */
function getIndexName(value) {
    const name = value.index_name;
    return name !== undefined ? name : "x";
}

/**
 * Turn indexed value object into multi-line string.
 * @param {Object} value An indexed value or semi-value.
 * @returns {string} Editor content.
 */
function makeContent(value) {
    if("content" in value) {
        return value.content;
    }
    let content = "";
    if(value.type === "map") {
        if (Array.isArray(value.data)) {
            value.data.forEach(function(row) {
                content = content + `${row[0]}\t${row[1]}` + "\n";
            })
        }
        else {
            for (const x in value.data) {
                content = content + `${x}\t${value.data[x]}` + "\n";
            }
        }
    }
    else {
        value.data.forEach(function(y) {
            content = content + `${y}\n`;
        });
    }
    return content;
}

/**
 * Creates a semi-value.
 * @param {string} content Editor's content.
 * @param {string} indexName Value index name.
 * @return {Object} Semi-value.
 */
function makeSemiValue(content, indexName) {
    return {
        index_name: indexName,
        content: content,
    };
}

export default {
    props: {
        valueData: {type: [Object, null], required: true},
        diff: {type: Object, required: true},
    },
    emits: ["valueUpdate"],
    setup(props, context) {
        const disabled = ref(true);
        const indexName = ref("");
        const parameterName = ref("");
        const content = ref("");
        watch(toRefs(props).valueData, function(valueData) {
            if(valueData === null) {
                disabled.value = true;
                indexName.value = "";
                parameterName.value = "";
                content.value = "";
                return
            }
            disabled.value = false;
            parameterName.value = valueData.parameterName;
            const pending = props.diff.pendingValue(
                valueData.entityEmblem,
                valueData.definitionId,
                valueData.alternativeId
            );
            if(pending === undefined) {
                indexName.value = getIndexName(valueData.value);
                content.value = makeContent(valueData.value);
            }
            else if(pending.contest !== undefined) {
                indexName.value = pending.index_name;
                content.value = pending.content;
            }
            else {
                indexName.value = getIndexName(pending);
                content.value = makeContent(pending);
            }
        });
        return {
            disabled: disabled,
            indexName: indexName,
            parameterName: parameterName,
            content: content,
            updateContent(updated) {
                content.value = updated;
                const valueInfo = {
                    value: makeSemiValue(updated, indexName.value),
                    id: props.valueData.valueId,
                    entityEmblem: props.valueData.entityEmblem,
                    definitionId: props.valueData.definitionId,
                    alternativeId: props.valueData.alternativeId
                };
                context.emit("valueUpdate", valueInfo);
            },
        };
    }
}
</script>
