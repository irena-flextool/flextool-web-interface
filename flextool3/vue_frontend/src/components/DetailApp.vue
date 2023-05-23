<template>
    <page name="Manage project" :index-url="indexUrl" :project-url="projectUrl" :edit-url="editUrl" :run-url="runUrl"
        :results-url="resultsUrl" :logout-url="logoutUrl" :logo-url="logoUrl">
        <template #header>
            <page-path :path="[{ name: 'Projects', url: indexUrl }]" :leaf-name="projectName"></page-path>
        </template>
        <n-space>
            <n-space vertical>
                <n-h1>Links</n-h1>
                <n-space vertical>
                    <n-p><n-a :href="editUrl">Model editor</n-a> lets you to define the project's model.</n-p>
                    <n-p><n-a :href="runUrl">Run</n-a> page allows you to set up scenarios and solve the model.</n-p>
                    <n-p><n-a :href="resultsUrl">Results</n-a> shows results of solved scenarios.</n-p>
                </n-space>
                <n-h1>Import or export model</n-h1>
                <n-p>Warning: importing will overwrite model data.</n-p>
                <n-p>Download model database <n-a :href="modelExportUrl">here</n-a>.</n-p>
                <n-upload :name="uploadFieldName" :action="fileUploadUrl" :headers="uploadHeaders" accept=".sqlite,.xlsx,"
                    :show-file-list="false" :disabled="isUploadDisabled" @before-upload="prepareUpload"
                    @change="updateUploadStatus" @finish="finalizeUpload" @error="showUploadError">
                    <n-tooltip>
                        <template #trigger>
                            <n-button>Upload model</n-button>
                        </template>
                        Upload existing model database or import an Excel file.
                    </n-tooltip>
                </n-upload>
                <n-progress v-if="isUploading" type="line" :percentage="uploadPercentage" :show-indicator="false" />
                <n-alert v-else-if="isDatabaseUploadSuccessful" title="Database upload successful" type="success"></n-alert>
                <n-space vertical v-else-if="isImportingExcel">
                    <n-text>Excel file uploaded.</n-text>
                    <n-space>
                        <n-spin size="small" description="Importing Excel file..." />
                        <n-button @click="abortExcelInputImport">Cancel</n-button>
                    </n-space>
                </n-space>
                <n-alert v-else-if="isExcelImportSuccessful" title=" Excel file import successful." type="success">
                    <n-button @click="showImportLog">Log...</n-button>
                </n-alert>
                <n-alert v-else-if="isExcelImportFailure" title="Excel import failed." type="error">
                    <n-button @click="showImportLog">Log...</n-button>
                </n-alert>
                <n-text v-else-if="isAbortingExcelImport">Aborting...</n-text>
                <n-text v-else-if="isExcelImportAborted">Aborted.</n-text>
            </n-space>
            <n-space vertical>
                <n-h1>Usage hints</n-h1>
                <n-p>
                    Links on these pages can be opened in different browser tabs or windows.
                    It is possible to e.g. open two Model editors side-by-side to compare or copy data around.
                </n-p>
                <n-h1>Example systems</n-h1>
                <n-p>Add example systems to the model from the list below.</n-p>
                <examples :project-id="projectId" :examples-url="examplesUrl" />
            </n-space>
        </n-space>
        <n-modal v-model:show="isExcelImportLogDialogShown">
            <n-card title="Excel file import log">
                <n-log :lines="excelImportLog" />
            </n-card>
        </n-modal>
    </page>
</template>

<script>
import { computed, onMounted, ref } from "vue/dist/vue.esm-bundler.js";
import { useMessage } from "naive-ui";
import { abortExecution, csrftoken, executeExcelInputImport, fetchCurrentExecution } from "../modules/communication.mjs";
import { executionStatus, executionType, followExecution } from "../modules/executions.mjs";
import Examples from "./Examples.vue";
import Page from "./Page.vue";
import PagePath from "./PagePath.vue";

const state = {
    idle: Symbol("nothing ongoing"),
    uploading: Symbol("file is being uploaded"),
    importing: Symbol("file is being imported"),
    aborting: Symbol("aboring file import"),
    done: Symbol("file processed"),
    error: Symbol("upload failed"),
};

const fileType = {
    none: Symbol("no file"),
    database: Symbol(".sqlite file"),
    excel: Symbol(".xlsx file"),
}

export default {
    props: {
        projectName: { type: String, required: true },
        projectId: { type: Number, required: true },
        projectUrl: { type: String, required: true },
        indexUrl: { type: String, required: true },
        editUrl: { type: String, required: true },
        runUrl: { type: String, required: true },
        resultsUrl: { type: String, required: true },
        examplesUrl: { type: String, required: true },
        executionsUrl: { type: String, required: true },
        logoutUrl: { type: String, required: true },
        logoUrl: { type: String, required: true },
        modelExportUrl: { type: String, required: true },
        fileUploadUrl: { type: String, required: true },
    },
    components: {
        "examples": Examples,
        "page": Page,
        "page-path": PagePath,
    },
    setup(props) {
        const uploadState = ref(state.idle);
        const uploadFileType = ref(fileType.none);
        const uploadPercentage = ref(0);
        const isUploading = computed(() => uploadState.value === state.uploading);
        const isDatabaseUploadSuccessful = computed(() => uploadFileType.value === fileType.database && uploadState.value === state.done);
        const isImportingExcel = computed(() => uploadFileType.value === fileType.excel && uploadState.value === state.importing);
        const isAbortingExcelImport = computed(() => uploadFileType.value === fileType.excel && uploadState.value === state.aborting);
        const excelImportLog = ref([]);
        const excelImportExecutionStatus = ref(executionStatus.yetToStart);
        const isExcelImportSuccessful = computed(() => uploadState.value === state.done && excelImportExecutionStatus.value === executionStatus.finished);
        const isExcelImportFailure = computed(() => uploadFileType.value === fileType.excel && uploadState.value === state.done && excelImportExecutionStatus.value === executionStatus.error);
        const isExcelImportAborted = computed(() => uploadFileType.value === fileType.excel && uploadState.value === state.done && excelImportExecutionStatus.value === executionStatus.aborted);
        const isExcelImportLogDialogShown = ref(false);
        const isAnotherExecutionOngoing = ref(false);
        const isUploadDisabled = computed(() => isAnotherExecutionOngoing.value || (uploadState.value !== state.idle && uploadState.value !== state.done && uploadState.value !== state.error));
        const uploadFieldName = ref("");
        const message = useMessage();
        const prepareUpload = function ({ file }) {
            uploadState.value = state.uploading;
            if (file.name.toLowerCase().endsWith(".xlsx")) {
                uploadFieldName.value = "excel_input";
                uploadFileType.value = fileType.excel;
                excelImportExecutionStatus.value = executionStatus.yetToStart;
                return true;
            }
            else if (file.name.toLowerCase().endsWith(".sqlite")) {
                uploadFieldName.value = "model_database";
                uploadFileType.value = fileType.database;
                return true;
            }
            uploadState.value = state.error;
            message.error("Can only upload .xlsx or .sqlite files.");
            return false;
        };
        const updateUploadStatus = function ({ file }) {
            uploadPercentage.value = file.percentage;
        };
        const finalizeUpload = function ({ file }) {
            if (uploadFileType.value === fileType.excel) {
                uploadState.value = state.importing;
                executeExcelInputImport(props.projectId, props.executionsUrl)
                    .then(function (data) {
                        if (data.status !== "busy") {
                            followExecution(props.projectId, props.executionsUrl, excelImportLog, excelImportExecutionStatus, message, finishImportingExcel);
                        }
                        else {
                            message.error("Another execution ongoing.");
                        }
                    }).catch(function (error) {
                        message.error(error.message);
                        uploadState.value = state.error;
                    });
            }
            else if (uploadFileType.value === fileType.database) {
                uploadState.value = state.done;
            }
            else {
                message.error("Unknown upload field name.");
            }
            return file;
        };
        const showUploadError = function () {
            message.error("Upload failed.");
            uploadPercentage.value = 0;
            uploadState.value = state.error;
        };
        const finishImportingExcel = function () {
            uploadState.value = state.done;
        };
        const abortExcelInputImport = function () {
            uploadState.value = state.aborting;
            abortExecution(props.projectId, props.executionsUrl).catch(function (error) {
                message.error(error.message);
            });
        };
        const showImportLog = () => isExcelImportLogDialogShown.value = true;
        onMounted(function () {
            fetchCurrentExecution(
                props.projectId, props.executionsUrl
            ).then(function (data) {
                if (data.type !== executionType.importExcel && data.status === executionStatus.running) {
                    switch (data.type) {
                        case executionType.solve:
                            message.warning("Server is busy solving the model");
                            isAnotherExecutionOngoing.value = true;
                            break;
                        default:
                            message.error("Server is busy.");
                    }
                }
                else if (data.type === executionType.importExcel && data.status === executionStatus.running) {
                    uploadFileType.value = fileType.excel;
                    uploadState.value = state.importing;
                    followExecution(props.projectId, props.executionsUrl, excelImportLog, excelImportExecutionStatus, message, finishImportingExcel);
                }
            }).catch(function (error) {
                message.error(error.message);
                uploadState.value = state.error;
            });

        });
        return {
            uploadPercentage: uploadPercentage,
            isUploading: isUploading,
            isDatabaseUploadSuccessful: isDatabaseUploadSuccessful,
            isUploadDisabled: isUploadDisabled,
            isImportingExcel: isImportingExcel,
            isAbortingExcelImport: isAbortingExcelImport,
            isExcelImportSuccessful: isExcelImportSuccessful,
            isExcelImportFailure: isExcelImportFailure,
            isExcelImportAborted: isExcelImportAborted,
            isExcelImportLogDialogShown: isExcelImportLogDialogShown,
            excelImportLog: excelImportLog,
            uploadFieldName: uploadFieldName,
            uploadHeaders() {
                return { "X-CSRFToken": csrftoken };
            },
            prepareUpload: prepareUpload,
            updateUploadStatus: updateUploadStatus,
            finalizeUpload: finalizeUpload,
            showUploadError: showUploadError,
            abortExcelInputImport: abortExcelInputImport,
            showImportLog: showImportLog,
        };
    },
}
</script>
