<template>
  <n-text v-if="!isEditing" @dblclick="startEditing">{{ text }}</n-text>
  <item-name-input v-else :name="text" @accept="changeText" @cancel="cancel"></item-name-input>
</template>

<script>
import { ref } from 'vue/dist/vue.esm-bundler.js'
import ItemNameInput from './ItemNameInput.vue'

export default {
  props: {
    text: { type: String, required: true }
  },
  emits: ['edited'],
  components: {
    'item-name-input': ItemNameInput
  },
  setup(props, context) {
    const isEditing = ref(false)
    return {
      isEditing: isEditing,
      startEditing() {
        isEditing.value = true
      },
      changeText(newText) {
        isEditing.value = false
        context.emit('edited', { old: props.text, new: newText })
      },
      cancel() {
        isEditing.value = false
      }
    }
  }
}
</script>
