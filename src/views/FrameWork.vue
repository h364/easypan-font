<template>
    <div class="framework">
        <div class="header">
            <div class="logo">
                <span class="iconfont icon-pan"></span>
                <div class="name">Easy云盘</div>
            </div>
            <div class="right-panel">
                <el-popover :width="800" trigger="click" v-model:visible="showUploader" :offset="20" transition="none"
                    :hide-after="0" :popper-style="{padding: '0px'}">
                    <template #reference>
                        <span class="iconfont icon-transfer" style="cursor: pointer;"></span>
                    </template>
                    <template #default>
                        <Uploader ref="uploaderRef" @uploadCallBack="uploadCallBack"></Uploader>
                    </template>
                </el-popover>

                <el-dropdown>
                    <div class="user-info">
                        <div class="avatar">
                            <Avatar :userId="userInfo.userId" :avatar="userInfo.avatar" :timestamp="timestamp"
                                :width="40"></Avatar>
                        </div>
                        <div class="nick-name">{{userInfo.nickname}}</div>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="modifyAvatar">修改头像</el-dropdown-item>
                            <el-dropdown-item @click="modifyPassword">修改密码</el-dropdown-item>
                            <el-dropdown-item @click="logout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>

        <div class="body">
            <div class="left-sider">
                <div class="menu-list">
                    <template v-for="item in menus">
                        <div @click="jump(item)" v-if="item.allShow || (!item.allShow && userInfo.admin)"
                            :class="['menu-item', item.menuCode == currentMenu.menuCode ? 'active' : '']">
                            <div :class="['iconfont', 'icon-' + item.icon]"></div>
                            <div class="text">
                                {{ item.name }}
                            </div>
                        </div>
                    </template>
                </div>
                <div class="menu-sub-list">
                    <div v-for="sub in currentMenu.children" @click="jump(sub)"
                        :class="['menu-item-sub', currentPath == sub.path ? 'active' : '']">
                        <span :class="['iconfont', 'icon-' + sub.icon]" v-if="sub.icon"></span>
                        <span class="text">{{ sub.name }}</span>
                    </div>
                    <div class="tips" v-if="currentMenu && currentMenu.tips">
                        {{ currentMenu.tips }}
                    </div>
                    <div class="space-info">
                        <div>空间使用</div>
                        <div class="percent">
                            <el-progress :percentage="Math.floor((useSpaceInfo.useSpace/useSpaceInfo.totalSpace)*100)"
                                color="#409eff"></el-progress>
                        </div>
                        <div class="space-use">
                            <div class="use">
                                {{ proxy.Utils.sizeToStr(useSpaceInfo.useSpace) }} /
                                {{ proxy.Utils.sizeToStr(useSpaceInfo.totalSpace) }}
                            </div>
                            <div class="iconfont icon-refresh" @click="getUseSpace"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="body-content">
                <router-view v-slot="{ Component }">
                    <component ref="routerViewRef" :is="Component" @addFile="addFile" @reload="reload"></component>
                </router-view>
            </div>
        </div>
        <!-- 更新头像dialog -->
        <UpdateAvatar :userInfo="userInfo" ref="avatarDialogRef"></UpdateAvatar>
        <!-- 更新密码dialog -->
        <UpdatePassword ref="updatePwdRef"></UpdatePassword>
    </div>
</template>

<script setup>
    import { ref, getCurrentInstance, watch, nextTick, onBeforeMount } from "vue"
    import { useRouter, useRoute } from "vue-router";

    import UpdateAvatar from '@/components/UpdateAvatar.vue'
    import UpdatePassword from '@/components/UpdatePassword.vue'
    import Uploader from '@/views/main/Uploader.vue'

    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const userInfo = ref(proxy.VueCookies.get("userInfo"))
    const currentMenu = ref({})
    const currentPath = ref()
    const avatarDialog = ref(false)
    const avatarDialogRef = ref()
    const updatePwdRef = ref()
    const timestamp = ref(0)
    const showUploader = ref(false)
    const uploaderRef = ref()
    const routerViewRef = ref()
    const useSpaceInfo = ref({ useSpace: 0, totalSpace: 5 * 1024 * 1024 })

    const menus = [
        {
            icon: "cloude",
            name: "首页",
            menuCode: "main",
            path: "/main/all",
            allShow: true,
            children: [
                {
                    icon: "all",
                    name: "全部",
                    category: "all",
                    path: "/main/all",
                },
                {
                    icon: "video",
                    name: "视频",
                    category: "video",
                    path: "/main/video",
                },
                {
                    icon: "music",
                    name: "音频",
                    category: "music",
                    path: "/main/music",
                },
                {
                    icon: "image",
                    name: "图片",
                    category: "image",
                    path: "/main/image",
                },
                {
                    icon: "doc",
                    name: "文档",
                    category: "doc",
                    path: "/main/doc",
                },
                {
                    icon: "more",
                    name: "其他",
                    category: "others",
                    path: "/main/others",
                },
            ],
        },
        {
            path: "/myshare",
            icon: "share",
            name: "分享",
            menuCode: "share",
            allShow: true,
            children: [
                {
                    name: "分享记录",
                    path: "/myshare",
                },
            ],
        },
        {
            path: "/recycle",
            icon: "del",
            name: "回收站",
            menuCode: "recycle",
            tips: "回收站为你保存10天内删除的文件",
            allShow: true,
            children: [
                {
                    name: "删除的文件",
                    path: "/recycle",
                },
            ],
        },
        {
            path: "/settings/fileList",
            icon: "settings",
            name: "设置",
            menuCode: "settings",
            allShow: false,
            children: [
                {
                    name: "用户文件",
                    path: "/settings/fileList",
                },
                {
                    name: "用户管理",
                    path: "/settings/userList",
                },
                {
                    path: "/settings/sysSetting",
                    name: "系统设置",
                },
            ],
        },
    ];

    onBeforeMount(() => {
        getUseSpace()
    })

    const jump = (data) => {
        if (!data.path || data.menuCode == currentMenu.value.menuCode) {
            return;
        }
        router.push(data.path);
    }

    const addFile = (data) => {
        const { file, filePid } = data
        showUploader.value = true
        uploaderRef.value.addFile(file, filePid)
    }

    const setMenu = (menuCode, path) => {
        const menu = menus.find((item) => {
            return item.menuCode === menuCode;
        });
        currentMenu.value = menu;
        currentPath.value = path;
    }

    const modifyAvatar = () => {
        avatarDialogRef.value.showDialog()
    }

    const modifyPassword = () => {
        updatePwdRef.value.showDialog()
    }

    const logout = () => {
        proxy.Confirm(`你确定要删除退出吗`, async () => {
            let result = await proxy.Request({
                url: "/userInfo/logout"
            })
            if (!result) {
                return
            }
            proxy.VueCookies.remove("userInfo")
            router.push("/login")
        })
    }

    const uploadCallBack = () => {
        nextTick(() => {
            routerViewRef.value.reload()
            getUseSpace()
        })
    }

    const getUseSpace = async () => {
        let url = "file/getUseSpace"
        let result = await proxy.Request({
            url: url,
            showLoading: false
        })   
        if(!result) {
            return
        }
        useSpaceInfo.value = result.data
    }

    const reload = () => {
        getUseSpace()
    }

    watch(
        () => route,
        (newVal, oldVal) => {
            if (newVal.meta.menuCode) {
                setMenu(newVal.meta.menuCode, newVal.path);
            }
        },
        { immediate: true, deep: true }
    )

</script>

<style scoped>
    .framework {
        height: 100vh;
    }

    .header {
        display: flex;
        height: 56px;
        padding: 0 24px;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
    }

    .logo {
        display: flex;
        align-items: center;
    }

    .icon-pan {
        font-size: 40px;
        color: #1296db;
    }

    .logo .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 25px;
        color: #05a1f5;
    }

    .right-panel {
        display: flex;
        align-items: center;
    }

    .user-info {
        margin-right: 10px;
        display: flex;
        align-items: center;
        cursor: pointer;
        outline: none !important;
    }

    .avatar {
        margin: 0px 5px 0px 15px;
    }

    .nick-name {
        color: #05a1f5;
    }

    .body {
        display: flex;
    }

    .left-sider {
        display: flex;
        border-right: 1px solid #f1f2f4;
    }

    .menu-list {
        height: calc(100vh - 56px);
        width: 80px;
        box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
        border-right: 1px solid #f1f2f4;
    }

    .menu-list .active .iconfon {
        color: #06a7ff;
    }

    .menu-list .active .text {
        color: #06a7ff;
    }

    .menu-item {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        padding: 20px 0px;
        cursor: pointer;
    }

    .menu-item:hover {
        background: #f3f3f3;
    }

    .menu-item .iconfont {
        font-weight: normal;
        font-size: 28px;
    }

    .menu-sub-list {
        width: 200px;
        padding: 20px 10px 0px;
    }

    .menu-sub-list .active {
        background: #eef9fe;
    }

    .menu-sub-list .active .iconfont {
        color: #05a1f5;
    }

    .menu-sub-list .active .text {
        color: #05a1f5;
    }

    .menu-item-sub {
        text-align: center;
        line-height: 40px;
        border-radius: 5px;
        cursor: pointer;
    }

    .menu-item-sub:hover {
        background: #f3f3f3;
    }

    .menu-item-sub .iconfont {
        font-size: 14px;
        margin-right: 20px;
    }

    .menu-item-sub .text {
        font-size: 13px;
    }

    .space-info {
        position: absolute;
        bottom: 10px;
        width: 200px;
        padding: 0px 5px;
    }

    .percent {
        padding-right: 10px;
    }

    .space-use {
        margin-top: 5px;
        color: #7e7e7e;
        display: flex;
        justify-content: space-around;
    }

    .use {
        flex: 1;
    }

    .space-use .iconfont {
        cursor: pointer;
        margin-right: 20px;
        color: #05a1f5;
    }

    .body-content {
        padding-left: 20px;
        flex: 1;
    }
</style>