<template>
  <n-input
    v-model:value="value"
    ref="instance"
    @blur="cancel"
    @keydown="handleKey"
    maxlength="155"
    size="small"
    clearable
  />
</template>

<script>
import { onMounted, ref } from 'vue/dist/vue.esm-bundler.js'
export default {
  props: {
    name: String
  },
  emits: ['accept', 'cancel'],
  setup(props, context) {
    const value = ref(props.name)
    const instance = ref(null)
    onMounted(function () {
      instance.value?.select()
    })
    return {
      instance: instance,
      value: value,
      cancel() {
        value.value = props.name
        context.emit('cancel')
      },
      handleKey(keyInfo) {
        const sanitized = value.value.trim()
        switch (keyInfo.key) {
          case 'Enter':
            if (sanitized && sanitized !== props.name) {
              context.emit('accept', sanitized)
            } else {
              value.value = props.name
              context.emit('cancel')
            }
            break
          case 'Escape':
            value.value = props.name
            context.emit('cancel')
            break
        }
      }
    }
  }
}
</script>
