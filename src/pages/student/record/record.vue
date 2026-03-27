<template>
    <view class="record-container">
        <view class="sticky-tabs">
            <view class="tab-list">
                <view class="tab-item" v-for="(tab, index) in tabOptions" :key="index"
                    :class="{ 'active': currentTab === tab.value }" @click="switchTab(tab.value)">
                    <text class="tab-text">{{ tab.label }}</text>
                    <view class="tab-line" v-if="currentTab === tab.value"></view>
                </view>
            </view>
        </view>

        <view class="record-list">
            <view class="record-card" v-for="record in filteredRecords" :key="record.id">
                <view class="card-header">
                    <view class="time-info">
                        <text class="date">{{ record.date }}</text>
                        <text class="time">{{ record.time }}</text>
                    </view>
                    <view class="status-tag" :class="'status-' + record.status">
                        {{ getStatusText(record.status) }}
                    </view>
                </view>

                <view class="card-body">
                    <image class="coach-avatar" :src="handleAvatar(record.coachAvatar)" mode="aspectFill"></image>
                    <view class="detail-info">
                        <view class="coach-name">{{ record.coachName }} 教练</view>
                        <view class="info-row">
                            <text class="iconfont icon-book"></text>
                            <text class="text">{{ record.subjectName }} <text v-if="record.itemName">- {{
                                    record.itemName }}</text></text>
                        </view>
                        <view class="info-row">
                            <text class="iconfont icon-location"></text>
                            <text class="text">{{ record.locationName || '驾校默认训练场' }}</text>
                        </view>
                        <view class="order-no" v-if="record.appointmentNo">单号: {{ record.appointmentNo }}</view>
                    </view>
                </view>

                <view class="card-footer">
                    <block v-if="record.status === 0">
                        <button class="btn plain-btn" @click="cancelAppointment(record.id)">取消预约</button>
                        <button class="btn primary-btn plain" @click="remindCoach">提醒确认</button>
                    </block>

                    <block v-else-if="record.status === 1">
                        <button class="btn plain-btn" @click="cancelAppointment(record.id)">取消预约</button>
                        <button class="btn primary-btn" @click="showCheckInCode(record.appointmentNo)">出示签到码</button>
                    </block>

                    <block v-else-if="record.status === 2">
                        <button class="btn success-btn">练车进行中</button>
                    </block>

                    <block v-else-if="record.status === 3">
                        <button class="btn plain-btn" v-if="record.isReviewed">已评价</button>
                        <button class="btn warning-btn" v-else @click="goToReview(record.id)">评价教练</button>
                    </block>

                    <block v-else-if="record.status === 4">
                        <button class="btn plain-btn" @click="rebookCoach(record.coachId)">重新预约</button>
                    </block>
                </view>
            </view>

            <view class="empty-state" v-if="filteredRecords.length === 0">
                <image class="empty-img" src="/static/assets/images/empty-list.png" mode="aspectFit"></image>
                <text class="empty-text">暂无相关练车记录</text>
            </view>

            <view class="bottom-tips" v-if="filteredRecords.length > 0">已经到底啦~</view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';
import { getRecordList } from '@/api/student/record';

// --- Tab 选项配置 ---
const tabOptions = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 0 },
  { label: '待练车', value: 1 }, // 后端已处理：传1会自动查出 1(已确认)和2(进行中)
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];
const currentTab = ref('all');

// --- 列表与分页状态 ---
const recordList = ref([]);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: null // null 代表全部
});
const total = ref(0);
const loadStatus = ref('more'); // 'more'-还有数据, 'loading'-加载中, 'noMore'-没有更多了

// --- 核心网络请求逻辑 ---
const fetchRecords = async (isRefresh = true) => {
  if (isRefresh) {
    queryParams.pageNum = 1;
    loadStatus.value = 'loading';
  } else {
    if (loadStatus.value === 'noMore') return;
    queryParams.pageNum++;
    loadStatus.value = 'loading';
  }

  try {
    // 映射 Tab 状态给后端
    queryParams.status = currentTab.value === 'all' ? null : currentTab.value;
    
    const res = await getRecordList(queryParams);
    
    if (res.code === 200) {
      const rows = res.rows || [];
      total.value = res.total || 0;
      
      if (isRefresh) {
        recordList.value = rows;
        uni.stopPullDownRefresh(); // 停止下拉动画
      } else {
        recordList.value = [...recordList.value, ...rows]; // 追加数据
      }
      
      // 判断是否还有下一页
      loadStatus.value = recordList.value.length >= total.value ? 'noMore' : 'more';
    } else {
      uni.showToast({ title: res.msg || '获取记录失败', icon: 'none' });
      loadStatus.value = 'more';
    }
  } catch (error) {
    console.error('获取练车记录异常:', error);
    loadStatus.value = 'more';
    if (isRefresh) uni.stopPullDownRefresh();
  }
};

// --- 生命周期钩子 ---

// 每次进入页面时刷新，保证订单状态(如刚评价完、刚约完)是最新的
onShow(() => {
  fetchRecords(true);
});

// 用户下拉刷新
onPullDownRefresh(() => {
  fetchRecords(true);
});

// 用户上拉触底加载下一页
onReachBottom(() => {
  if (loadStatus.value === 'more') {
    fetchRecords(false);
  }
});

// --- 辅助函数与前端计算 ---

// 我们不再需要 computed 过滤了，因为筛选已经交给了后端数据库！
const filteredRecords = computed(() => recordList.value);

const getStatusText = (status) => {
  const map = {
    0: '待确认',
    1: '待练车',
    2: '进行中',
    3: '已完成',
    4: '已取消',
    5: '申诉中'
  };
  return map[status] || '未知状态';
};

// --- 交互事件 ---
const switchTab = (value) => {
  if (currentTab.value === value) return;
  currentTab.value = value;
  // 切换 Tab 时重置分页并刷新
  fetchRecords(true);
};

const cancelAppointment = (id) => {
  uni.showModal({
    title: '取消预约',
    content: '距离练车时间不足2小时取消可能产生违约记录，确认取消吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 接通真实的取消订单 API (调用 /student/record/cancel)
        uni.showToast({ title: '已取消 (待接入后端)', icon: 'none' });
      }
    }
  });
};

const remindCoach = () => {
  // TODO: 发送模板消息给教练
  uni.showToast({ title: '已向教练发送提醒催单', icon: 'success' });
};

const showCheckInCode = (appointmentNo) => {
  uni.showModal({
    title: '练车签到码',
    content: `您的核销码：${appointmentNo.substring(appointmentNo.length - 6)}\n请在上车前向教练出示。`,
    showCancel: false,
    confirmText: '我知道了'
  });
};

const goToReview = (id) => {
  uni.showToast({ title: '前往评价页...', icon: 'none' });
  // uni.navigateTo({ url: `/pages/student/review/review?appointmentId=${id}` });
};

const rebookCoach = (coachId) => {
  uni.navigateTo({ url: `/pages/student/appoint-detail/appoint-detail?coachId=${coachId}&date=${new Date().toISOString().split('T')[0]}` });
};
</script>

<style lang="scss" scoped>
.record-container {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding-bottom: 40rpx;
}

/* 1. 顶部 Tab (吸顶防滚动) */
.sticky-tabs {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);

    .tab-list {
        display: flex;
        justify-content: space-around;
        height: 88rpx;

        .tab-item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            width: 120rpx;

            .tab-text {
                font-size: 28rpx;
                color: #666;
                transition: color 0.3s;
            }

            &.active .tab-text {
                color: #007aff;
                font-weight: bold;
            }

            .tab-line {
                position: absolute;
                bottom: 0;
                width: 40rpx;
                height: 6rpx;
                background-color: #007aff;
                border-radius: 6rpx;
            }
        }
    }
}

/* 2. 订单列表 */
.record-list {
    padding: 30rpx;

    .record-card {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

        /* 头部：日期与状态 */
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2rpx dashed #eee;
            padding-bottom: 20rpx;
            margin-bottom: 24rpx;

            .time-info {
                .date {
                    font-size: 30rpx;
                    font-weight: bold;
                    color: #333;
                    margin-right: 16rpx;
                }

                .time {
                    font-size: 28rpx;
                    color: #666;
                }
            }

            .status-tag {
                font-size: 24rpx;
                font-weight: bold;

                /* 动态颜色映射 */
                &.status-0 {
                    color: #ff9800;
                }

                /* 待确认 - 橙色 */
                &.status-1 {
                    color: #007aff;
                }

                /* 待练车 - 蓝色 */
                &.status-2 {
                    color: #07c160;
                }

                /* 进行中 - 绿色 */
                &.status-3 {
                    color: #333;
                }

                /* 已完成 - 黑色 */
                &.status-4 {
                    color: #999;
                }

                /* 已取消 - 灰色 */
                &.status-5 {
                    color: #f56c6c;
                }

                /* 申诉中 - 红色 */
            }
        }

        /* 主体：教练与信息 */
        .card-body {
            display: flex;
            align-items: flex-start;
            margin-bottom: 30rpx;

            .coach-avatar {
                width: 100rpx;
                height: 100rpx;
                border-radius: 16rpx;
                background-color: #f0f0f0;
                margin-right: 24rpx;
            }

            .detail-info {
                flex: 1;

                .coach-name {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 12rpx;
                }

                .info-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8rpx;

                    .iconfont {
                        font-size: 26rpx;
                        color: #999;
                        margin-right: 12rpx;
                    }

                    .text {
                        font-size: 26rpx;
                        color: #666;
                    }
                }

                .order-no {
                    font-size: 22rpx;
                    color: #c0c4cc;
                    margin-top: 12rpx;
                }
            }
        }

        /* 底部操作区 */
        .card-footer {
            display: flex;
            justify-content: flex-end;
            gap: 20rpx;

            .btn {
                margin: 0;
                padding: 0 32rpx;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 26rpx;
                border-radius: 30rpx;

                &::after {
                    border: none;
                }
            }

            .plain-btn {
                background-color: #fff;
                color: #666;
                border: 2rpx solid #dcdfe6;
            }

            .primary-btn {
                background-color: #007aff;
                color: #fff;

                &.plain {
                    background-color: #e6f2ff;
                    color: #007aff;
                    border: 2rpx solid transparent;
                }
            }

            .success-btn {
                background-color: #f0f9eb;
                color: #67c23a;
            }

            .warning-btn {
                background-color: #fff8e6;
                color: #ff9800;
                border: 2rpx solid #ffe5b4;
            }
        }
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-img {
        width: 240rpx;
        height: 240rpx;
        opacity: 0.8;
        margin-bottom: 30rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}

.bottom-tips {
    text-align: center;
    font-size: 24rpx;
    color: #ccc;
    padding: 20rpx 0;
}
</style>