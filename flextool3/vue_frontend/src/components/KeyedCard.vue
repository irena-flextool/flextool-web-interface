<template>
  <n-card closable :title="title" @close="emitClose" size="small">
    <slot></slot>
  </n-card>
</template>

<script>
export default {
  props: {
    fingerprint: { type: [Number, String], required: true },
    title: { type: String, required: false }
  },
  emits: ['close'],
  setup(props, context) {
    return {
      emitClose() {
        context.emit('close', props.fingerprint)
      }
    }
  }
}
</script>
