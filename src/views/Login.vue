<template>
    <div id='login'>
        <div class="login-img"></div>
        <div class="login-panel">
            <el-form class="login-register" :model="formdata" :rules="rules" ref="formdataRef">
                <div class="login-title">Easy云盘</div>
                <!-- 邮箱输入 -->
                <el-form-item prop="email">
                    <el-input size="large" placeholder="请输入邮箱" v-model="formdata.email">
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                    <!-- 忘记密码或注册输入邮箱验证码 -->
                </el-form-item>
                <div v-if="opType == 1 || opType == 2">
                    <el-form-item prop="emailCode">
                        <div class="send-email-panel">
                            <el-input size="large" placeholder="请输入邮箱验证码" v-model="formdata.emailCode">
                                <template #prefix>
                                    <span class="iconfont icon-checkcode"></span>
                                </template>
                            </el-input>
                            <el-button class="send-email-btn" size="large" type="primary"
                                @click="getEmailCode">获取验证码</el-button>
                        </div>
                    </el-form-item>
                </div>
                <!-- 注册时输入昵称 -->
                <div v-if="opType == 2">
                    <el-form-item prop="nickname">
                        <el-input size="large" placeholder="请输入昵称" v-model="formdata.nickname">
                            <template #prefix>
                                <span class="iconfont icon-account"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                </div>
                <!-- 密码输入 -->
                <div v-if="opType == 0">
                    <el-form-item prop="password">
                        <el-input size="large" placeholder="请输入密码" v-model="formdata.password" type="password"
                            show-password>
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                </div>
                <!-- 忘记密码或注册输入确认密码 -->
                <div v-if="opType == 1 || opType == 2">
                    <el-form-item prop="registPassword">
                        <el-input size="large" placeholder="密码由八-十六位组成,至少包含数字大写和小写字母" v-model="formdata.registPassword"
                            type="password" show-password>
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                        <el-input size="large" placeholder="请再次输入密码" v-model="formdata.confirmPassword" type="password"
                            show-password>
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                </div>
                <!-- 验证码输入 -->
                <el-form-item prop="checkCode">
                    <div class="checkcode-panel">
                        <el-input size="large" placeholder="请输入验证码" v-model="formdata.checkCode" style="width: 230px;">
                            <template #prefix>
                                <span class="iconfont icon-checkcode"></span>
                            </template>
                        </el-input>
                    </div>
                    <img :src="checkCodeUrl" alt="" @click="changeCheckCode(0)" class="checkCode">
                </el-form-item>
                <!-- 选项框 -->
                <el-form-item>
                    <div class="rememberme-panel" v-if="opType == 0">
                        <el-checkbox v-model="formdata.rememberMe">记住我</el-checkbox>
                    </div>
                    <div class="no-account">
                        <a href="javascript:void(0)" style="color: #007fff;" @click="changeOpType(1)"
                            v-if="opType == 0">忘记密码?</a>
                        <a href="javascript:void(0)" style="color: #007fff;" @click="changeOpType(0)"
                            v-if="opType == 1">去登录?</a>
                        <a href="javascript:void(0)" style="color: #007fff;" @click="changeOpType(2)"
                            v-if="opType == 0">没有账号?</a>
                        <a href="javascript:void(0)" style="color: #007fff;" @click="changeOpType(0)"
                            v-if="opType == 2">已有账号?</a>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button type="primary" size="large" class="op-btn" @click="loginOrUpdateOrRegister">
                        <span v-if="opType == 0">登录</span>
                        <span v-if="opType == 1">重置密码</span>
                        <span v-if="opType == 2">注册</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 邮箱验证弹框 -->
        <el-dialog title="发送邮箱验证码" v-model="dialogFormVisible" width="500px">
            <el-form :model="formdata">
                <el-form-item label="邮箱" label-width="80px">
                    <el-input v-model="formdata.email" disabled="true" size="large" style="width: 300px;">
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="验证码" label-width="80px">
                    <el-input size="large" placeholder="请输入验证码" v-model="emailCodeData.checkCode" style="width: 150px;">
                        <template #prefix>
                            <span class="iconfont icon-checkcode"></span>
                        </template>
                    </el-input>
                    <img :src="checkCodeUrlEmail" alt="" @click="changeCheckCode(1)" class="checkCode"
                        style="margin-left: 20px;">
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelSendCode">取 消</el-button>
                <el-button type="primary" @click="sendEmailCode">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
    import { ref, reactive, getCurrentInstance, onMounted } from "vue"
    import { useRouter, useRoute } from 'vue-router'
    import md5 from 'js-md5'

    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const route = useRoute()
    /* 表单数据 */
    const formdata = ref({})
    const emailCodeData = ref({})
    /* 0:登录1:忘记密码2:注册 */
    const opType = ref(0)
    const checkCodeUrl = ref("/api/userInfo/checkCode")
    const checkCodeUrlEmail = ref("/api/userInfo/checkCode")

    /* 初始化 */
    onMounted(() => {
        const cookieLoginInfo = proxy.VueCookies.get("loginInfo")
        if (cookieLoginInfo != null) {
            formdata.value = cookieLoginInfo
        }
    })

    /* 表单校验规则 */
    const formdataRef = ref()
    const checkPassword = (rule, value, callback) => {
        if (value != formdata.value.registPassword) {
            callback(new Error(rule.message))
        } else {
            callback()
        }
    }
    const rules = {
        email: [{ required: true, message: "请输入邮箱" }, { validator: proxy.Verify.email, message: "请输入正确的邮箱" }],
        password: [{ required: true, message: "请输入密码" }],
        checkCode: [{ required: true, message: "请输入验证码" }],
        emailCode: [{ required: true, message: "请输入邮箱验证码" }],
        nickname: [{ required: true, message: "请输入昵称" }],
        registPassword: [{ required: true, message: "请输入密码" }, { validator: proxy.Verify.password, message: "密码由八-十六位组成,至少包含数字大写和小写字母" }],
        confirmPassword: [{ required: true, message: "请再次输入密码" }, { validator: checkPassword, message: "请两次密码不一致" }],
    }
    /* 邮箱验证弹框 */
    const dialogFormVisible = ref(false)
    const getEmailCode = () => {
        formdataRef.value.validateField("email", (validate) => {
            if (validate) {
                dialogFormVisible.value = true
                changeCheckCode(1)
            } else {
                return
            }
        })
    }
    /* 验证码改变 */
    const changeCheckCode = (type) => {
        if (type == 0) {
            checkCodeUrl.value = checkCodeUrl.value + "?type=" + type + "&time=" + new Date().getTime()
        } else {
            checkCodeUrlEmail.value = checkCodeUrlEmail.value + "?type=" + type + "&time=" + new Date().getTime()
        }

    }

    const changeOpType = (type) => {
        opType.value = type
        formdataRef.value.resetFields()
        changeCheckCode(0)
    }
    const loginOrUpdateOrRegister = () => {
        formdataRef.value.validate((validate) => {
            if (validate) {
                if (opType.value == 0) {
                    login()
                } else if (opType.value == 1) {
                    updatePassword()
                } else if (opType.value == 2) {
                    register()
                }
            }
        })
    }

    const login = async () => {
        console.log(formdata.value.rememberMe);
        let result = await proxy.Request({
            url: '/userInfo/login',
            params: {
                email: formdata.value.email,
                password: md5(formdata.value.password),
                checkCode: formdata.value.checkCode
            },
            errorCallback: () => {
                changeCheckCode(1)
            }
        })
        if (!result) {
            return
        }
        proxy.VueCookies.set("userInfo", result.data, 0)
        const loginInfo = {
            email: formdata.value.email,
            password: formdata.value.password,
            rememberMe: formdata.value.rememberMe
        }

        if (formdata.value.rememberMe) {
            proxy.VueCookies.set("loginInfo", loginInfo, "7d")
        }
        proxy.Message.success("登录成功")
        router.push("/")
        formdataRef.value.resetFields()
    }

    const register = async () => {
        let result = await proxy.Request({
            url: '/userInfo/register',
            params: {
                email: formdata.value.email,
                emailCode: formdata.value.emailCode,
                nickname: formdata.value.nickname,
                password: formdata.value.registPassword,
                checkCode: formdata.value.checkCode
            },
            errorCallback: () => {
                changeCheckCode(1)
            }
        })
        if (!result) {
            return
        }
        proxy.Message.success("注册成功")
        formdataRef.value.resetFields()
    }

    const updatePassword = async () => {
        let result = await proxy.Request({
            url: '/userInfo/resetPwd',
            params: {
                email: formdata.value.email,
                emailCode: formdata.value.emailCode,
                password: formdata.value.registPassword,
                checkCode: formdata.value.checkCode
            },
            errorCallback: () => {
                changeCheckCode(1)
            }
        })
        if (!result) {
            return
        }
        proxy.Message.success("密码修改成功")
    }

    const sendEmailCode = async () => {
        console.log();
        if (!!emailCodeData.value.checkCode) {
            let result = await proxy.Request({
                url: '/userInfo/sendEmailCode',
                params: {
                    email: formdata.value.email,
                    checkCode: emailCodeData.value.checkCode,
                    type: opType == 2 ? 2 : 1
                },
                errorCallback: () => {
                    changeCheckCode(1)
                }
            })
            if (!result) {
                return
            }
            proxy.Message.success("验证码发送成功，请登录邮箱查看")
            dialogFormVisible.value = false
            emailCodeData.value = {}
        } else {
            proxy.Message.error("验证码不能为空")
        }
    }

    const cancelSendCode = () => {
        dialogFormVisible.value = false
        emailCodeData.value = {}
    }


</script>

<style scoped>
    #login {
        display: flex;
        height: 100vh;
        background-size: cover;
        background: url("../assets/login_bg.png");
    }

    .login-img {
        flex: 1;
        margin: 40px 0 0 50px;
        background-repeat: no-repeat;
        background-size: 700px;
        background-image: url("../assets/login_img.png");
    }

    .login-panel {
        width: 430px;
        margin-right: 15%;
        margin-top: calc((100vh - 500px) / 2);
    }

    .login-register {
        background: #fff;
        padding: 25px;
        border-radius: 5px;
    }

    .login-title {
        text-align: center;
        font-size: 18px;
        margin-bottom: 20px;
    }

    .rememberme-panel {
        width: 100%;
    }

    .no-account {
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
    }

    .checkCode {
        margin-left: auto;
        cursor: pointer;
    }

    .op-btn {
        width: 100%;
    }

    .send-email-panel {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .send-email-btn {
        margin-left: 5px;
    }

    .dialog-footer {
        display: flex;
        justify-content: space-around;
    }
</style>