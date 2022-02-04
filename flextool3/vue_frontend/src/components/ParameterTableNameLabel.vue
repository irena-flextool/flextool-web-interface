<template>
    <n-tooltip>
        <template #trigger>
            {{ name }}
        </template>
        {{ description }}
    </n-tooltip>
</template>

<script>
export default {
    props: {
        name: String,
        description: String
    }
}
</script>
