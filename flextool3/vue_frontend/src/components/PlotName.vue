<template>
  <n-h2 prefix="bar">
    <editable-text :text="name" :accept-empty="true" @edited="emitTitleUpdated" />
  </n-h2>
</template>

<script>
import EditableText from './EditableText.vue'

export default {
  props: {
    identifier: { type: Number, required: true },
    name: { type: String, required: false }
  },
  emits: ['update:name'],
  components: {
    'editable-text': EditableText
  },
  setup(props, context) {
    return {
      emitTitleUpdated(updateInfo) {
        context.emit('update:name', {
          identifier: props.identifier,
          plotName: updateInfo.new,
          updateSpecification: true
        })
      }
    }
  }
}
</script>
