<template>
  <n-space justify="space-between" align="baseline">
    <n-space align="start">
      <n-image :src="logoUrl" alt="FlexTool" :width="90" preview-disabled />
      <n-menu :default-value="current" mode="horizontal" :options="links" />
    </n-space>
    <n-space align="baseline">
      <n-a href="https://irena-flextool.github.io/flextool/">User guide</n-a>
      <n-divider vertical />
      <n-button @click="logout"> Log out </n-button>
    </n-space>
  </n-space>
</template>

<script>
import { h, ref } from 'vue/dist/vue.esm-bundler.js'
import { NA } from 'naive-ui'

function linkLabel(label, url) {
  return () => h(NA, { href: url }, () => label)
}

/**
 * Creates options list for the navigation menu.
 * @param {Object} props NavigationMenu's props.
 * @returns {Object[]} Menu entries.
 */
function menuEntries(props) {
  const pages = {
    Projects: props.indexUrl,
    'Manage project': props.projectUrl,
    'Edit model': props.editUrl,
    Run: props.runUrl,
    Results: props.resultsUrl
  }
  const entries = []
  for (const name in pages) {
    const url = pages[name]
    const hasUrl = url !== null
    const label = hasUrl ? linkLabel(name, url) : name
    entries.push({ label: label, key: name, disabled: !hasUrl })
  }
  return entries
}

export default {
  props: {
    current: { type: String, required: true },
    indexUrl: { type: String, required: true },
    projectUrl: { type: String, required: false, default: null },
    editUrl: { type: String, required: false, default: null },
    runUrl: { type: String, required: false, default: null },
    resultsUrl: { type: String, required: false, default: null },
    logoutUrl: { type: String, required: true },
    logoUrl: { type: String, required: true }
  },
  setup(props) {
    const links = menuEntries(props)
    const activeKey = ref(null)
    return {
      links: links,
      activeKey: activeKey,
      logout() {
        location.assign(props.logoutUrl)
      }
    }
  }
}
</script>
