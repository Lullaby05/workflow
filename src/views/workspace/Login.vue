<template>
  <div class="login-container">
    <div class="login-background">
      <h1 class="login-title">安全智能预警平台工作流</h1>
      <el-form
        label-position="right"
        label-width="90"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item
          prop="username"
          label="用户名"
        >
          <el-input
            clearable
            v-model="loginForm.username"
            placeholder="请输入手机号码/邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="password"
          label="密码"
        >
          <el-input
            clearable
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <div style="width: 100%; text-align: center">
          <el-button
            type="primary"
            @click="login"
            >登录</el-button
          >
        </div>
      </el-form>
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
    avatar: info.userInfo.avatar,
    position: info.employeeInfo.jobName,
    companyName: info.employeeInfo.enterpriseName,
    type: 'user',
  };
  store.state.loginUser = user;
  localStorage.setItem('loginUser', JSON.stringify(user));
  router.push('/workspace/forms');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-background {
  background-image: url('/path/to/background-image.jpg');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
