import 'vite/modulepreload-polyfill'
import * as Vue from 'vue/dist/vue.esm-bundler.js'
import naive from 'naive-ui'
import DetailApp from './components/DetailApp.vue'

const app = Vue.createApp({})
app.use(naive)
app.component('detail-app', DetailApp)
app.mount('#detail-app')
