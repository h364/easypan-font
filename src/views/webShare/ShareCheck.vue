<template>
  <div class="share">
    <div class="body-content">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <span class="name">Easy云盘</span>
      </div>
      <div class="code-panel">
        <div class="file-info">
          <div class="avatar">
            <Avatar :userId="shareInfo.userId" :avatar="shareInfo.avatar" :width="50"></Avatar>
          </div>
          <div class="share-info">
            <div class="user-info">
              <span class="nick-name">{{ shareInfo.nickName }} </span>
              <span class="share-time">分享于 {{ shareInfo.shareTime }}</span>
            </div>
            <div class="file-name">分享文件：{{ shareInfo.fileName }}</div>
          </div>
        </div>
        <div class="code-body">
          <div class="tips">请输入提取码：</div>
          <div class="input-area">
            <el-form :model="formData" :rules="rules" ref="formDataRef" :maxLength="5" @submit.prevent>
              <!--input输入-->
              <el-form-item prop="code">
                <el-input class="input" v-model="formData.code" @keyup.enter="checkShare"></el-input>
                <el-button type="primary" @click="checkShare">提取文件</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, getCurrentInstance, nextTick, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  const { proxy } = getCurrentInstance();
  const router = useRouter();
  const route = useRoute();

  const api = {
    getShareInfo: "/showShare/getShareInfo",
    checkShareCode: "/showShare/checkShareCode",
  };

  const shareId = route.params.shareId;
  const shareInfo = ref({});
  const getShareInfo = async () => {
    let result = await proxy.Request({
      url: api.getShareInfo,
      params: {
        shareId,
      },
    });
    if (!result) {
      return;
    }
    shareInfo.value = result.data;
  };
  getShareInfo();

  const formData = ref({});
  const formDataRef = ref();
  const rules = {
    code: [
      { required: true, message: "请输入提取码" },
      { min: 5, message: "提取码为5位" },
      { max: 5, message: "提取码为5位" },
    ],
  };

  const checkShare = async () => {
    formDataRef.value.validate(async (valid) => {
      if (!valid) {
        return;
      }
      let result = await proxy.Request({
        url: api.checkShareCode,
        params: {
          shareId: shareId,
          code: formData.value.code,
        },
      });
      if (!result) {
        return;
      }
      router.push(`/share/${shareId}`);
    });
  };
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

  .share {
    height: calc(100vh);
    background: url("../../assets/share_bg.png");
    background-repeat: repeat-x;
    background-position: 0 bottom;
    background-color: #eef2f6;
    display: flex;
    justify-content: center;
  }

  .body-content {
    margin-top: calc(100vh / 5);
    width: 500px;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-pan {
    font-size: 60px;
    color: #409eff;
  }

  .name {
    font-weight: bold;
    margin-left: 5px;
    font-size: 25px;
    color: #409eff;
  }


  .code-panel {
    margin-top: 20px;
    background: #fff;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 0 7px 1px #5757574f;
  }

  .file-info {
    padding: 10px 20px;
    background: #409eff;
    color: #fff;
    display: flex;
    align-items: center;
  }

  .avatar {
    margin-right: 5px;
  }


  .user-info {
    display: flex;
    align-items: center;
  }

  .nick-name {
    font-size: 15px;
  }

  .share-time {
    margin-left: 20px;
    font-size: 12px;
  }


  .file-name {
    margin-top: 10px;
    font-size: 12px;
  }

  .code-body {
    padding: 30px 20px 60px 20px;
  }

  .tips {
    font-weight: bold;
  }

  .input-area {
    margin-top: 10px;
  }

  .input {
    flex: 1;
    margin-right: 10px;
  }
</style>