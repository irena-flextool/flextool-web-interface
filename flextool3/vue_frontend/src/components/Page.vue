<template>
  <n-layout position="absolute" content-style="display: flex; flex-direction: column;">
    <n-layout-header>
      <n-card size="small">
        <navigation-menu
          :current="name"
          :index-url="indexUrl"
          :project-url="projectUrl"
          :edit-url="editUrl"
          :run-url="runUrl"
          :results-url="resultsUrl"
          :logout-url="logoutUrl"
          :logo-url="logoUrl"
        />
      </n-card>
      <slot name="header"></slot>
    </n-layout-header>
    <n-layout-content content-style="margin-left: 1em; maring-right: 1em;">
      <slot></slot>
    </n-layout-content>
  </n-layout>
</template>

<script>
import NavigationMenu from './NavigationMenu.vue'

export default {
  props: {
    name: { type: String, required: true },
    indexUrl: { type: String, required: true },
    projectUrl: { type: String, required: false, default: null },
    editUrl: { type: String, required: false, default: null },
    runUrl: { type: String, required: false, default: null },
    resultsUrl: { type: String, required: false, default: null },
    logoutUrl: { type: String, required: true },
    logoUrl: { type: String, required: true }
  },
  components: {
    'navigation-menu': NavigationMenu
  }
}
</script>
