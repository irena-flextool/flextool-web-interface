<template>
    <n-breadcrumb>
        <n-breadcrumb-item v-for="(part, index) in path" :href="part.url" :key="index">
            {{ part.name }}
        </n-breadcrumb-item>
        <n-breadcrumb-item>
            {{ leafName }}
        </n-breadcrumb-item>
    </n-breadcrumb>
</template>

<script>

export default {
    props: {
        path: Array,
        leafName: String
    }
}
</script>