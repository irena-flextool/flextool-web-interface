<template>
  <n-tooltip width="350">
    <template #trigger>
      {{ name }}
    </template>
    {{ description }}
  </n-tooltip>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    description: { type: String, required: false }
  }
}
</script>
