<template>
    <div class="update-avatar">
        <el-dialog title="修改头像" v-model="dialogFormVisible" width="500px">
            <el-form>
                <el-form-item label="昵称" label-width="80px">{{userInfo.nickname}}</el-form-item>
                <el-form-item label="头像" label-width="80px">
                    <AvatarUpload :userId="userInfo.userId" ref="avatarUpload"></AvatarUpload>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelUpload">取 消</el-button>
                <el-button type="primary" @click="submitUpload">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref } from "vue"

    import AvatarUpload from '@/components/AvatarUpload.vue'

    const props = defineProps({
        userInfo: {
            type: Object,
            default: null
        }
    })

    const avatarUpload = ref()
    const dialogFormVisible = ref(false)

    const showDialog = () => {
        dialogFormVisible.value = !dialogFormVisible.value
    }

    const submitUpload = () => {
        avatarUpload.value.submitAvatar()
    }

    const cancelUpload = () => {
        dialogFormVisible.value = false
    }

    defineExpose({
        showDialog
    })
</script>

<style scoped>
    .dialog-footer {
        display: flex;
        justify-content: space-around;
    }
</style>