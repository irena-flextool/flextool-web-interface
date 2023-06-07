<template>
  <n-button size="tiny" @click="emitDelete">Delete</n-button>
</template>

<script>
export default {
  props: {
    emblem: { type: [String, Array], required: true }
  },
  emits: ['delete'],
  setup(props, context) {
    return {
      emitDelete() {
        context.emit('delete', props.emblem)
      }
    }
  }
}
</script>
