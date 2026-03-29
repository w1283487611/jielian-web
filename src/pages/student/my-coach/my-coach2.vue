<template>
  <view class="my-coach-container">
    
    <view class="warning-banner" v-if="!studentContext.schoolId" @click="goToSchoolList">
      <text class="iconfont icon-info-circle"></text>
      <text class="banner-text">您暂未绑定驾校，当前仅显示独立私教。暂无驾校，现在绑定 ></text>
    </view>

    <view class="hall-tabs">
      <view class="tab-item" :class="{ 'active': currentTab === 'all' }" @click="currentTab = 'all'">全部教练</view>
      
      <view class="tab-item" v-if="studentContext.schoolId" :class="{ 'active': currentTab === 'school' }" @click="currentTab = 'school'">本校教练</view>
      
      <view class="tab-item" :class="{ 'active': currentTab === 'independent' }" @click="currentTab = 'independent'">独立私教</view>
    </view>

    <view class="coach-list" v-if="displayCoachList.length > 0">
      <view class="coach-card" v-for="coach in displayCoachList" :key="coach.id" @click="goToCoachDetail(coach.id)">
        <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
        <view class="info">
          <view class="name-row">
            <text class="name">{{ coach.name }}</text>
            <text class="coach-tag" :class="coach.isMain ? 'primary' : 'default'">
              {{ coach.isMain ? '专属教练' : '曾带教' }}
            </text>
          </view>
          <view class="stat-row">
            <text class="rating">⭐ {{ coach.rating }}</text>
            <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
          </view>
          <view class="practice-count">
            累计合作：<text class="num">{{ coach.practicedTimes || 0 }}</text> 次
          </view>
        </view>
        <view class="action">
          <text class="iconfont icon-right text-gray"></text>
        </view>
      </view>
    </view>

    <view class="empty-state-card" v-else>
      <view class="empty-icon-wrap">
        <text class="iconfont icon-user-tie"></text>
      </view>

      <block v-if="currentTab === 'school'">
        <block v-if="!studentContext.coachId">
          <text class="empty-text">您已加入驾校，但暂未绑定专属教练</text>
          <button class="empty-btn" @click="goToSchoolDetail">暂无教练，现在绑定</button>
        </block>
        <block v-else>
          <text class="empty-text">暂无本校教练的带教记录</text>
        </block>
      </block>

      <block v-else-if="currentTab === 'independent'">
        <text class="empty-text">您暂无独立私教的合作记录</text>
        <button class="empty-btn" @click="goToRecommend">去教练推荐页预约</button>
      </block>

      <block v-else>
        <text class="empty-text">您还没有与任何教练产生过交集哦</text>
        <button class="empty-btn" @click="goToRecommend">去大厅找教练</button>
      </block>
    </view>

  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';
import { getMyCoachList } from '@/api/student/coach'; // 假设你之前写了这个接口

// --- 状态数据 ---
const studentContext = reactive({
  schoolId: null,
  coachId: null
});

// 当前选中的 Tab ('all' | 'school' | 'independent')
const currentTab = ref('all');

// 存储后端返回的所有教练原始数据
const allCoachesData = ref([]);

// --- 计算属性：根据当前 Tab 动态过滤展示列表 ---
const displayCoachList = computed(() => {
  if (currentTab.value === 'all') {
    return allCoachesData.value;
  } else if (currentTab.value === 'school') {
    // 假设后端返回的数据里有 type 标识：1是驾校教练，2是独立私教
    return allCoachesData.value.filter(c => c.type === 1); 
  } else if (currentTab.value === 'independent') {
    return allCoachesData.value.filter(c => c.type === 2);
  }
  return [];
});

// --- 数据获取逻辑 ---
const fetchMyCoaches = async () => {
  try {
    uni.showLoading({ title: '加载中...', mask: true });
    const res = await getMyCoachList();
    if (res.code === 200 && res.data) {
      // 1. 获取学员当前的绑定上下文
      studentContext.schoolId = res.data.context?.schoolId || null;
      studentContext.coachId = res.data.context?.coachId || null;
      
      // 2. 接收所有的教练列表 (主教练和历史教练混排或后端已排序)
      allCoachesData.value = res.data.list || [];
      
      // 3. 防呆逻辑：如果没绑驾校，且当前 Tab 是 school，自动切到独立私教或全部
      if (!studentContext.schoolId && currentTab.value === 'school') {
        currentTab.value = 'independent';
      }
    }
  } catch (error) {
    console.error('获取我的教练列表异常:', error);
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

const goToSchoolList = () => {
  uni.showToast({ title: '去绑定驾校 (待开发)', icon: 'none' });
  // uni.navigateTo({ url: '/pages/student/school-list/school-list' });
};

const goToSchoolDetail = () => {
  if (studentContext.schoolId) {
    uni.navigateTo({ url: `/pages/student/school-detail/school-detail?id=${studentContext.schoolId}` });
  }
};

const goToRecommend = () => {
  // 跳转到你提到的后续要开发的“教练推荐页”，这里先跳回预约大厅
  uni.switchTab({ url: '/pages/tabbar/student/appoint/appoint' });
};
</script>

<style lang="scss" scoped>
.my-coach-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

/* 1. 全局警告横幅 (完美复刻 appoint.vue) */
.warning-banner {
  display: flex;
  align-items: center;
  background-color: #fff8e6;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid #ffe58f;
  box-shadow: 0 4rpx 12rpx rgba(250, 173, 20, 0.1);

  .icon-info-circle {
    color: #faad14;
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .banner-text {
    font-size: 26rpx;
    color: #d48806;
    flex: 1;
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
    padding: 16rpx 0;
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
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

    &:active {
      background-color: #fafafa;
    }

    .avatar {
      width: 110rpx;
      height: 110rpx;
      border-radius: 16rpx;
      margin-right: 24rpx;
      border: 2rpx solid #f0f0f0;
    }

    .info {
      flex: 1;

      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;

        .name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-right: 16rpx;
        }

        .coach-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          
          &.primary { background-color: #eff6ff; color: #3b82f6; }
          &.default { background-color: #f5f7fa; color: #909399; }
        }
      }

      .stat-row {
        display: flex;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;

        .rating { color: #f56c6c; font-weight: bold; margin-right: 24rpx; }
      }

      .practice-count {
        font-size: 24rpx;
        color: #999;
        .num { color: #007aff; font-weight: bold; margin: 0 6rpx; }
      }
    }

    .action {
      .text-gray { font-size: 32rpx; color: #ccc; }
    }
  }
}

/* 4. 升级后的卡片式空状态 */
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
    width: 160rpx;
    height: 160rpx;
    background-color: #f5f7fa;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30rpx;

    .icon-user-tie {
      font-size: 80rpx;
      color: #c0c4cc;
    }
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 30rpx;
  }

  .empty-btn {
    background-color: #f0f7ff;
    color: #007aff;
    height: 68rpx;
    line-height: 68rpx;
    font-size: 28rpx;
    border-radius: 34rpx;
    padding: 0 50rpx;
    border: none;
    font-weight: bold;
    
    &::after { border: none; }
    &:active { opacity: 0.8; }
  }
}
</style>