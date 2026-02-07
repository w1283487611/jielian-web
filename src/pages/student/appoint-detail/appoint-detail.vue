<template>
  <view class="detail-container">
    <!-- 状态横幅 -->
    <view class="status-banner" :class="statusClass">
      <view class="status-text">{{ statusText }}</view>
      <view class="status-desc">{{ statusDesc }}</view>
    </view>

    <!-- 预约信息卡片 -->
    <view class="info-card">
      <view class="row">
        <text class="label">预约教练</text>
        <text class="value">张教练</text>
      </view>
      <view class="row">
        <text class="label">练习时间</text>
        <text class="value highlight">2023-10-25 14:00-16:00</text>
      </view>
      <view class="row">
        <text class="label">练习内容</text>
        <text class="value">倒车入库, 侧方停车</text>
      </view>
      <view class="divider"></view>
      <view class="row">
        <text class="label">当前状态</text>
        <view class="status-steps">
          <text :class="{ done: true }">预约</text>
          <text class="arrow">></text>
          <text :class="{ done: hasConfirmed }">确认</text>
          <text class="arrow">></text>
          <text :class="{ done: isCompleted }">完成</text>
        </view>
      </view>
    </view>

    <!-- 操作区域：确认上车 (仅在开始后30分钟内有效) -->
    <view class="action-area" v-if="status === 'pending_confirm'">
      <view class="confirm-box">
        <view class="timer-tip">请在 14:30 前确认上车，否则将记为爽约</view>
        <button 
          class="main-btn" 
          :class="{ disabled: hasConfirmed }"
          @click="confirmStart"
        >
          {{ hasConfirmed ? '等待教练确认...' : '我已上车，确认开始' }}
        </button>
      </view>
    </view>

    <!-- 操作区域：评价 (练习结束后) -->
    <view class="action-area" v-if="status === 'completed' && !hasRated">
      <view class="rate-box">
        <view class="title">本次练车体验如何？</view>
        <view class="stars">
          <text 
            v-for="i in 5" 
            :key="i" 
            class="star" 
            :class="{ active: rating >= i }"
            @click="rating = i"
          >★</text>
        </view>
        <button class="submit-btn" @click="submitRating">提交评价</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

// 模拟状态: 'booked', 'pending_confirm', 'in_progress', 'completed', 'missed'
const status = ref('pending_confirm'); 
const hasConfirmed = ref(false);
const hasRated = ref(false);
const rating = ref(0);

const statusClass = computed(() => {
  const map = {
    booked: 'blue',
    pending_confirm: 'orange',
    in_progress: 'green',
    completed: 'gray',
    missed: 'red'
  };
  return map[status.value];
});

const statusText = computed(() => {
  const map = {
    booked: '已预约成功',
    pending_confirm: '待确认上车',
    in_progress: '正在练车中',
    completed: '练习已结束',
    missed: '已爽约'
  };
  return map[status.value];
});

const statusDesc = computed(() => {
  if (status.value === 'pending_confirm') return '练习开始半小时内需双方确认';
  if (status.value === 'booked') return '请按时到达驾校';
  return '';
});

const isCompleted = computed(() => status.value === 'completed');

const confirmStart = () => {
  uni.showModal({
    title: '确认上车',
    content: '请确保您已到达车辆位置并准备开始。',
    success: (res) => {
      if (res.confirm) {
        hasConfirmed.value = true;
        uni.showToast({ title: '已确认，等待教练确认', icon: 'none' });
        
        // 模拟教练也确认后变为进行中
        setTimeout(() => {
          status.value = 'in_progress';
        }, 2000);
      }
    }
  });
};

const submitRating = () => {
  if (rating.value === 0) return uni.showToast({ title: '请点亮星星', icon: 'none' });
  uni.showToast({ title: '感谢您的评价', icon: 'success' });
  hasRated.value = true;
};
</script>

<style scoped lang="scss">
.detail-container { min-height: 100vh; background: #f5f7fa; }

.status-banner {
  padding: 50rpx 40rpx;
  color: #fff;
  
  &.blue { background: #2979ff; }
  &.orange { background: #ff9900; }
  &.green { background: #19be6b; }
  &.red { background: #fa3534; }
  &.gray { background: #909399; }
  
  .status-text { font-size: 40rpx; font-weight: bold; margin-bottom: 10rpx; }
  .status-desc { font-size: 26rpx; opacity: 0.9; }
}

.info-card {
  margin: -30rpx 30rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;
    font-size: 30rpx;
    
    .label { color: #666; }
    .value { font-weight: 500; color: #333; text-align: right; }
    .highlight { color: #2979ff; font-weight: bold; }
  }
  
  .divider { height: 1rpx; background: #eee; margin: 30rpx 0; }
  
  .status-steps {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;
    
    .arrow { margin: 0 10rpx; }
    .done { color: #2979ff; font-weight: bold; }
  }
}

.action-area {
  padding: 0 30rpx;
  
  .confirm-box, .rate-box {
    background: #fff;
    padding: 40rpx;
    border-radius: 20rpx;
    text-align: center;
  }
  
  .timer-tip { font-size: 26rpx; color: #ff9900; margin-bottom: 30rpx; }
  
  .main-btn {
    background: #2979ff;
    color: #fff;
    border-radius: 50rpx;
    &.disabled { background: #a0cfff; }
  }
  
  .stars {
    font-size: 60rpx;
    color: #eee;
    margin: 20rpx 0 40rpx;
    
    .star {
      margin: 0 10rpx;
      &.active { color: #ffca28; }
    }
  }
  
  .submit-btn {
    background: #2979ff;
    color: #fff;
    border-radius: 50rpx;
    width: 60%;
  }
}
</style>