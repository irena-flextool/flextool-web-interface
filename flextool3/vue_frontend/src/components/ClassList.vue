<template>
  <fetchable :state="state" :error-message="errorMessage">
    <n-ul>
      <n-li v-for="objectClass in objectClasses" :key="objectClass.id">
        <n-a :href="objectClass.entitiesUrl">{{ objectClass.name }}</n-a>
        {{ objectClass.description }}
        <n-ul>
          <n-li
            v-for="relationshipClass in relationshipClasses[objectClass.id]"
            :key="relationshipClass.id"
          >
            <n-a :href="relationshipClass.entitiesUrl">{{ relationshipClass.name }}</n-a>
            {{ relationshipClass.description }}
          </n-li>
        </n-ul>
      </n-li>
    </n-ul>
  </fetchable>
</template>

<script>
import { onMounted, ref } from 'vue/dist/vue.esm-bundler.js'
import * as Communication from '../modules/communication.mjs'
import Fetchable from './Fetchable.vue'

export default {
  props: {
    classType: { type: String, required: true },
    projectId: { type: Number, required: true },
    modelUrl: { type: String, required: true }
  },
  components: {
    fetchable: Fetchable
  },
  setup(props) {
    const objectClasses = ref([])
    const relationshipClasses = ref(new Map())
    const state = ref(Fetchable.state.loading)
    const errorMessage = ref('')
    onMounted(function () {
      const fetchType = props.classType === 'physical' ? 'physical classes?' : 'model classes?'
      Communication.fetchData(fetchType, props.projectId, props.modelUrl)
        .then(function (data) {
          const relationshipClassMap = new Map()
          for (const [key, value] of Object.entries(data.relationshipClasses)) {
            relationshipClassMap[parseInt(key)] = value
          }
          relationshipClasses.value = relationshipClassMap
          objectClasses.value = data.objectClasses
          state.value = Fetchable.state.ready
          errorMessage.value = ''
        })
        .catch(function (error) {
          errorMessage.value = error.message
          state.value = Fetchable.state.error
        })
    })
    return {
      objectClasses: objectClasses,
      relationshipClasses: relationshipClasses,
      state: state,
      errorMessage: errorMessage
    }
  }
}
</script>
