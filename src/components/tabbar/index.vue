<template>
    <view v-if="showTabBar" class="custom-tabbar">
        <view class="tabbar-item" v-for="(item, index) in tabList" :key="index" @click="switchTab(index)">
            <!-- 图标容器 -->
            <view class="icon-container">
                <!-- 图标 -->
                <image class="tab-icon" :src="selectedIndex === index ? item.selectedIconPath : item.iconPath" />
                <!-- 徽标 -->
                <view v-if="item.badge > 0" class="badge">
                    <text class="badge-text">{{ item.badge > 99 ? '99+' : item.badge }}</text>
                </view>
                <!-- 红点 -->
                <view v-if="item.badge === -1" class="dot"></view>
            </view>

            <!-- 文字 -->
            <text class="tab-text" :class="{ 'active': selectedIndex === index }">
                {{ item.text }}
            </text>
        </view>
    </view>
</template>

<script setup>
import { computed } from 'vue'
import useTabbarStore from '@/store/modules/tabbar'
import { storeToRefs } from 'pinia'

const tabbarStore = useTabbarStore()
const { tabList, selectedIndex, showTabBar } = storeToRefs(tabbarStore)

const switchTab = (index) => {
    tabbarStore.switchTab(index)
}
</script>

<style scoped>
.custom-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-top: 1px solid #f5f5f5;
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.icon-container {
    position: relative;
    width: 50rpx;
    height: 50rpx;
    margin-bottom: 8rpx;
}

.tab-icon {
    width: 100%;
    height: 100%;
}

.tab-text {
    font-size: 22rpx;
    color: #999;
    transition: color 0.3s;
}

.tab-text.active {
    color: #007aff;
    font-weight: 500;
}

.badge {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    min-width: 32rpx;
    height: 32rpx;
    background: #ff3b30;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
}

.badge-text {
    color: white;
    font-size: 20rpx;
    line-height: 1;
}

.dot {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 16rpx;
    height: 16rpx;
    background: #ff3b30;
    border-radius: 50%;
}
</style>