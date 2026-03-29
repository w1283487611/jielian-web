<template>
  <view class="my-coach-container">
    
    <view class="global-warning-banner" v-if="!studentContext.schoolId">
      <view class="banner-left">
        <text class="iconfont icon-info-circle"></text>
        <text class="banner-text">您当前处于自由陪练模式</text>
      </view>
      <button class="bind-action-btn" @click="goToBindSchool">暂无驾校，现在绑定</button>
    </view>

    <view class="hall-tabs">
      <view class="tab-item" v-if="studentContext.schoolId" :class="{ 'active': currentTab === 'current' }" @click="currentTab = 'current'">驾校教练</view>
      
      <view class="tab-item" :class="{ 'active': currentTab === 'historySchool' }" @click="currentTab = 'historySchool'">历史带教</view>
      <view class="tab-item" :class="{ 'active': currentTab === 'independent' }" @click="currentTab = 'independent'">独立私教</view>
    </view>

    <view class="content-area">
      
      <block v-if="currentTab === 'current'">
        <view class="coach-list" v-if="currentCoaches.length > 0">
          <view class="coach-card current-card" v-for="coach in currentCoaches" :key="coach.id" @click="goToCoachDetail(coach.id)">
            <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
            <view class="info">
              <view class="name-row">
                <text class="name">{{ coach.name }}</text>
                <text class="coach-tag" :class="coach.id === studentContext.mainCoachId ? 'primary' : 'warning'">
                  {{ coach.id === studentContext.mainCoachId ? '主教练' : '临时教练' }}
                </text>
              </view>
              <view class="stat-row">⭐ {{ coach.rating }} · 教龄 {{ coach.teachingYears }} 年</view>
              <view class="practice-count">当前驾校为您分配的专属导师</view>
            </view>
            <button class="book-btn" @click.stop="quickBook(coach.id)">去约车</button>
          </view>
        </view>
        
        <view class="empty-state-card" v-else>
          <view class="empty-icon-wrap"><text class="iconfont icon-user-tie"></text></view>
          <text class="empty-text">您已加入驾校，但暂未分配专属教练</text>
          <button class="empty-btn" @click="goToBindCoach">暂无教练，现在绑定</button>
        </view>
      </block>

      <block v-if="currentTab === 'historySchool'">
        <view class="coach-list" v-if="historySchoolCoaches.length > 0">
          <view class="coach-card" v-for="coach in historySchoolCoaches" :key="coach.id" @click="goToCoachDetail(coach.id)">
            <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
            <view class="info">
              <view class="name-row">
                <text class="name">{{ coach.name }}</text>
                <text class="coach-tag default">驾校带教</text>
              </view>
              <view class="stat-row">⭐ {{ coach.rating }} · 教龄 {{ coach.teachingYears }} 年</view>
              <view class="practice-count">历史合作订单：<text class="num">{{ coach.practicedTimes }}</text> 次</view>
            </view>
            <button class="book-btn plain" @click.stop="quickBook(coach.id)">再约一次</button>
          </view>
        </view>
        
        <view class="empty-state-card" v-else>
          <view class="empty-icon-wrap"><text class="iconfont icon-file-empty"></text></view>
          <text class="empty-text">您暂无任何驾校订单的带教记录</text>
        </view>
      </block>

      <block v-if="currentTab === 'independent'">
        <view class="coach-list" v-if="historyPrivateCoaches.length > 0">
          <view class="coach-card" v-for="coach in historyPrivateCoaches" :key="coach.id" @click="goToCoachDetail(coach.id)">
            <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
            <view class="info">
              <view class="name-row">
                <text class="name">{{ coach.name }}</text>
                <text class="coach-tag success">独立私教</text>
              </view>
              <view class="stat-row">⭐ {{ coach.rating }} · 课时费 ￥{{ coach.price || 150 }}/时起</view>
              <view class="practice-count">历史合作订单：<text class="num">{{ coach.practicedTimes }}</text> 次</view>
            </view>
            <button class="book-btn plain" @click.stop="quickBook(coach.id)">再约一次</button>
          </view>
        </view>
        
        <view class="empty-state-card" v-else>
          <view class="empty-icon-wrap"><text class="iconfont icon-compass"></text></view>
          <text class="empty-text">您暂未预约过任何独立私教</text>
          <button class="empty-btn primary-outline" @click="goToRecommend">去教练推荐页预约</button>
        </view>
      </block>

    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';
import { getMyCoachList } from '@/api/student/coach'; 

// --- 状态数据 ---
const studentContext = reactive({
  schoolId: null,
  mainCoachId: null,
  tempCoachId: null
});

// 当前选中的 Tab ('current' | 'historySchool' | 'independent')
const currentTab = ref('current');

// 三个维度的教练列表数据
const currentCoaches = ref([]);
const historySchoolCoaches = ref([]);
const historyPrivateCoaches = ref([]);

// 辅助方法：获取今天日期 (用于快捷复购)
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- 数据获取逻辑 ---
const fetchMyCoaches = async () => {
  try {
    uni.showLoading({ title: '加载中...', mask: true });
    // 后端接口需按新逻辑聚合返回这三组数据
    const res = await getMyCoachList();
    if (res.code === 200 && res.data) {
      
      studentContext.schoolId = res.data.context?.schoolId || null;
      studentContext.mainCoachId = res.data.context?.mainCoachId || null;
      studentContext.tempCoachId = res.data.context?.tempCoachId || null;
      
      currentCoaches.value = res.data.currentCoaches || [];
      historySchoolCoaches.value = res.data.historySchoolCoaches || [];
      historyPrivateCoaches.value = res.data.historyPrivateCoaches || [];
      
      // 核心防呆：如果没绑定驾校，强制隐藏'current'，并切到独立私教或历史带教
      if (!studentContext.schoolId && currentTab.value === 'current') {
        currentTab.value = 'independent';
      }
    }
  } catch (error) {
    console.error('获取教练列表异常:', error);
  } finally {
    uni.hideLoading();
    uni.stopPullDownRefresh();
  }
};

onShow(() => { fetchMyCoaches(); });
onPullDownRefresh(() => { fetchMyCoaches(); });

// --- 路由跳转事件 ---
const goToCoachDetail = (coachId) => {
  uni.navigateTo({ url: `/pages/student/coach-detail/coach-detail?id=${coachId}` });
};

const quickBook = (coachId) => {
  uni.navigateTo({ 
    url: `/pages/student/appoint-detail/appoint-detail?coachId=${coachId}&date=${getTodayDateString()}` 
  });
};

const goToBindSchool = () => {
  // 跳转到驾校列表页去绑定
  uni.navigateTo({ url: '/pages/student/school-list/school-list' });
};

const goToBindCoach = () => {
  // 回到驾校详情页或专属的绑定教练页
  if (studentContext.schoolId) {
    uni.navigateTo({ url: `/pages/student/school-detail/school-detail?id=${studentContext.schoolId}` });
  }
};

const goToRecommend = () => {
  // 跳转到教练推荐大厅 (预约 Tab)
  uni.switchTab({ url: '/pages/tabbar/student/appoint/appoint' });
};
</script>

<style lang="scss" scoped>
.my-coach-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

/* 1. 顶部极具引导性的全局横幅 */
.global-warning-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #fffbeb 0%, #fff3cd 100%);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(250, 173, 20, 0.15);
  border: 2rpx solid #ffe58f;

  .banner-left {
    display: flex;
    align-items: center;
    .icon-info-circle { color: #faad14; font-size: 36rpx; margin-right: 12rpx; }
    .banner-text { font-size: 26rpx; color: #d48806; font-weight: bold; }
  }

  .bind-action-btn {
    margin: 0;
    padding: 0 24rpx;
    height: 56rpx;
    line-height: 52rpx;
    background-color: transparent;
    color: #d48806;
    font-size: 24rpx;
    border-radius: 28rpx;
    border: 2rpx solid #faad14;
    font-weight: bold;
    &::after { border: none; }
    &:active { opacity: 0.7; }
  }
}

/* 2. 圆角 Tab 栏 */
.hall-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 12rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 18rpx 0;
    font-size: 28rpx;
    color: #666;
    border-radius: 14rpx;
    transition: all 0.3s;

    &.active {
      background-color: #f0f7ff;
      color: #007aff;
      font-weight: bold;
    }
  }
}

/* 3. 教练列表展示卡片 */
.coach-list {
  .coach-card {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    &.current-card {
      border-left: 8rpx solid #007aff; /* 驾校当前教练的视觉强调 */
    }

    .avatar {
      width: 110rpx; height: 110rpx; border-radius: 50%; margin-right: 24rpx; border: 2rpx solid #f0f0f0;
    }

    .info {
      flex: 1;
      .name-row {
        display: flex; align-items: center; margin-bottom: 12rpx;
        .name { font-size: 32rpx; font-weight: bold; color: #333; margin-right: 16rpx; }
        
        .coach-tag {
          font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 6rpx;
          &.primary { background-color: #eff6ff; color: #3b82f6; }
          &.warning { background-color: #fffbeb; color: #f59e0b; }
          &.success { background-color: #ecfdf5; color: #10b981; }
          &.default { background-color: #f5f7fa; color: #909399; }
        }
      }

      .stat-row { font-size: 24rpx; color: #999; margin-bottom: 10rpx; }
      
      .practice-count {
        font-size: 24rpx; color: #999;
        .num { color: #007aff; font-weight: bold; margin: 0 6rpx; }
      }
    }

    .book-btn {
      margin: 0 0 0 20rpx; width: 140rpx; height: 60rpx; line-height: 60rpx;
      background-color: #007aff; color: #fff; font-size: 26rpx; border-radius: 30rpx; padding: 0;
      &::after { border: none; }
      &.plain { background-color: #f0f7ff; color: #007aff; font-weight: bold; }
    }
  }
}

/* 4. 各场景专属空状态卡片 */
.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 80rpx 40rpx;
  margin-top: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

  .empty-icon-wrap {
    width: 160rpx; height: 160rpx; background-color: #f5f7fa; border-radius: 50%;
    display: flex; justify-content: center; align-items: center; margin-bottom: 30rpx;
    .iconfont { font-size: 80rpx; color: #c0c4cc; }
  }

  .empty-text {
    font-size: 28rpx; color: #999; text-align: center; line-height: 1.5; margin-bottom: 40rpx;
  }

  .empty-btn {
    background-color: #fff; color: #f59e0b; height: 68rpx; line-height: 64rpx;
    font-size: 28rpx; border-radius: 34rpx; padding: 0 50rpx; border: 2rpx solid #f59e0b; font-weight: bold;
    &::after { border: none; }
    
    &.primary-outline {
      color: #007aff; border-color: #007aff;
    }
  }
}
</style>