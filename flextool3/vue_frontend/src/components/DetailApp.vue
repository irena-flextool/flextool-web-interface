<template>
    <n-h1>{{projectName}}</n-h1>
    <n-space vertical>
        <n-p>This is the navigation hub for the current FlexTool 3 project. Available actions:</n-p>
        <n-p><n-a :href="editUrl">Model editor</n-a> lets you to define the project's model.</n-p>
        <n-p><n-a :href="solveUrl">Solve</n-a> page allows you to define scenarios and solve the model.</n-p>
        <n-p><n-a :href="viewUrl">Results</n-a> shows results of solved scenarios.</n-p>
    </n-space>
</template>
<script>
export default {
    props: {
        projectName: String,
        editUrl: String,
        solveUrl: String,
        viewUrl: String
    }
}
</script>
