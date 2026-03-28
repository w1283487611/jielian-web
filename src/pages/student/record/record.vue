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
                        <button class="btn primary-btn plain" @click="remindCoach(record.id)">提醒确认</button>
                    </block>

                    <block v-else-if="record.status === 1">
                        <button class="btn plain-btn" @click="cancelAppointment(record.id)">取消预约</button>
                        <button class="btn primary-btn" @click="showCheckInCode(record.appointmentNo)">出示签到码</button>
                    </block>

                    <block v-else-if="record.status === 2">
                        <button class="btn success-btn">练车进行中</button>
                    </block>

                    <block v-else-if="record.status === 3">
                        <button class="btn plain-btn" @click="deleteRecord(record.id)">删除记录</button>
                        <button class="btn plain-btn" v-if="record.isReviewed">已评价</button>
                        <button class="btn warning-btn" v-else @click="goToReview(record.id)">评价教练</button>
                    </block>

                    <block v-else-if="record.status === 4 || record.status === 6">
                        <button class="btn plain-btn" @click="deleteRecord(record.id)">删除记录</button>
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
import { getRecordList, cancelAppointmentOrder, deleteAppointmentRecord, remindCoachOrder,  } from '@/api/student/record';

// --- Tab 选项配置 ---
const tabOptions = [
    { label: '全部', value: 'all' },
    { label: '待确认', value: 0 },
    { label: '待练车', value: 1 }, // 后端已处理：传1会自动查出 1(已确认)和2(进行中)
    { label: '已完成', value: 3 },
    { label: '已取消', value: 4 },
    { label: '已过期', value: 6 },
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

// 删除记录
const deleteRecord = (id) => {
  uni.showModal({
    title: '删除记录',
    content: '确认删除这条练车记录吗？删除后将无法查看。',
    confirmColor: '#ff3b30',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...', mask: true });
          const response = await deleteAppointmentRecord(id);
          
          if (response.code === 200) {
            uni.showToast({ title: '已删除', icon: 'success' });
            // 删除成功后，无缝刷新列表
            fetchRecords(true);
          } else {
            uni.showToast({ title: response.msg || '删除失败', icon: 'none' });
          }
        } catch (error) {
          console.error('删除订单异常:', error);
          uni.showToast({ title: '网络开小差了，请重试', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
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
        5: '申诉中',
        6: '已过期'
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
        content: '距离练车时间不足 2 小时取消，将产生违约记录并可能影响后续预约，确认取消吗？',
        confirmColor: '#ff3b30', // 把确认按钮变红，起到警示作用
        success: async (res) => {
            if (res.confirm) {
                try {

                    // 弹窗防抖
                    uni.showLoading({ title: '正在取消...', mask: true });

                    // 发起真实取消请求
                    const response = await cancelAppointmentOrder({
                        appointmentId: id,
                        cancelReason: '学员端主动取消' // 也可以后续做个弹窗让学员选原因，这里先给默认值
                    });

                    if (response.code === 200) {
                        uni.showToast({ title: '订单已取消', icon: 'success' });
                        // 取消成功后，极度丝滑的体验：直接重新拉取当前 Tab 的列表数据
                        // 这样被取消的订单会立刻变灰，或者从“待练车”列表里消失！
                        fetchRecords(true);
                    } else {
                        // 拦截后端抛出的 RuntimeException (如：练车时间已过，无法取消)
                        uni.showToast({ title: response.msg || '取消失败', icon: 'none' });
                    }
                } catch (error) {
                    console.error('取消订单异常:', error);
                    uni.showToast({ title: '网络开小差了，请重试', icon: 'none' });
                } finally {
                    uni.hideLoading();
                }
            }
        }
    });
};

// 提醒确认教练
const remindCoach = async (id) => {
  try {
    uni.showLoading({ title: '发送提醒中...', mask: true });
    
    const res = await remindCoachOrder(id);
    
    if (res.code === 200) {
      // 成功触发
      uni.showToast({ title: '已向教练发送加急提醒', icon: 'success' });
    } else {
      // 触发 Redis 频控拦截，弹出温馨提示 (如：您已经提醒过了，请耐心等待...(X分钟后可再次提醒))
      uni.showModal({
        title: '提醒太频繁啦',
        content: res.msg,
        showCancel: false,
        confirmText: '我知道了'
      });
    }
  } catch (error) {
    console.error('发送催单提醒异常:', error);
    uni.showToast({ title: '网络异常，请重试', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
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
                /* 待确认 - 橙色 */
                &.status-0 {
                    color: #ff9800;
                }

                /* 待练车 - 蓝色 */
                &.status-1 {
                    color: #007aff;
                }

                /* 进行中 - 绿色 */
                &.status-2 {
                    color: #07c160;
                }

                /* 已完成 - 黑色 */
                &.status-3 {
                    color: #333;
                }

                /* 已取消 - 灰色 */
                &.status-4 {
                    color: #999;
                }

                /* 申诉中 - 红色 */
                &.status-5 {
                    color: #f56c6c;
                }

                /* 已过期 - 浅冷灰色 */
                &.status-6 {
                    color: #c0c4cc;
                }

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