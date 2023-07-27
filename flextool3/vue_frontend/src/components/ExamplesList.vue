<template>
  <fetchable :state="state" :error-message="errorMessage">
    <n-tree id="example-list" :data="examples" :selectable="false" block-line />
  </fetchable>
</template>

<script>
import { h, ref } from 'vue/dist/vue.esm-bundler.js'
import ExamplesListSuffix from './ExamplesListSuffix.vue'
import Fetchable from './Fetchable.vue'
import { fetchExampleList, addExample } from '../modules/communication.mjs'

export default {
  props: {
    projectId: { type: Number, required: true },
    examplesUrl: { type: String, required: true }
  },
  components: {
    fetchable: Fetchable
  },
  setup(props) {
    const examples = ref([])
    const state = ref(Fetchable.state.loading)
    const errorMessage = ref('')
    const addExampleToModel = function (suffix) {
      suffix.setLoading(true)
      addExample(props.projectId, props.examplesUrl, suffix.example)
        .then(function (data) {
          suffix.setStatus(data.status)
        })
        .catch(function () {
          suffix.setStatus('failure')
        })
        .finally(function () {
          suffix.setLoading(false)
        })
    }
    fetchExampleList(props.projectId, props.examplesUrl)
      .then(function (data) {
        const exampleData = data.examples
        const exampleList = []
        for (const example of exampleData) {
          exampleList.push({
            key: example,
            label: example,
            suffix: () => h(ExamplesListSuffix, { example: example, onAdd: addExampleToModel })
          })
        }
        examples.value = exampleList
        state.value = Fetchable.state.ready
      })
      .catch(function (error) {
        errorMessage.value = error.message
        state.value = Fetchable.state.error
      })
    return {
      examples: examples,
      state: state,
      errorMessage: errorMessage
    }
  }
}
</script>

<style>
#example-list {
  max-width: 25em;
}
</style>
