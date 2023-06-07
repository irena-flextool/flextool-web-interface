<template>
  <n-spin v-if="state === 'loading'" />
  <n-result
    v-else-if="state === 'error'"
    status="error"
    title="Error"
    :description="errorMessage"
  />
  <slot v-else-if="state === 'waiting'" name="waiting"></slot>
  <slot v-else></slot>
</template>

<script>
export default {
  props: {
    state: { type: String, required: true },
    errorMessage: { type: String, required: false, default: '' }
  },
  state: {
    loading: 'loading',
    waiting: 'waiting',
    ready: 'ready',
    error: 'error'
  }
}
</script>
