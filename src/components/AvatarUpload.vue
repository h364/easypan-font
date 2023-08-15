<template>
  <div class="avatarUpdate">
    <el-upload class="avatar-uploader" :show-file-list="false" :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload" :auto-upload="false" ref="uploadAvatarRef" :multiple="false"
      :http-request="uploadImage">
      <img :src="imagUrl" class="avatar">
    </el-upload>
  </div>

</template>

<script setup>
  import { ref, getCurrentInstance } from "vue"

  const { proxy } = getCurrentInstance();

  const uploadAvatarRef = ref()

  const props = defineProps({
    userId: {
      type: String,
      default: ''
    }
  })

  const imagUrl = ref(proxy.globalInfo.avatarUrl + props.userId)
  const localFile = ref(null);

  const uploadImage = async (file) => {
    file = file.file;
    let img = new FileReader();
    img.readAsDataURL(file);
    img.onload = ({ target }) => {
      localFile.value = target.result;
    }
    upload(file)
  }

  const handleAvatarSuccess = (res, file) => {
    imagUrl.value = URL.createObjectURL(file.raw)
  }

  const beforeAvatarUpload = (file) => {
    const isJPG = file.type === 'image/jpeg'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
      proxy.Message.error('上传头像图片只能是 JPG 格式!')
    }
    if (!isLt2M) {
      proxy.Message.error('上传头像图片大小不能超过 2MB!')
    }
    return isJPG && isLt2M
  }

  const submitAvatar = () => {
    uploadAvatarRef.value.submit()
  }

  const upload = async (file) => {
    if (!(file instanceof File)) {
      return
    }
    let result = await proxy.Request({
      url: "/userInfo/updateUserAvatar",
      params: {
        avatar: file
      },
      errorCallback: () => {
        proxy.Message.error('修改头像失败!')
      }
    })
    if(!result) {
      proxy.Message.error('修改头像失败!')
      return
    }
    proxy.Message.success('成功修改头像!')
  }

  defineExpose({
    submitAvatar
  })
  
</script>

<style scoped>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>