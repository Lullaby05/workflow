<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-content">
        <div class="header">
          <img
            src="https://business.api.xkrsecure.com/icon/logo-xkr.png"
            alt=""
          />
          <h1 class="login-title">安全智能预警平台工作流</h1>
        </div>
        <div class="form">
          <el-form
            label-position="right"
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                style="--el-input-height: 42px"
                clearable
                v-model="loginForm.username"
                placeholder="请输入手机号码/邮箱"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                style="--el-input-height: 42px"
                clearable
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <div>
              <el-button
                style="width: 100%"
                type="primary"
                @click="login"
                >登录</el-button
              >
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="enterpriseChooseVisible"
      title="选择进入身份"
    >
      <choose-enterprise
        :enterpriseList="enterpriseList"
        v-model:selectEnterprise="selectEnterprise"
        @cancel="cancelChooseEnterprise"
        @confirm="confirmChooseEnterprise"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { loginV2, getTokenByTenant, getUserInfo } from '@/api/login';
import store from '@/store';
import { useRouter } from 'vue-router';
import ChooseEnterprise from './components/chooseEnterprise.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const loginForm = ref({
  username: '',
  password: '',
});
const loginRules = {
  username: [
    {
      required: true,
      message: '请输入手机号码/邮箱',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
  ],
};
const loginFormRef = ref<any>(null);

const login = () => {
  loginFormRef.value!.validate(async (valid: boolean) => {
    if (valid) {
      const { username, password } = loginForm.value;
      const { data } = await loginV2({
        condition: username,
        password,
      });
      if (!data) {
        ElMessage.warning('账号或密码不正确');
        return;
      }
      if (data.length === 1) {
        const { data: token } = await getTokenByTenant(data[0]);
        handleLogin(token);
      } else {
        enterpriseList.value = data;
        enterpriseChooseVisible.value = true;
      }
    }
  });
};

const enterpriseList = ref([]);
const selectEnterprise = ref({});
const enterpriseChooseVisible = ref(false);
const cancelChooseEnterprise = () => {
  enterpriseChooseVisible.value = false;
  selectEnterprise.value = {};
};
const confirmChooseEnterprise = async () => {
  const { data: token } = await getTokenByTenant(selectEnterprise.value);
  handleLogin(token);
};

const handleLogin = async (token: any) => {
  localStorage.setItem('wflow-token', token.accessToken);
  localStorage.setItem('refreshToken', token.refreshToken);
  const { data: info } = await getUserInfo();
  const user = {
    id: info.employeeInfo.userId,
    name: info.userInfo.nickname,
    position: info.employeeInfo.jobName,
    companyName: info.employeeInfo.enterpriseName,
    tenantId: info.tenantId,
    type: 'user',
    avatar: info.userInfo.avatar || 'https://business.api.xkrsecure.com/icon/icon-default-avatar.png', 
  };
  store.state.loginUser = user;
  localStorage.setItem('loginUser', JSON.stringify(user));
  router.push('/workspace/forms');
};
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-background {
  background-image: url('@/assets/image/background.jpg');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-content {
  backdrop-filter: blur(10px);
  width: 400px;
  background-color: rgba(255, 255, 255, 1); /* 使用半透明的背景色 */
  border-radius: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  background-image: linear-gradient(to left, #428ffb 0%, #385de2 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  gap: 20px;
  img {
    width: 132px;
    height: 80px;
    margin: 0 auto;
  }
  .login-title {
    margin-top: 0px;
    text-align: center;
    font-size: 24px;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
}
.form {
  padding: 20px;
}
</style>
