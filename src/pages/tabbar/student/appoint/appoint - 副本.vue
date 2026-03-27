<template>
    <view class="appoint-container">
        <view class="sticky-header">
            <view class="context-bar">
                <text class="mode-text">
                    <text class="iconfont" :class="studentContext.schoolId ? 'icon-building' : 'icon-compass'"></text>
                    {{ studentContext.schoolName || '✨ 自由陪练模式' }}
                </text>
                <view class="upcoming-badge" v-if="hasUpcoming" @click="goToRecords">
                    <text class="iconfont icon-bell"></text>
                    <text>待练车提醒</text>
                </view>
            </view>

            <scroll-view scroll-x class="date-scroll" :show-scrollbar="false">
                <view v-for="(dateItem, index) in dateList" :key="index" class="date-item"
                    :class="{ 'active': selectedDate === dateItem.fullDate }" @click="selectDate(dateItem.fullDate)">
                    <text class="week">{{ dateItem.weekLabel }}</text>
                    <text class="day">{{ dateItem.dayLabel }}</text>
                    <view class="dot" v-if="dateItem.hasSchedule"></view>
                </view>
            </scroll-view>
        </view>

        <view class="scroll-content">

            <view class="smart-recommend-section" v-if="recommendCoach">
                <view class="section-title">
                    <text class="title">推荐预约</text>
                    <text class="sub-title">基于您的数据智能推荐</text>
                </view>
                <view class="recommend-card" @click="goToCoachDetail(recommendCoach.id)">
                    <image class="coach-avatar" :src="handleAvatar(recommendCoach.avatar)" mode="aspectFill"></image>
                    <view class="coach-info">
                        <view class="name-line">
                            <text class="coach-name">{{ recommendCoach.name }}</text>
                            <text class="coach-tag" :class="recommendCoach.tagType">{{ recommendCoach.tagText }}</text>
                        </view>
                        <view class="quota-line">
                            {{ displayDateText }}剩余名额：<text class="quota-num">{{ recommendCoach.quota }}</text>
                        </view>
                    </view>
                    <button class="book-btn" @click.stop="goToSchedule(recommendCoach.id)">查看时段</button>
                </view>
            </view>

            <view class="coach-hall-section">

                <view class="warning-banner" v-if="!studentContext.schoolId" @click="goToGuide">
                    <text class="iconfont icon-info-circle"></text>
                    <text class="banner-text">您暂未绑定驾校，目前仅显示独立私教。点击去绑定驾校 ></text>
                </view>

                <view class="hall-header">
                    <view class="hall-tabs">
                        <view class="tab-item" :class="{ 'active': currentTab === 'my' }" @click="switchTab('my')">我的教练
                        </view>

                        <view class="tab-item" v-if="studentContext.schoolId"
                            :class="{ 'active': currentTab === 'school' }" @click="switchTab('school')">本校教练</view>

                        <view class="tab-item" :class="{ 'active': currentTab === 'independent' }"
                            @click="switchTab('independent')">独立私教</view>
                    </view>
                    <view class="manage-link" @click="goToMyCoaches">
                        管理 <text class="iconfont icon-right"></text>
                    </view>
                </view>

                <view class="coach-list">
                    <view class="coach-card" v-for="coach in currentCoachList" :key="coach.id"
                        @click="goToCoachDetail(coach.id)">
                        <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
                        <view class="info">
                            <view class="name-row">
                                <text class="name">{{ coach.name }}</text>
                                <text class="rating">⭐ {{ coach.rating }}</text>
                            </view>
                            <view class="tags-row">
                                <text class="tag" v-for="(tag, idx) in coach.tags" :key="idx">{{ tag }}</text>
                            </view>
                            <view class="stat-row">
                                <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
                                <text class="price" v-if="currentTab === 'independent'">￥{{ coach.price || 150
                                }}/时起</text>
                            </view>
                        </view>
                        <view class="action">
                            <button class="action-btn" :class="{ 'disabled': coach.quota === 0 }"
                                @click.stop="goToSchedule(coach.id)">
                                {{ coach.quota > 0 ? '约车' : '已满' }}
                            </button>
                        </view>
                    </view>

                    <view class="empty-state" v-if="currentCoachList.length === 0">
                        <image class="empty-img" src="/static/assets/images/empty-data.png" mode="aspectFit"></image>

                        <block v-if="currentTab === 'school' && !studentContext.coachId">
                            <text class="empty-text">您还未绑定专属主教练</text>
                            <button class="empty-btn" @click="goToSchoolDetail">前往驾校主页绑定</button>
                        </block>

                        <block v-else-if="currentTab === 'independent'">
                            <text class="empty-text">该日期暂无独立私教排班</text>
                        </block>

                        <block v-else>
                            <text class="empty-text">所选日期暂无教练排班，请查看其他日期</text>
                        </block>
                    </view>

                </view>
            </view>
        </view>

        <view class="tabbar-spacer"></view>
        <Tabbar />
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import Tabbar from "@/components/tabbar/index.vue";
import { handleAvatar } from '@/utils/common';
import { getAppointInit, getAppointCoachList } from '@/api/student/appoint';

// --- 状态数据 ---
const studentContext = reactive({
    schoolId: null,
    schoolName: '',
    coachId: null // 新增：用于判断是否绑定了主教练
});

const hasUpcoming = ref(false);
const dateList = ref([]);
const selectedDate = ref('');
const currentTab = ref('my');

const recommendCoach = ref(null);
const currentCoachList = ref([]);

const displayDateText = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate.value === today) return '今日';
    return '该日';
});

// --- 网络请求逻辑 ---
const fetchInitData = async () => {
    try {
        const res = await getAppointInit();
        if (res.code === 200 && res.data) {
            studentContext.schoolId = res.data.schoolId || null;
            studentContext.schoolName = res.data.schoolName || '';
            studentContext.coachId = res.data.coachId || null; // 后端需在 init 接口补充下发 coachId
            hasUpcoming.value = res.data.hasUpcoming || false;
            recommendCoach.value = res.data.recommendCoach || null;

            if (!studentContext.schoolId && currentTab.value === 'school') {
                currentTab.value = 'independent'; // 如果没驾校，默认切到私教(或my)
            }
        }
    } catch (error) {
        console.error('获取初始化数据异常:', error);
    }
};

const fetchCoachList = async () => {
    if (!selectedDate.value) return;
    try {
        uni.showLoading({ title: '加载排班中', mask: true });
        const res = await getAppointCoachList({
            date: selectedDate.value,
            tab: currentTab.value
        });
        if (res.code === 200) {
            currentCoachList.value = res.data || [];
        } else {
            uni.showToast({ title: res.msg || '获取排班失败', icon: 'none' });
        }
    } catch (error) {
        console.error('获取教练列表异常:', error);
    } finally {
        uni.hideLoading();
        uni.stopPullDownRefresh();
    }
};

// --- 生命周期 ---
const generateDateList = () => {
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const fullDate = `${targetDate.getFullYear()}-${month}-${day}`;

        let weekLabel = '周' + weeks[targetDate.getDay()];
        if (i === 0) weekLabel = '今天';
        if (i === 1) weekLabel = '明天';

        list.push({ fullDate, dayLabel: `${month}-${day}`, weekLabel, hasSchedule: true });
    }
    dateList.value = list;
    if (!selectedDate.value) selectedDate.value = list[0].fullDate;
};

onShow(() => {
    generateDateList();
    fetchInitData();
    fetchCoachList();
});

onPullDownRefresh(() => {
    fetchInitData();
    fetchCoachList();
});

// --- 交互事件 ---
const selectDate = (dateStr) => {
    if (selectedDate.value === dateStr) return;
    selectedDate.value = dateStr;
    fetchCoachList();
};

const switchTab = (tab) => {
    if (currentTab.value === tab) return;
    currentTab.value = tab;
    fetchCoachList();
};

// 各种跳转路由
const goToSchedule = (coachId) => {
    uni.navigateTo({ url: `/pages/student/appoint-detail/appoint-detail?coachId=${coachId}&date=${selectedDate.value}` });
};

const goToCoachDetail = (coachId) => {
    uni.navigateTo({ url: `/pages/student/coach-detail/coach-detail?id=${coachId}` });
};

const goToMyCoaches = () => {
    uni.navigateTo({ url: '/pages/student/my-coach/my-coach' });
};

const goToGuide = () => {
    uni.navigateTo({ url: '/pages/student/guide/guide' });
};

const goToSchoolDetail = () => {
    if (studentContext.schoolId) {
        uni.navigateTo({ url: `/pages/student/school-detail/school-detail?id=${studentContext.schoolId}` });
    }
};

const goToRecords = () => {
    uni.navigateTo({ url: '/pages/student/record/record' });
};
</script>



<style lang="scss" scoped>
.appoint-container {
    background-color: #f5f7fa;
    min-height: 100vh;
}

/* 1. 顶部粘性区域 */
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
    padding-top: env(safe-area-inset-top);
    /* 适配刘海屏 */
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.context-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;

    .mode-text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;

        .iconfont {
            color: #007aff;
            margin-right: 10rpx;
        }
    }

    .upcoming-badge {
        display: flex;
        align-items: center;
        background-color: #fff0e6;
        color: #ff7a00;
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        font-weight: bold;
        animation: breathe 2s infinite;

        .iconfont {
            font-size: 28rpx;
            margin-right: 8rpx;
        }
    }
}

@keyframes breathe {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.8;
        transform: scale(1.02);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* 横向日期流 */
.date-scroll {
    width: 100%;
    white-space: nowrap;
    padding: 10rpx 20rpx 20rpx;
    box-sizing: border-box;

    .date-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 110rpx;
        height: 130rpx;
        border-radius: 16rpx;
        background-color: #f5f7fa;
        margin-right: 16rpx;
        position: relative;
        transition: all 0.3s ease;

        .week {
            font-size: 26rpx;
            color: #666;
            margin-bottom: 8rpx;
        }

        .day {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
        }

        .dot {
            width: 8rpx;
            height: 8rpx;
            background-color: #007aff;
            border-radius: 50%;
            position: absolute;
            bottom: 12rpx;
        }

        &.active {
            background-color: #007aff;
            box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.3);

            .week,
            .day {
                color: #fff;
            }

            .dot {
                background-color: #fff;
            }
        }
    }
}

.scroll-content {
    padding: 30rpx;
}

/* 2. 智能推荐卡片 (复用首页快速预约风格) */
.smart-recommend-section {
    margin-bottom: 40rpx;

    .section-title {
        margin-bottom: 20rpx;

        .title {
            font-size: 34rpx;
            font-weight: bold;
            color: #333;
            margin-right: 16rpx;
        }

        .sub-title {
            font-size: 24rpx;
            color: #999;
        }
    }

    .recommend-card {
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
        border-left: 8rpx solid #007aff;

        .coach-avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            margin-right: 24rpx;
            border: 2rpx solid #eee;
        }

        .coach-info {
            flex: 1;

            .name-line {
                display: flex;
                align-items: center;
                margin-bottom: 12rpx;

                .coach-name {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-right: 12rpx;
                }

                .coach-tag {
                    font-size: 20rpx;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;

                    &.primary {
                        background-color: #eff6ff;
                        color: #3b82f6;
                    }

                    &.warning {
                        background-color: #fffbeb;
                        color: #f59e0b;
                    }

                    &.success {
                        background-color: #ecfdf5;
                        color: #10b981;
                    }
                }
            }

            .quota-line {
                font-size: 26rpx;
                color: #666;

                .quota-num {
                    color: #ff3b30;
                    font-weight: bold;
                    margin-left: 8rpx;
                }
            }
        }

        .book-btn {
            margin: 0;
            width: 160rpx;
            height: 60rpx;
            line-height: 60rpx;
            background-color: #2f73f6;
            color: #fff;
            font-size: 26rpx;
            border-radius: 30rpx;
            padding: 0;
        }
    }
}

/* 3. 教练大厅 */
.coach-hall-section {
    .hall-tabs {
        display: flex;
        margin-bottom: 30rpx;
        background-color: #fff;
        border-radius: 16rpx;
        padding: 10rpx;

        .tab-item {
            flex: 1;
            text-align: center;
            padding: 16rpx 0;
            font-size: 28rpx;
            color: #666;
            border-radius: 12rpx;
            transition: all 0.2s;

            &.active {
                background-color: #f0f7ff;
                color: #007aff;
                font-weight: bold;
            }
        }
    }

    .coach-list {
        .coach-card {
            display: flex;
            align-items: center;
            background-color: #fff;
            border-radius: 20rpx;
            padding: 30rpx;
            margin-bottom: 20rpx;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

            .avatar {
                width: 110rpx;
                height: 110rpx;
                border-radius: 16rpx;
                margin-right: 24rpx;
            }

            .info {
                flex: 1;

                .name-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 10rpx;

                    .name {
                        font-size: 32rpx;
                        font-weight: bold;
                        color: #333;
                    }

                    .rating {
                        font-size: 26rpx;
                        color: #f56c6c;
                        font-weight: bold;
                    }
                }

                .tags-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10rpx;
                    margin-bottom: 12rpx;

                    .tag {
                        font-size: 20rpx;
                        color: #666;
                        background-color: #f5f7fa;
                        padding: 4rpx 12rpx;
                        border-radius: 6rpx;
                    }
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 24rpx;
                    color: #999;

                    .price {
                        color: #ff7a00;
                        font-weight: bold;
                        font-size: 26rpx;
                    }
                }
            }

            .action {
                margin-left: 20rpx;
                display: flex;
                flex-direction: column;
                align-items: center;

                .action-btn {
                    width: 120rpx;
                    height: 60rpx;
                    line-height: 60rpx;
                    background-color: #007aff;
                    color: #fff;
                    font-size: 26rpx;
                    border-radius: 30rpx;
                    padding: 0;
                    margin: 0;

                    &.disabled {
                        background-color: #ccc;
                        color: #fff;
                    }
                }
            }
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;

    .empty-img {
        width: 240rpx;
        height: 240rpx;
        opacity: 0.7;
        margin-bottom: 20rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}

.tabbar-spacer {
    height: calc(120rpx + env(safe-area-inset-bottom));
    width: 100%;
}


/* 继承之前的核心样式，新增补充的样式 */
.appoint-container {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
    padding-top: env(safe-area-inset-top);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.context-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;

    .mode-text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;

        .iconfont {
            color: #007aff;
            margin-right: 10rpx;
        }
    }

    .upcoming-badge {
        display: flex;
        align-items: center;
        background-color: #fff0e6;
        color: #ff7a00;
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        font-weight: bold;
        animation: breathe 2s infinite;

        .iconfont {
            font-size: 28rpx;
            margin-right: 8rpx;
        }
    }
}

@keyframes breathe {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.8;
        transform: scale(1.02);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.date-scroll {
    width: 100%;
    white-space: nowrap;
    padding: 10rpx 20rpx 20rpx;
    box-sizing: border-box;

    .date-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 110rpx;
        height: 130rpx;
        border-radius: 16rpx;
        background-color: #f5f7fa;
        margin-right: 16rpx;
        position: relative;
        transition: all 0.3s ease;

        .week {
            font-size: 26rpx;
            color: #666;
            margin-bottom: 8rpx;
        }

        .day {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
        }

        .dot {
            width: 8rpx;
            height: 8rpx;
            background-color: #007aff;
            border-radius: 50%;
            position: absolute;
            bottom: 12rpx;
        }

        &.active {
            background-color: #007aff;
            box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.3);

            .week,
            .day {
                color: #fff;
            }

            .dot {
                background-color: #fff;
            }
        }
    }
}

.scroll-content {
    padding: 30rpx;
}

/* 智能推荐区 */
.smart-recommend-section {
    margin-bottom: 40rpx;

    .section-title {
        margin-bottom: 20rpx;

        .title {
            font-size: 34rpx;
            font-weight: bold;
            color: #333;
            margin-right: 16rpx;
        }

        .sub-title {
            font-size: 24rpx;
            color: #999;
        }
    }

    .recommend-card {
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
        border-left: 8rpx solid #007aff;

        .coach-avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            margin-right: 24rpx;
            border: 2rpx solid #eee;
        }

        .coach-info {
            flex: 1;

            .name-line {
                display: flex;
                align-items: center;
                margin-bottom: 12rpx;

                .coach-name {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-right: 12rpx;
                }

                .coach-tag {
                    font-size: 20rpx;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;

                    &.primary {
                        background-color: #eff6ff;
                        color: #3b82f6;
                    }

                    &.warning {
                        background-color: #fffbeb;
                        color: #f59e0b;
                    }

                    &.success {
                        background-color: #ecfdf5;
                        color: #10b981;
                    }
                }
            }

            .quota-line {
                font-size: 26rpx;
                color: #666;

                .quota-num {
                    color: #ff3b30;
                    font-weight: bold;
                    margin-left: 8rpx;
                }
            }
        }

        .book-btn {
            margin: 0;
            width: 160rpx;
            height: 60rpx;
            line-height: 60rpx;
            background-color: #2f73f6;
            color: #fff;
            font-size: 26rpx;
            border-radius: 30rpx;
            padding: 0;
        }
    }
}

/* 全局警告横幅 */
.warning-banner {
    display: flex;
    align-items: center;
    background-color: #fff8e6;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 30rpx;
    border: 2rpx solid #ffe58f;

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

/* 教练大厅 Tab 头部 */
.hall-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .hall-tabs {
        display: flex;
        background-color: #fff;
        border-radius: 16rpx;
        padding: 10rpx;

        .tab-item {
            padding: 12rpx 30rpx;
            font-size: 28rpx;
            color: #666;
            border-radius: 12rpx;
            transition: all 0.2s;

            &.active {
                background-color: #f0f7ff;
                color: #007aff;
                font-weight: bold;
            }
        }
    }

    .manage-link {
        font-size: 26rpx;
        color: #999;
        display: flex;
        align-items: center;

        .iconfont {
            font-size: 24rpx;
            margin-left: 4rpx;
            margin-top: 4rpx;
        }
    }
}

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
        }

        .info {
            flex: 1;

            .name-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 10rpx;

                .name {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                }

                .rating {
                    font-size: 26rpx;
                    color: #f56c6c;
                    font-weight: bold;
                }
            }

            .tags-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10rpx;
                margin-bottom: 12rpx;

                .tag {
                    font-size: 20rpx;
                    color: #666;
                    background-color: #f5f7fa;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;
                }
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                font-size: 24rpx;
                color: #999;

                .price {
                    color: #ff7a00;
                    font-weight: bold;
                    font-size: 26rpx;
                }
            }
        }

        .action {
            margin-left: 20rpx;
            display: flex;
            flex-direction: column;
            align-items: center;

            .action-btn {
                width: 120rpx;
                height: 60rpx;
                line-height: 60rpx;
                background-color: #007aff;
                color: #fff;
                font-size: 26rpx;
                border-radius: 30rpx;
                padding: 0;
                margin: 0;

                &.disabled {
                    background-color: #ccc;
                    color: #fff;
                }
            }
        }
    }
}

/* 多态空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;

    .empty-img {
        width: 240rpx;
        height: 240rpx;
        opacity: 0.7;
        margin-bottom: 20rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 30rpx;
    }

    .empty-btn {
        background-color: #fff;
        color: #007aff;
        border: 2rpx solid #007aff;
        height: 68rpx;
        line-height: 64rpx;
        font-size: 28rpx;
        border-radius: 34rpx;
        padding: 0 40rpx;
    }
}

.tabbar-spacer {
    height: calc(120rpx + env(safe-area-inset-bottom));
    width: 100%;
}
</style>