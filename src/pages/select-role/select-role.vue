<template>
    <view>
        <view class="content">
            <view class="h1">请选择角色：</view>

            <view v-for="role in SYS_ROLES" :key="role.id" class="sel-btn">
                <button @click="setRole(role.roleKey)">我是{{ role.roleName }}</button>
            </view>
        </view>
        <!-- 自定义 TabBar -->
        <tabbar />
    </view>
</template>

<script setup lang="js">
import Tabbar from "@/components/tabbar/index.vue";
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onReady, onLaunch } from '@dcloudio/uni-app';
import { changeUserRole, } from "@/api/system/user";

import useUserStore from "@/store/modules/user";
import useTabbarStore from "@/store/modules/tabbar";

import {
  COACH, STUDENT, SYS_ROLE_KEYS, SYS_ROLES,
  getRoleName, getRole
} from "@/utils/constants";

const userStore = useUserStore();
const tabbarStore = useTabbarStore();

const setRole = (role) => {
    if (!SYS_ROLE_KEYS.includes(role)) return;
    
    userStore.setRole(role);
    tabbarStore.setRole(role);

    const roleInfo = getRole(role);
    changeUserRole(userStore.id, roleInfo.id);
    // const roleName = getRoleName(role);
    uni.showToast({title:`切换${roleInfo.roleName}成功，正在为您跳转~`});

    uni.reLaunch({
        url: roleInfo.path
    });
}

onLaunch(() => {

});

onShow(() => {
    // #ifdef MP-WEIXIN
    wx.hideHomeButton()
    // #endif
});
</script>

<style scoped>
.content {}

.h1 {
    font-size: large;
}
</style>