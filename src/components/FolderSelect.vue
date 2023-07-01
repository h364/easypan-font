<template>
    <div>
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="600px"
            :showCancel="true" @close="close">
            <div class="navigation-panel">
                <Navigation ref="navigationRef" :watchPath="false" @navChange="navChange"></Navigation>
            </div>
            <div class="folder-list" v-if="folderList.length > 0">
                <div class="folder-item" v-for="item in folderList" @click="selectFolder(item)">
                    <Icon :fileType="0"></Icon>
                    <span class="file-name">{{ item.fileName }}</span>
                </div>
            </div>
            <div v-else class="tips">
                移动到 <span>{{ currentFolder.fileName }}</span> 文件夹
            </div>
        </Dialog>
    </div>
</template>

<script setup>
    import { ref, getCurrentInstance } from "vue"

    const { proxy } = getCurrentInstance()

    const filePid = ref("0")
    const currentFileIds = ref({})
    const currentFolder = ref({})
    const folderList = ref([])
    const navigationRef = ref()
    const emit = defineEmits(["folderSelect"])
    const dialogConfig = ref({
        show: false,
        title: "移动到",
        buttons: [
            {
                type: "primary",
                click: () => {
                    folderSelect()
                },
                text: "移动到此",
            },
        ],
    })

    const loadAllFolder = async () => {
        let result = await proxy.Request({
            url: "/file/loadAllFolder",
            params: {
                filePid: filePid.value,
                currentFileIds: currentFileIds.value,
            },
        });
        if (!result) {
            return;
        }
        folderList.value = result.data
    }

    const showFolderDialog = (curFileIds) => {
        dialogConfig.value.show = true;
        currentFileIds.value = curFileIds;
        console.log(currentFileIds.value);
        loadAllFolder()
    }

    const close = () => {
        dialogConfig.value.show = false
    }

    const selectFolder = (data) => {
        navigationRef.value.openFolder(data)
    }

    const navChange = (data) => {
        const { curFolder } = data
        currentFolder.value = curFolder
        filePid.value = curFolder.fileId
        loadAllFolder()
    }

    const folderSelect = () => {
        emit("folderSelect", filePid.value)
    }

    defineExpose({
        showFolderDialog,
        close
    })
</script>

<style scoped>
    .navigation-panel {
        padding-left: 10px;
        background: #f1f1f1;
    }

    .folder-list {
        max-height: calc(100vh - 200px);
        min-height: 200px;
    }

    .folder-item {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 10px;
    }

    .file-name {
        display: inline-block;
        margin-left: 10px;
    }

    .folder-item:hover {
        background: #f8f8f8;
    }

    .tips {
        text-align: center;
        line-height: 200px;
    }

    .tips span {
        color: #06a7ff;
    }
</style>