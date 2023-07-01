<template>
    <div class="update-password">
        <el-dialog title="修改密码" v-model="dialogFormVisible" width="500px">
            <el-form :model="pwdData" ref="pwdDataRef" :rules="rules">
                <el-form-item label="新密码" prop="password" label-width="80px">
                    <el-input size="large" type="password" v-model="pwdData.password" placeholder="请输入密码">
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword" label-width="80px">
                    <el-input size="large" type="password" v-model="pwdData.confirmPassword" placeholder="请再次输入密码">
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelUpdate">取 消</el-button>
                <el-button type="primary" @click="submitUpdate">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, getCurrentInstance } from "vue"

    const { proxy } = getCurrentInstance()

    const pwdData = ref({})
    const pwdDataRef = ref()
    const dialogFormVisible = ref(false)

    const checkPassword = (rule, value, callback) => {
        if (value != pwdData.value.password) {
            callback(new Error(rule.message))
        } else {
            callback()
        }
    }

    const showDialog = () => {
        dialogFormVisible.value = !dialogFormVisible.value
    }

    const submitUpdate = () => {
        pwdDataRef.value.validate(async (validate) => {
            if (validate) {
                let result = await proxy.Request({
                    url: "/userInfo/updatePassword",
                    params: {
                        password: pwdData.value.password
                    },
                    errorCallback: () => {
                        proxy.Message.error("修改密码失败")
                    }
                })
            }
            if (!result) {
                proxy.Message.error("修改密码失败")
                return
            }
            proxy.Message.success("修改密码成功")
        })
    }

    const cancelUpdate = () => {
        dialogFormVisible.value = false
    }

    const rules = {
        password: [{ required: true, message: "请输入密码" }, { validator: proxy.Verify.password, message: "密码由八-十六位组成,至少包含数字大写和小写字母" }],
        confirmPassword: [{ required: true, message: "请再次输入密码" }, { validator: checkPassword, message: "请两次密码不一致" }],
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