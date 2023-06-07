<template>
  <n-space justify="space-between">
    <n-input
      type="text"
      placeholder="Enter project name..."
      clearable
      maxlength="60"
      @input="updateProjectName"
      :value="projectName"
      :disabled="busy"
    />
    <n-button @click="create" :loading="busy" :disabled="buttonDisabled">Create</n-button>
  </n-space>
</template>
<script>
import { computed, ref } from 'vue/dist/vue.esm-bundler.js'
import { useMessage } from 'naive-ui'
import { createProject } from '../modules/communication.mjs'

export default {
  props: {
    projectsUrl: String
  },
  emit: ['created:project'],
  setup(props, { emit }) {
    const projectName = ref('')
    const busy = ref(false)
    const message = useMessage()
    const buttonDisabled = computed(function () {
      if (projectName.value.length === 0 || busy.value) {
        return true
      } else {
        return false
      }
    })
    return {
      buttonDisabled: buttonDisabled,
      projectName: projectName,
      busy: busy,
      updateProjectName(text) {
        projectName.value = text
      },
      create() {
        busy.value = true
        createProject(projectName.value, String(props.projectsUrl))
          .then(function (data) {
            emit('created', data.project)
            projectName.value = ''
          })
          .catch(function (error) {
            message.error(error.message)
          })
          .finally(function () {
            busy.value = false
          })
      }
    }
  }
}
</script>
