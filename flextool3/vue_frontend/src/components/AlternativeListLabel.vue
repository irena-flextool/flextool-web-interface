<template>
  <n-space align="baseline">
    <n-text v-if="!editing" @dblclick="showInput"> {{ alternativeName }}</n-text>
    <item-name-input v-else :name="alternativeName" @accept="emitRename" @cancel="hideInput" />
  </n-space>
</template>

<script>
import { ref } from 'vue/dist/vue.esm-bundler.js'
import ItemNameInput from './ItemNameInput.vue'

export default {
  props: {
    alternativeName: { type: String, required: true },
    alternativeId: { type: Number, required: false }
  },
  emits: ['rename'],
  components: {
    'item-name-input': ItemNameInput
  },
  setup(props, context) {
    const editing = ref(false)
    const editValue = ref(props.alternativeName)
    const inputInstance = ref(null)
    return {
      editing: editing,
      editValue: editValue,
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
          id: props.alternativeId,
          previousName: props.alternativeName,
          name: name
        })
      }
    }
  }
}
</script>
