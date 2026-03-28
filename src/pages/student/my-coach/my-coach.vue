<template>
  <view class="my-coach-container">
    
    <view class="section" v-if="mainCoach">
      <view class="section-title">
        <text class="title">我的主教练</text>
      </view>
      
      <view class="coach-card main-card" @click="goToCoachDetail(mainCoach.id)">
        <image class="avatar" :src="handleAvatar(mainCoach.avatar)" mode="aspectFill"></image>
        <view class="info">
          <view class="name-row">
            <text class="name">{{ mainCoach.name }}</text>
            <text class="coach-tag primary">专属绑定</text>
          </view>
          <view class="stat-row">
            <text class="rating">⭐ {{ mainCoach.rating }}</text>
            <text class="exp">教龄 {{ mainCoach.teachingYears }} 年</text>
          </view>
          <view class="practice-count">
            累计带我练车：<text class="num">{{ mainCoach.practicedTimes }}</text> 次
          </view>
        </view>
        <view class="action">
          <button class="book-btn" @click.stop="quickBook(mainCoach.id)">去约车</button>
        </view>
      </view>
    </view>

    <view class="section" v-if="historyCoaches.length > 0">
      <view class="section-title">
        <text class="title">历史带教</text>
        <text class="sub-title">曾为您提供过教学服务的教练</text>
      </view>
      
      <view class="coach-list">
        <view class="coach-card history-card" 
              v-for="coach in historyCoaches" :key="coach.id"
              @click="goToCoachDetail(coach.id)">
          <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
          <view class="info">
            <view class="name-row">
              <text class="name">{{ coach.name }}</text>
              <text class="coach-tag default">历史教练</text>
            </view>
            <view class="stat-row">
              <text class="rating">⭐ {{ coach.rating }}</text>
              <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
            </view>
            <view class="practice-count">
              曾合作：<text class="num">{{ coach.practicedTimes }}</text> 次
            </view>
          </view>
          <view class="action">
            <button class="book-btn plain" @click.stop="quickBook(coach.id)">再约一次</button>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-if="!mainCoach && historyCoaches.length === 0">
      <image class="empty-img" src="/static/assets/images/empty-data.png" mode="aspectFit"></image>
      <text class="empty-text">您还未拥有教练记录，快去大厅看看吧</text>
      <button class="go-hall-btn" @click="goToHall">前往找教练</button>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';
import { getMyCoachList } from '@/api/student/coach';

const mainCoach = ref(null);
const historyCoaches = ref([]);

// 辅助方法：获取今天日期
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchData = async () => {
  try {
    const res = await getMyCoachList();
    if (res.code === 200 && res.data) {
      mainCoach.value = res.data.mainCoach || null;
      historyCoaches.value = res.data.historyCoaches || [];
    }
  } catch (error) {
    console.error('获取我的教练异常:', error);
  } finally {
    uni.stopPullDownRefresh();
  }
};

onShow(() => { fetchData(); });
onPullDownRefresh(() => { fetchData(); });

// 交互事件
const goToCoachDetail = (coachId) => {
  uni.navigateTo({ url: `/pages/student/coach-detail/coach-detail?id=${coachId}` });
};

// 核心复购按钮：直接穿透到今天日期的排班页
const quickBook = (coachId) => {
  uni.navigateTo({ 
    url: `/pages/student/appoint-detail/appoint-detail?coachId=${coachId}&date=${getTodayDateString()}` 
  });
};

const goToHall = () => {
  uni.switchTab({ url: '/pages/tabbar/student/appoint/appoint' });
};
</script>

<style lang="scss" scoped>
.my-coach-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

.section {
  margin-bottom: 40rpx;
  
  .section-title {
    margin-bottom: 24rpx;
    display: flex;
    align-items: baseline;
    .title { font-size: 34rpx; font-weight: bold; color: #333; margin-right: 16rpx; }
    .sub-title { font-size: 24rpx; color: #999; }
  }
}

/* 统一的教练卡片风格 */
.coach-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 24rpx;
  
  &.main-card {
    border-left: 8rpx solid #007aff; /* 主教练高亮蓝边 */
  }

  .avatar {
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    border: 2rpx solid #f0f0f0;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .name-row {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
      .name { font-size: 32rpx; font-weight: bold; color: #333; margin-right: 12rpx; }
      
      .coach-tag {
        font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 6rpx;
        &.primary { background-color: #eff6ff; color: #3b82f6; }
        &.default { background-color: #f5f7fa; color: #909399; }
      }
    }

    .stat-row {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 12rpx;
      .rating { color: #f56c6c; font-weight: bold; margin-right: 20rpx; }
    }

    .practice-count {
      font-size: 24rpx; color: #999;
      .num { color: #007aff; font-weight: bold; margin: 0 6rpx; }
    }
  }

  .action {
    .book-btn {
      width: 140rpx; height: 60rpx; line-height: 60rpx; font-size: 26rpx; border-radius: 30rpx; padding: 0; margin: 0;
      background-color: #007aff; color: #fff;
      &::after { border: none; }
      
      &.plain {
        background-color: #e6f2ff; color: #007aff;
      }
    }
  }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 100rpx 0;
  .empty-img { width: 240rpx; height: 240rpx; opacity: 0.7; margin-bottom: 30rpx; }
  .empty-text { font-size: 28rpx; color: #999; margin-bottom: 40rpx; }
  .go-hall-btn { width: 240rpx; height: 72rpx; line-height: 72rpx; border-radius: 36rpx; background-color: #007aff; color: #fff; font-size: 28rpx; box-shadow: 0 8rpx 16rpx rgba(0,122,255,0.2); }
}
</style>