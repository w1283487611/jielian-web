<template>
  <view class="login">
    <view class="login-form">
      <text class="title">{{ title }}</text>

      <view class="form-item">
        <view class="input-wrapper">
          <!-- UniApp 中可以使用 uni-icons 图标组件 -->
          <uni-icons v-if="useUniIcons" type="contact" size="20" color="#999" class="input-icon" />
          <image v-else src="/static/icons/user.png" class="input-icon" mode="aspectFit" />
          <input v-model="loginForm.username" type="text" placeholder="账号" class="login-input"
            placeholder-class="placeholder-style" />
        </view>
      </view>

      <view class="form-item">
        <view class="input-wrapper">
          <uni-icons v-if="useUniIcons" type="locked" size="20" color="#999" class="input-icon" />
          <image v-else src="/static/icons/password.png" class="input-icon" mode="aspectFit" />
          <input v-model="loginForm.password" type="password" placeholder="密码" class="login-input"
            placeholder-class="placeholder-style" @confirm="handleLogin" />
        </view>
      </view>



      <view class="form-item" v-if="captchaEnabled">
        <view class="input-wrapper">
          <uni-icons v-if="useUniIcons" type="image" size="20" color="#999" class="input-icon" />
          <image v-else src="/static/icons/validCode.png" class="input-icon" mode="aspectFit" />
          <input v-model="loginForm.code" type="text" placeholder="验证码" class="login-input code-input"
            placeholder-class="placeholder-style" @confirm="handleLogin" />
        </view>
        <view class="login-code">
          <image :src="codeUrl" @tap="getCode" class="login-code-img" mode="aspectFit" />
        </view>
      </view>

      <label class="checkbox-wrapper">
        <checkbox :checked="loginForm.rememberMe" @click="loginForm.rememberMe = !loginForm.rememberMe"
          style="transform: scale(0.8);" />
        <text class="checkbox-label">记住密码</text>
      </label>

      <view class="form-item submit-wrapper">
        <button :loading="loading" :disabled="loading" class="login-btn" @tap="handleLogin">
          <text v-if="!loading">登 录</text>
          <text v-else>登 录 中...</text>
        </button>

        <br>
        <navigator url="/pages/index/index" open-type="navigate" class="link-type">
          主页
        </navigator>

        <view class="register-link" v-if="register">
          <navigator url="/pages/register/register" open-type="navigate" class="link-type">
            立即注册
          </navigator>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="login-footer">
      <text>{{ footerContent }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user';
import defaultSettings from '@/settings';

import {
  COACH, STUDENT, SYS_ROLE_KEYS, SYS_ROLES,
  getRoleName,
  SELECT_ROLE_PATH, STUDENT_HOME_PATH, COACH_HOME_PATH,
  LOGIN_PATH,
} from "@/utils/constants";

const footerContent = defaultSettings.footerContent;
const userStore = useUserStore()
// 登录跳转
const redirect = ref(undefined)

const title = ref("系统登录");
const captchaEnabled = ref(false);
const register = ref(false);

  // footerContent: {
  //   type: String,
  //   default: 'Copyright © 2023'
  // },


// 响应式数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
  code: "",
  uuid: ""
});

const loading = ref(false);
const codeUrl = ref('');
const useUniIcons = ref(true); // 是否使用 uni-icons 组件

// 方法
/**
 * 登录
 */
const handleLogin = async () => {
  if (loading.value) return

  // 表单验证
  if (!loginForm.username.trim()) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none'
    })
    return
  }

  if (!loginForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  if (captchaEnabled.value && !loginForm.code.trim()) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }

  try {
    // 这里调用登录接口
    // const result = await loginApi(loginForm)
    loading.value = true
    uni.showLoading({
      title: '加载中'
    })
    // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
    // if (loginForm.value.rememberMe) {
    //   Cookies.set("username", loginForm.value.username, { expires: 30 })
    //   Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
    //   Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
    // } else {
    //   // 否则移除
    //   Cookies.remove("username")
    //   Cookies.remove("password")
    //   Cookies.remove("rememberMe")
    // }

    // UniApi存储密码
    if (loginForm.rememberMe) {
      const loginInfo = {
        ...loginForm,
        password: encrypt(loginForm.password),
        expires: 30
      }
      uni.setStorageSync("rememberedLoginInfo", loginInfo);
    } else {
      // 否则移除
      uni.removeStorageSync("rememberedLoginInfo");
    }

    // 调用action的登录方法
    userStore.login(loginForm).then(() => {
      // 登录成功
      loading.value = false;
      uni.hideLoading();
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
      // 获取登录成功的用户信息
      useUserStore().getInfo()
        .then(() => {
        })
        .catch((err) => {
        useUserStore()
          .logOut()
          .then(() => {
            uni.showToast({
              title: err || "未登录",
              icon: "none",
            });
            return;
          });
      });
    // 跳转页面
    if (redirect.value === undefined) {
      // uni.reLaunch({
      //   url: '/pages/index/index'
      // })
      // uni.redirectTo({
      uni.reLaunch({
        url: SELECT_ROLE_PATH
      });
    } else {
      console.log("登录成功，跳转页面：",)
      // 防止登录页跳转登录页
      if (redirect.value === LOGIN_PATH) {
        // uni.redirectTo({
        uni.reLaunch({
          url: SELECT_ROLE_PATH
        });
      } else {
        uni.redirectTo({
          url: redirect.value
        });
      }


    }

  }).catch ((res) => {
    console.error("登录失败", res)
    loading.value = false
    uni.hideLoading()
    // 重新获取验证码
    if (captchaEnabled.value) {
      getCode()
    }
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    });
  })

} catch (error) {
  console.error('登录失败:', error)
  uni.showToast({
    title: error.message || '登录失败',
    icon: 'none'
  })
} finally {
  loading.value = false
  uni.hideLoading()
}
}

const getCode = () => {
  // 获取验证码逻辑
  uni.showLoading({
    title: '加载中'
  })

  // 模拟获取验证码
  setTimeout(() => {
    codeUrl.value = 'https://example.com/captcha.jpg?' + Date.now()
    uni.hideLoading()
  }, 500)
}

const getLoginInfo = () => {
  // 从本地存储读取记住的密码
  const savedLoginInfo = uni.getStorageSync('rememberedLoginInfo');
  // console.log(savedLoginInfo)
  if (savedLoginInfo) {
    loginForm.username = loginForm.username === undefined ? loginForm.username : savedLoginInfo.username
    loginForm.password = loginForm.password === undefined ? loginForm.password : decrypt(savedLoginInfo.password)
    loginForm.rememberMe = loginForm.rememberMe === undefined ? loginForm.rememberMe : Boolean(savedLoginInfo.rememberMe)
  }
}

// 生命周期
onLoad((options) => {
  // console.log("options: ")
  // console.log(options)
  // 重置跳转参数
  redirect.value = undefined;
  // 有路由跳转参数
  if (options.redirect != undefined) {
    redirect.value = options.redirect;
  }

  if (captchaEnabled.value) getCode();
  getLoginInfo();
})

</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.title {
  display: block;
  text-align: center;
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2rpx solid #dcdfe6;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 4rpx rgba(64, 158, 255, 0.1);
}

.input-icon {
  margin-right: 16rpx;
  width: 40rpx;
  height: 40rpx;
}

.login-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 48rpx;
  line-height: 48rpx;
}

.code-input {
  width: 70%;
}

.placeholder-style {
  color: #999;
  font-size: 28rpx;
}

.login-code {
  position: absolute;
  right: 0;
  top: 0;
  height: 88rpx;
  display: flex;
  align-items: center;
}

.login-code-img {
  height: 88rpx;
  width: 200rpx;
  border-radius: 8rpx;
  cursor: pointer;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
  font-size: 28rpx;
  color: #606266;
}

.checkbox-label {
  margin-left: 10rpx;
}

.submit-wrapper {
  position: relative;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #409eff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
  transition: all 0.3s;
}

.login-btn:active {
  background: #3a8ee6;
  transform: scale(0.98);
}

.login-btn[disabled] {
  background: #a0cfff;
  opacity: 0.6;
}

.register-link {
  position: absolute;
  right: 0;
  bottom: -50rpx;
}

.link-type {
  color: #409eff;
  font-size: 28rpx;
  text-decoration: none;
}

.login-footer {
  margin-top: 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* PC端样式 - 通过媒体查询覆盖 */
@media (min-width: 768px) {
  .form-item {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  .input-wrapper {
    flex: 1;
    margin-right: 10px;
  }

  /* PC端特有的调整 */
  .login-form {
    max-width: 400px;
    padding: 40px;
  }

  .title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .login-input {
    font-size: 14px;
    height: 40px;
    line-height: 40px;
  }

  .placeholder-style {
    color: #999;
    font-size: 22px;
  }

  .checkbox-label {
    margin-left: 10px;
    font-size: 22px;
  }


  .login-btn {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
  }
}

/* 移动端和PC端的通用样式 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2rpx solid #dcdfe6;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  transition: all 0.3s;
}

/* PC端重置单位 */
@media (min-width: 768px) {
  .input-wrapper {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px 12px;
  }

  /* 重置所有rpx单位为px单位 */
  .login-form {
    padding: 40px !important;
  }

  .title {
    font-size: 24px !important;
    margin-bottom: 30px !important;
  }
}
</style>