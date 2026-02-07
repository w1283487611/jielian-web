<template>
  <view class="container">
    <!-- 顶部 Tab -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 0 }" 
        @click="currentTab = 0"
      >我的教练</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 1 }" 
        @click="currentTab = 1"
      >推荐教练</view>
    </view>

    <!-- Tab 1: 我的教练 (主教练 + 关注) -->
    <view v-if="currentTab === 0" class="list-container">
      <view class="section-label">主教练</view>
      <view class="coach-card main-card">
        <image src="https://placehold.co/100" class="avatar"></image>
        <view class="info">
          <view class="row">
            <text class="name">张教练</text>
            <text class="tag main">主</text>
          </view>
          <text class="desc">今日可约 | 评分 4.9</text>
        </view>
        <button class="action-btn" @click="goBook(101)">预约</button>
      </view>

      <view class="section-label">关注的教练</view>
      <view class="coach-card" v-for="i in 3" :key="i">
        <image src="https://placehold.co/100" class="avatar"></image>
        <view class="info">
          <view class="row"><text class="name">王教练 {{i}}</text></view>
          <text class="desc">明日可约 | 评分 4.8</text>
        </view>
        <button class="action-btn outline" @click="goBook(100+i)">预约</button>
      </view>
    </view>

    <!-- Tab 2: 推荐列表 -->
    <view v-if="currentTab === 1" class="list-container">
      <view class="coach-card" v-for="i in 5" :key="i">
        <image src="https://placehold.co/100" class="avatar"></image>
        <view class="info">
          <view class="row"><text class="name">推荐教练 {{i}}</text></view>
          <text class="desc">科目二专家 | 累计带教 500+人</text>
        </view>
        <button class="action-btn follow" @click="follow(i)">关注</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const currentTab = ref(0);

const goBook = (id) => {
  uni.navigateTo({ url: `/pages/student/do-appoint/do-appoint?coachId=${id}` });
};

const follow = (id) => {
  uni.showToast({ title: '关注成功', icon: 'success' });
  // 这里应该调用API添加关注
};
</script>

<style scoped lang="scss">
.container { min-height: 100vh; background: #f5f7fa; }

.tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    color: #666;
    position: relative;
    padding-bottom: 20rpx;
    
    &.active {
      color: #2979ff;
      font-weight: bold;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #2979ff;
        border-radius: 4rpx;
      }
    }
  }
}

.list-container { padding: 30rpx; }

.section-label {
  font-size: 26rpx;
  color: #999;
  margin: 20rpx 0 10rpx;
}

.coach-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  &.main-card { border: 2rpx solid rgba(41, 121, 255, 0.3); background: #f0f7ff; }

  .avatar { width: 90rpx; height: 90rpx; border-radius: 50%; margin-right: 24rpx; }
  
  .info {
    flex: 1;
    .row { display: flex; align-items: center; margin-bottom: 8rpx; }
    .name { font-size: 32rpx; font-weight: 500; }
    .tag { font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; margin-left: 10rpx; }
    .tag.main { background: #2979ff; color: #fff; }
    .desc { font-size: 24rpx; color: #666; }
  }
  
  .action-btn {
    margin: 0;
    font-size: 26rpx;
    height: 60rpx;
    line-height: 60rpx;
    border-radius: 30rpx;
    background: #2979ff;
    color: #fff;
    padding: 0 32rpx;
    
    &.outline { background: #fff; border: 1px solid #2979ff; color: #2979ff; }
    &.follow { background: #e0e0e0; color: #333; }
  }
}
</style>