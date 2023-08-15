<template>
    <div>
        <div class="top">
            <div class="top-op">
                <div class="btn">
                    <el-upload :show-file-list="false" :with-credentials="true" :multiple="true"
                        :http-request="addFile">
                        <el-button type="primary">
                            <span class="iconfont icon-upload"></span>
                            上传
                        </el-button>
                    </el-upload>
                </div>
                <el-button type="success" @click="newFolder">
                    <span class="iconfont icon-folder-add"></span>
                    新建文件夹
                </el-button>
                <el-button type="danger" :disabled="selectFileIdList == 0" @click="delFileBatch">
                    <span class="iconfont icon-del"></span>
                    批量删除
                </el-button>
                <el-button type="warning" :disabled="selectFileIdList == 0" @click="moveFolderBatch">
                    <span class="iconfont icon-move"></span>
                    批量移动
                </el-button>
                <div class="search-panel">
                    <el-input clearable placeholder="请输入文件名搜索" v-model="fileNameFuzzy" @keyup.enter="search">
                        <template #suffix>
                            <i class="iconfont icon-search" @click="search" style="cursor: pointer"></i>
                        </template>
                    </el-input>
                </div>
                <div class="iconfont icon-refresh" @click="refresh"></div>
            </div>
            <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
        </div>
        <div class="file-list">
            <Table ref="dataTableRef" :columns="columns" :showPagination="true" :dataSource="tableData"
                :fetch="loadDataList" :initFetch="false" :options="tableOptions" @rowSelected="rowSelected">
                <template #fileName="{index, row}">
                    <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
                        <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2">
                            <Icon :cover="row.fileCover" :width="32"></Icon>
                        </template>
                        <template v-else>
                            <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
                            <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
                        </template>
                        <span class="file-name" :title="row.fileName" v-if="!row.showEdit">
                            <span @click="preview(row)">{{row.fileName}}</span>
                            <span v-if="row.status == 0" class="transfer-status">转码中</span>
                            <span v-if="row.status == 1" class="transfer-status transfer-fail">转码失败</span>
                        </span>
                        <div class="edit-panel" v-if="row.showEdit">
                            <el-input v-model="row.fileNameReal" ref="editNameRef" :maxlength="190"
                                @keyup.enter="saveNameEdit(index)">
                                <template #suffix>
                                    {{row.fileSuffix}}
                                </template></el-input>
                            <span :class="['iconfont icon-right1', row.fileNameReal?'':'not-allow']"
                                @click="saveNameEdit(index)"></span>
                            <span class="iconfont icon-error" @click="cancelNameEdit(index)"></span>
                        </div>
                        <span class="op">
                            <template v-if="row.showOp && row.fileId && row.status == 2">
                                <span class="iconfont icon-share1" @click="share(row)">分享</span>
                                <span class="iconfont icon-download" v-if="row.folderType == 0"
                                    @click="downloadFile(row)">下载</span>
                                <span class="iconfont icon-del" @click="delFile(row)">删除</span>
                                <span class="iconfont icon-edit" @click="editFileName(index)">重命名</span>
                                <span class="iconfont icon-move" @click="moveFolder">移动</span>
                            </template>
                        </span>
                    </div>
                </template>
                <template #fileSize="{index, row}">
                    <span v-if="row.fileSize">{{proxy.Utils.sizeToStr(row.fileSize)}}</span>
                </template>
            </Table>
        </div>
        <Preview ref="previewRef"> </Preview>
        <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
        <ShareFile ref="shareFileRef"></ShareFile>
    </div>
</template>

<script setup>
    import { ref, reactive, getCurrentInstance, nextTick, defineEmits } from "vue"

    const { proxy } = getCurrentInstance()
    const emit = defineEmits(["addFile"])

    const columns = [
        {
            label: "文件名",
            prop: "fileName",
            scopedSlots: "fileName"
        },
        {
            label: "修改时间",
            prop: "lastUpdateTime",
            width: 200
        },
        {
            label: "大小",
            prop: "fileSize",
            scopedSlots: "fileSize",
            width: 200
        },
    ]
    const tableData = ref({})
    const fileNameFuzzy = ref()
    const category = ref()
    const editing = ref(false)
    const editNameRef = ref()
    const currentFolder = ref({ fileId: 0 })
    const selectFileIdList = ref([])
    const folderSelectRef = ref()
    const currentMoveFile = ref({})
    const navigationRef = ref()
    const showLoading = ref(true)
    const shareFileRef = ref()
    const previewRef = ref()

    const tableOptions = ref({
        extHeight: 50,
        selectType: "checkbox"
    })

    const loadDataList = async () => {
        let params = {
            pageNo: tableData.value.pageNo,
            pageSize: tableData.value.pageSize,
            fileNameFuzzy: fileNameFuzzy.value,
            filePid: currentFolder.value.fileId,
            category: category.value
        }
        if (params.category !== "all") {
            delete params.filePid
        }
        let result = await proxy.Request({
            url: "/file/loadDataList",
            params: params,
            showLoading: showLoading.value
        })
        if (!result) {
            return
        }
        tableData.value = result.data
    }
    const rowSelected = (row) => {
        row.forEach(item => {
            selectFileIdList.value.push(item.fileId)
        })
    }

    const addFile = (fileData) => {
        emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId })
    }

    const search = () => {
        showLoading.value = true
        loadDataList()
    }

    const refresh = () => {
        showLoading.value = true
        fileNameFuzzy.value = ''
        loadDataList()
    }

    const showOp = (row) => {
        tableData.value.list.forEach(element => {
            element.showOp = false
        })
        row.showOp = true
    }

    const cancelShowOp = (row) => {
        row.showOp = false
    }

    const newFolder = () => {
        if (editing.value) {
            return
        }
        tableData.value.list.forEach(element => {
            element.showEdit = false
        })
        editing.value = true
        tableData.value.list.unshift({
            showEdit: true,
            fileType: 0,
            fileId: "",
            filePid: currentFolder.value.fileId
        })
        nextTick(() => {
            editNameRef.value.focus()
        })
    }

    const saveNameEdit = async (index) => {
        const { fileId, filePid, fileNameReal } = tableData.value.list[index]
        if (fileNameReal == "" || fileNameReal.indexOf("/") != -1) {
            proxy.Message.warning("文件名不能为空且不能含有斜杠")
            return
        }
        let url = "/file/rename"
        if (fileId == "") {
            url = "/file/newFolder"
        }

        let result = await proxy.Request({
            url: url,
            params: {
                fileId: fileId,
                filePid: filePid,
                fileName: fileNameReal
            }
        })
        if (!result) {
            return
        }
        tableData.value.list[index] = result.data
        editing.value = false
    }

    const cancelNameEdit = (index) => {
        const fileData = tableData.value.list[index]
        if (fileData.fileId) {
            fileData.showEdit = false
        } else {
            tableData.value.list.splice(index, 1)
        }
        editing.value = false
    }

    const editFileName = (index) => {
        if (tableData.value.list[0].fileId == "") {
            tableData.value.list.splice(0, 1)
            index = index - 1
        }
        tableData.value.list.forEach(element => {
            element.showEdit = false
        })
        let currentData = tableData.value.list[index]
        currentData.showEdit = true

        if (currentData.folderType == 0) {
            currentData.fileNameReal = currentData.fileName.substring(0, currentData.fileName.indexOf("."))
            currentData.fileSuffix = currentData.fileName.substring(currentData.fileName.indexOf("."))
        } else {
            currentData.fileNameReal = currentData.fileName
            currentData.fileSuffix = ""
        }
        editing.value = true
        nextTick(() => {
            editNameRef.value.focus()
        })
    }

    const delFile = (row) => {
        proxy.Confirm(`你确定要删除${row.fileName}吗？删除的文件可在10天内通过回收站还原`, async () => {
            let result = await proxy.Request({
                url: "/file/delFile",
                params: {
                    fileIds: row.fileId
                }
            })
            if (!result) {
                return
            }
            loadDataList()
        })
    }

    const delFileBatch = () => {
        if (selectFileIdList.value.length == 0) {
            return
        }
        proxy.Confirm(`你确定要删除这些文件吗？删除的文件可在10天内通过回收站还原`, async () => {
            let result = await proxy.Request({
                url: "/file/delFile",
                params: {
                    fileIds: selectFileIdList.value.join(",")
                }
            })
            if (!result) {
                return
            }
            loadDataList()
        })
    }

    const downloadFile = async (row) => {
        let result = await proxy.Request({
            url: '/file/createDownLoadUrl',
            params: {
                fileId: row.fileId
            }
        })
        if (!result) {
            return
        }
        window.location.href = "/api/file/download" + "/" + result.data
    }

    const share = (row) => {
        shareFileRef.value.show(row)
    }

    const moveFolderBatch = () => {
        currentMoveFile.value = {}
        folderSelectRef.value.showFolderDialog(currentFolder.value.fileId)
    }

    const moveFolder = (data) => {
        currentMoveFile.value = data
        folderSelectRef.value.showFolderDialog(currentFolder.value.fileId)
    }

    const moveFolderDone = async (folderId) => {
        if (currentFolder.value.fileId == folderId) {
            proxy.Message.warning("文件正在当前目录，无需移动")
            return
        }
        let fileIdArray = []
        if (currentMoveFile.value.fileId) {
            fileIdArray.push(currentMoveFile.value.fileId)
        } else {
            fileIdArray = fileIdArray.concat(selectFileIdList.value)
        }
        let result = await proxy.Request({
            url: "/file/changeFileFolder",
            params: {
                fileIds: fileIdArray.join(","),
                filePid: folderId
            }
        })
        if (!result) {
            return
        }
        folderSelectRef.value.close()
        loadDataList()
    }

    const preview = (data) => {
        if (data.folderType == 1) {
            navigationRef.value.openFolder(data)
        }
        if (data.status != 2) {
            proxy.Message.warning("文件正在转码中，无法预览")
            return
        }
        previewRef.value.showPreview(data, 0)
    }

    const navChange = (data) => {
        const { categoryId, curFolder } = data
        currentFolder.value = curFolder
        category.value = categoryId
        loadDataList()
    }

    const reload = () => {
        showLoading.value = false
        loadDataList()
    }

    defineExpose({
        reload
    })

</script>

<style scoped>
    .top {
        margin-top: 20px;
    }

    .top-op {
        display: flex;
        align-items: center;
    }

    .btn {
        margin-right: 10px;
    }

    .search-panel {
        margin-left: 10px;
        width: 300px;
    }

    .icon-refresh {
        cursor: pointer;
        margin-left: 10px;
    }

    .not-allow {
        background: #d2d2d2 !important;
        cursor: not-allowed;
    }

    .file-item {
        display: flex;
        align-items: center;
        padding: 6px 0px;
    }

    .file-name {
        margin-left: 8px;
        flex: 1;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .top-op span {
        cursor: pointer;
        margin-right: 5px;
    }

    span:hover {
        color: #06a7ff;
    }

    .transfer-status {
        font-size: 13px;
        margin-left: 10px;
        color: #e6a23c;
    }

    .transfer-fail {
        color: #f75000;
    }


    .edit-panel {
        flex: 1;
        width: 0;
        display: flex;
        align-items: center;
        margin: 0px 5px;
    }

    .edit-panel .iconfont {
        margin-left: 10px;
        background: #0c95f7;
        color: #fff;
        padding: 3px 5px;
        border-radius: 5px;
        cursor: pointer;
    }

    .not-allow {
        cursor: not-allowed;
        background: #7cb1d7;
        color: #ddd;
        text-decoration: none;
    }


    .op {
        width: 280px;
        margin-left: 15px;
    }

    .op .iconfont {
        font-size: 13px;
        margin-left: 10px;
        color: #06a7ff;
        cursor: pointer;
    }

    .op .iconfont::before {
        margin-right: 3px;
    }


    .no-data {
        height: calc(100vh - 150px);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .no-data-inner {
        text-align: center;
    }

    .tips {
        margin-top: 10px;
    }

    .op-list {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .op-item {
        cursor: pointer;
        width: 100px;
        height: 100px;
        margin: 0px 10px;
        padding: 5px 0px;
        background: rgb(241, 241, 241);
    }
</style>