<template>
    <view>
        <view class="content">
            教练主页
            <br>
            <navigator url="/pages/login/login" open-type="navigate" class="link-type">
                登录页
            </navigator>
            <br>
            <navigator url="/pages/coach/test/test" open-type="navigate" class="link-type">
                教练页
            </navigator>
            <button @click="getUserInfo">getUserInfo</button>
            <button @click="getTabbar(3)">教练</button>
            <button @click="getTabbar(4)">学员</button>
            <image class="logo" src="/static/logo.png"></image>

        </view>

        <!-- 自定义 TabBar -->
        <tabbar />
    </view>


</template>

<script setup>
import { login, logout, getInfo } from "@/api/login";
import Tabbar from "@/components/tabbar/index.vue";
import useTabbarStore from '@/store/modules/tabbar';

const tabbarStore = useTabbarStore();

// 获取用户信息测试
const getTabbar = (roleId) => {
    tabbarStore.switchRole(roleId);
}


// 获取用户信息测试
const getUserInfo = () => {
    getInfo()
        .then((res) => {
            console.log(res)
        })

}

</script>

<style>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
}

.text-area {
    display: flex;
    justify-content: center;
}

.title {
    font-size: 36rpx;
    color: #8f8f94;
}
</style>