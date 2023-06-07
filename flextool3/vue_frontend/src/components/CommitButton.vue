<template>
  <n-space align="baseline">
    <n-button :disabled="buttonDisabled" :loading="committing" @click="emitCommitRequest">
      Commit
    </n-button>
    <n-text v-if="errorMessage" type="error">
      {{ errorMessage }}
    </n-text>
    <n-text v-else-if="hasPendingChanges"> There are pending changes. </n-text>
    <n-text v-else> Nothing to commit. </n-text>
  </n-space>
</template>

<script>
import { computed } from 'vue/dist/vue.esm-bundler.js'

export default {
  props: {
    hasPendingChanges: { type: Boolean, required: true },
    committing: { type: Boolean, required: true },
    errorMessage: { type: String, required: false, default: '' }
  },
  emit: ['commitRequest'],
  setup(props, context) {
    const buttonDisabled = computed(
      () => !props.hasPendingChanges || props.errorMessage.length !== 0
    )
    return {
      buttonDisabled: buttonDisabled,
      emitCommitRequest() {
        context.emit('commitRequest')
      }
    }
  }
}
</script>
