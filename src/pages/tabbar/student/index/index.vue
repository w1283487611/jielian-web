<template>
    <view class="home-container">
        <navigator url="/pages/student/guide/guide" open-type="navigate" class="link-type">
            引导页
        </navigator>
        <navigator url="/pages/student/my-coach/my-coach" open-type="navigate" class="link-type">
            我的教练页
        </navigator>
        <navigator url="/pages/student/appoint-detail/appoint-detail" open-type="navigate" class="link-type">
            预约详情页
        </navigator>
        <!-- 头部统计卡片 -->
        <view class="header-card">
            <view class="user-welcome">
                <text class="hello">Hi, 同学</text>
                <view class="license-tag">C1 | 科目二练习中</view>
            </view>
            <view class="stats-row">
                <view class="stat-item">
                    <text class="num">12.5</text>
                    <text class="label">累计学时(h)</text>
                </view>
                <view class="stat-item">
                    <text class="num">85</text>
                    <text class="label">综合评分</text>
                </view>
                <view class="stat-item">
                    <text class="num">6</text>
                    <text class="label">预约次数</text>
                </view>
            </view>
        </view>

        <!-- 快速预约区 -->
        <view class="section">
            <view class="section-title">快速预约</view>
            <view class="quick-book-card">
                <view class="coach-preview">
                    <image src="https://placehold.co/100" class="avatar"></image>
                    <view class="info">
                        <view class="name">张教练 <text class="badge">主教练</text></view>
                        <view class="status">今日剩余名额: <text class="highlight">3</text></view>
                    </view>
                </view>
                <button class="book-btn" @click="goToBooking(101)">立即预约</button>
            </view>
        </view>

        <!-- 待办/状态提醒 -->
        <view class="section">
            <view class="section-title">当前任务</view>
            <view class="task-card" @click="goToDetail(123)">
                <view class="task-header">
                    <text class="time">今天 14:00 - 16:00</text>
                    <text class="status-text pending">待确认</text>
                </view>
                <view class="task-body">
                    <text class="content">倒车入库专项练习</text>
                    <view class="tips">请在开始后30分钟内确认上车</view>
                </view>
            </view>
        </view>
    </view>
    <!-- 自定义 TabBar -->
    <tabbar />
</template>

<script setup>
import Tabbar from "@/components/tabbar/index.vue";
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';

import useUserStore from '@/store/modules/user';
import useStudentStore from '@/store/modules/student';
import { listLicense } from "@/api/client/license";
import { listSubjectByLicenseId, tagListSubjectByLicenseId } from "@/api/client/subject";
import {
  STUDENT_HOME_PATH,
} from "@/utils/constants";
import { getStudent, setStudent, getStudy, setStudy } from "@/utils/student";
import {
  STUDENT_STORAGE_KEY, 
} from "@/utils/constants";

const userStore = useUserStore();
const studentStore = useStudentStore();
const goToBooking = (coachId) => {
    uni.navigateTo({ url: `/pages/student/do-appoint/do-appoint?coachId=${coachId}` });
};

const goToDetail = (bookingId) => {
    uni.navigateTo({ url: `/pages/student/appoint-detail/appoint-detail?id=${bookingId}` });
};

onLoad(()=>{
    studentStore.getInfo().then((res)=>{
        console.log(res)
    }).catch(()=>{})
    // userStore.id
});
</script>

<style scoped lang="scss">
.home-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 30rpx;
}

.header-card {
    background: linear-gradient(135deg, #2979ff, #5393ff);
    border-radius: 24rpx;
    padding: 40rpx;
    color: #fff;
    margin-bottom: 40rpx;
    box-shadow: 0 10rpx 20rpx rgba(41, 121, 255, 0.2);

    .user-welcome {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .hello {
            font-size: 36rpx;
            font-weight: bold;
        }

        .license-tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 6rpx 20rpx;
            border-radius: 30rpx;
            font-size: 24rpx;
        }
    }

    .stats-row {
        display: flex;
        justify-content: space-between;

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .num {
                font-size: 44rpx;
                font-weight: bold;
                margin-bottom: 8rpx;
            }

            .label {
                font-size: 24rpx;
                opacity: 0.8;
            }
        }
    }
}

.section {
    margin-bottom: 40rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    color: #333;
}

.quick-book-card {
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .coach-preview {
        display: flex;
        align-items: center;

        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 20rpx;
        }

        .name {
            font-weight: bold;
            font-size: 30rpx;
            margin-bottom: 8rpx;
        }

        .badge {
            font-size: 20rpx;
            background: #e3f2fd;
            color: #2979ff;
            padding: 2rpx 8rpx;
            border-radius: 4rpx;
            margin-left: 10rpx;
        }

        .status {
            font-size: 24rpx;
            color: #666;
        }

        .highlight {
            color: #ff5252;
            font-weight: bold;
            margin-left: 6rpx;
        }
    }

    .book-btn {
        margin: 0;
        background: #2979ff;
        color: #fff;
        font-size: 26rpx;
        border-radius: 30rpx;
        padding: 0 30rpx;
        height: 60rpx;
        line-height: 60rpx;
    }
}

.task-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    border-left: 8rpx solid #ff9900; // 橙色代表待办

    .task-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16rpx;

        .time {
            font-weight: bold;
            font-size: 30rpx;
        }

        .status-text {
            font-size: 26rpx;
            color: #ff9900;
        }
    }

    .task-body {
        .content {
            font-size: 28rpx;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
        }

        .tips {
            font-size: 24rpx;
            color: #999;
        }
    }
}
</style>