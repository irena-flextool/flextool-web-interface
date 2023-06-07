<template>
  <n-space align="baseline">
    <n-text v-if="!editing" @dblclick="showInput"> {{ objectName }}</n-text>
    <item-name-input v-else :name="objectName" @accept="emitRename" @cancel="hideInput" />
  </n-space>
</template>

<script>
import { ref } from 'vue/dist/vue.esm-bundler.js'
import ItemNameInput from './ItemNameInput.vue'

export default {
  props: {
    objectName: { type: String, required: true },
    objectId: { type: Number, required: false }
  },
  emits: ['rename'],
  components: {
    'item-name-input': ItemNameInput
  },
  setup(props, context) {
    const editing = ref(false)
    const inputInstance = ref(null)
    return {
      editing: editing,
      inputInstance: inputInstance,
      showInput() {
        editing.value = true
      },
      hideInput() {
        editing.value = false
      },
      emitRename(name) {
        editing.value = false
        context.emit('rename', {
          id: props.objectId,
          previousEmblem: props.objectName,
          entityEmblem: name
        })
      }
    }
  }
}
</script>
