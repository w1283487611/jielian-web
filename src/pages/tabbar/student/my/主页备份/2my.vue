<template>
    <view class="home-container">
        <view class="header-section">
            <view class="greeting-box">
                <text class="greeting-text">{{ greeting }}，{{ studentInfo.name }}</text>
                <text class="sub-text" v-if="studentInfo.schoolName">当前绑定：{{ studentInfo.schoolName }}</text>
                <text class="sub-text warn-text" v-else @click="goToGuide">您还未绑定驾校，去绑定 ></text>
            </view>
            <view class="avatar-box">
                <image class="avatar" :src="studentInfo.avatar || '/static/assets/images/profile.jpg'"
                    mode="aspectFill"></image>
            </view>
        </view>

        <view class="progress-card">
            <view class="card-top">
                <view class="license-tag">{{ studentInfo.licenseCode || '未定' }}</view>
                <view class="subject-text">{{ studentInfo.currentSubject || '暂无科目' }}</view>
            </view>
            <view class="card-middle">
                <view class="stat-item">
                    <text class="num">{{ studentInfo.totalHours || 0 }}<text class="unit">h</text></text>
                    <text class="label">累计练车</text>
                </view>
                <view class="stat-item">
                    <text class="num">{{ studentInfo.totalAppoints || 0 }}<text class="unit">次</text></text>
                    <text class="label">累计预约</text>
                </view>
                <view class="stat-item">
                    <text class="num">{{ studentInfo.passRate || 0 }}<text class="unit">%</text></text>
                    <text class="label">项目掌握度</text>
                </view>
            </view>
            <view class="card-bottom">
                <view class="progress-bar">
                    <view class="progress-inner" :style="{ width: (studentInfo.passRate || 0) + '%' }"></view>
                </view>
                <text class="progress-tip">继续保持，距离拿证更近一步！</text>
            </view>
        </view>

        <view class="quick-book-section" v-if="mainCoach">
            <view class="section-header">
                <text class="title">快速预约</text>
            </view>
            <view class="quick-book-card">
                <image class="coach-avatar" :src="mainCoach.avatar || '/static/assets/images/profile.jpg'"
                    mode="aspectFill"></image>
                <view class="coach-info">
                    <view class="name-line">
                        <text class="coach-name">{{ mainCoach.name }}</text>
                        <text class="coach-tag">主教练</text>
                    </view>
                    <view class="quota-line">
                        今日剩余名额：<text class="quota-num">{{ mainCoach.todayQuota }}</text>
                    </view>
                </view>
                <button class="book-btn" @click="quickBook">立即预约</button>
            </view>
        </view>

        <view class="appointment-section">
            <view class="section-header">
                <text class="title">近期行程</text>
                <text class="more" v-if="upcomingAppointment" @click="goToRecords">{{"全部记录 >"}}</text>
            </view>

            <view class="appointment-card has-data" v-if="upcomingAppointment">
                <view class="apt-header">
                    <text class="apt-status pending">待签到</text>
                    <text class="apt-date">{{ upcomingAppointment.date }} {{ upcomingAppointment.time }}</text>
                </view>
                <view class="apt-body">
                    <view class="info-row">
                        <text class="iconfont icon-location"></text>
                        <text class="text">{{ upcomingAppointment.locationName }}</text>
                    </view>
                    <view class="info-row">
                        <text class="iconfont icon-user"></text>
                        <text class="text">{{ upcomingAppointment.coachName }} 教练 · {{ upcomingAppointment.subjectName
                            }}</text>
                    </view>
                </view>
                <view class="apt-footer">
                    <button class="btn plain-btn">取消预约</button>
                    <button class="btn primary-btn">出示签到码</button>
                </view>
            </view>

            <view class="appointment-card empty-state" v-else>
                <image class="empty-img" src="/static/assets/images/empty-calendar.png" mode="aspectFit"></image>
                <text class="empty-tip">近期暂无练车安排</text>
                <button class="book-btn" @click="goToBook">去看看排班</button>
            </view>
        </view>

        <view class="grid-menu">
            <view class="grid-item" v-for="(menu, index) in menuList" :key="index" @click="handleMenuClick(menu.path)">
                <view class="icon-wrapper" :style="{ backgroundColor: menu.bgColor }">
                    <text class="iconfont" :class="menu.icon" :style="{ color: menu.iconColor }"></text>
                </view>
                <text class="menu-name">{{ menu.name }}</text>
            </view>
        </view>

        <view class="notice-bar" v-if="notices.length > 0">
            <view class="notice-icon">
                <text class="iconfont icon-notification"></text>
                <text class="notice-label">捷练头条</text>
            </view>
            <swiper class="notice-swiper" vertical autoplay circular :interval="3000">
                <swiper-item v-for="(notice, index) in notices" :key="index">
                    <view class="notice-content text-ellipsis">{{ notice.title }}</view>
                </swiper-item>
            </swiper>
        </view>

        <view class="tabbar-spacer"></view>

        <Tabbar />
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import Tabbar from "@/components/tabbar/index.vue"; // 引入自定义 Tabbar

// --- 计算问候语 ---
const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
});

// --- Mock 数据区 (后续替换为真实 API) ---

// 学员基础信息与进度
const studentInfo = reactive({
    name: '唐同学',
    avatar: '',
    schoolName: '捷练示范驾校', // 已修正名称
    licenseCode: 'C1',
    currentSubject: '科目二',
    totalHours: 12,
    totalAppoints: 8,
    passRate: 60
});

// 快速预约：主教练数据
const mainCoach = reactive({
    name: '张教练',
    avatar: '',
    todayQuota: 3
});

// 近期预约行程
const upcomingAppointment = ref({
    date: '明天',
    time: '14:00 - 16:00',
    locationName: '天河区科韵路第三训练场',
    coachName: '李伟',
    subjectName: '科目二 倒车入库'
});

// 金刚区菜单配置 (已将理论题库替换为我的驾校)
const menuList = ref([
    { name: '常规预约', icon: 'icon-calendar', bgColor: '#e6f2ff', iconColor: '#007aff', path: '/pages/student/book/book' },
    { name: '练车记录', icon: 'icon-time', bgColor: '#fff0e6', iconColor: '#ff7a00', path: '/pages/student/record/record' },
    { name: '我的教练', icon: 'icon-user-tie', bgColor: '#e6ffec', iconColor: '#00b33c', path: '/pages/student/my-coach/my-coach' },
    { name: '我的驾校', icon: 'icon-building', bgColor: '#f0e6ff', iconColor: '#7a00ff', path: '/pages/student/school-detail/school-detail' }
]);

// 公告动态 (已修正名称)
const notices = ref([
    { id: 1, title: '捷练考场最新规定：科目二考试车辆升级通知' },
    { id: 2, title: '五一假期练车时间安排调整公示' }
]);

// --- 交互事件 ---
const goToGuide = () => {
    uni.navigateTo({ url: '/pages/student/guide/guide' });
};

const goToBook = () => {
    uni.navigateTo({ url: '/pages/student/book/book' });
};

const quickBook = () => {
    // 快速预约逻辑：可直接跳转到带有该教练ID的确认预约页面或弹窗
    uni.showToast({ title: '拉起快速预约...', icon: 'none' });
};

const goToRecords = () => {
    uni.navigateTo({ url: '/pages/student/record/record' });
};

const handleMenuClick = (path) => {
    if (path) {
        uni.navigateTo({ url: path });
    } else {
        uni.showToast({ title: '功能开发中', icon: 'none' });
    }
};
</script>

<style lang="scss" scoped>
.home-container {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding: 30rpx;
    /* 移除底部的内联 padding-bottom，统一交给 tabbar-spacer 控制 */
}

/* 1. 顶部区域 */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-top: 20rpx;

    .greeting-box {
        display: flex;
        flex-direction: column;

        .greeting-text {
            font-size: 44rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 10rpx;
        }

        .sub-text {
            font-size: 26rpx;
            color: #666;
        }

        .warn-text {
            color: #ff9800;
            font-weight: bold;
        }
    }

    .avatar-box {
        .avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            border: 4rpx solid #fff;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        }
    }
}

/* 2. 进度罗盘卡片 */
.progress-card {
    background: linear-gradient(135deg, #005bea 0%, #00c6fb 100%);
    border-radius: 24rpx;
    padding: 30rpx;
    color: #fff;
    margin-bottom: 40rpx;
    box-shadow: 0 12rpx 24rpx rgba(0, 122, 255, 0.2);

    .card-top {
        display: flex;
        align-items: center;
        margin-bottom: 30rpx;

        .license-tag {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 4rpx 16rpx;
            border-radius: 8rpx;
            font-size: 24rpx;
            font-weight: bold;
            margin-right: 16rpx;
        }

        .subject-text {
            font-size: 32rpx;
            font-weight: bold;
        }
    }

    .card-middle {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30rpx;

        .stat-item {
            display: flex;
            flex-direction: column;

            .num {
                font-size: 40rpx;
                font-weight: bold;
                margin-bottom: 4rpx;

                .unit {
                    font-size: 24rpx;
                    font-weight: normal;
                    margin-left: 4rpx;
                }
            }

            .label {
                font-size: 24rpx;
                opacity: 0.8;
            }
        }
    }

    .card-bottom {
        .progress-bar {
            width: 100%;
            height: 12rpx;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 6rpx;
            overflow: hidden;
            margin-bottom: 12rpx;
        }

        .progress-inner {
            height: 100%;
            background-color: #fff;
            border-radius: 6rpx;
            transition: width 0.5s ease;
        }

        .progress-tip {
            font-size: 22rpx;
            opacity: 0.9;
        }
    }
}

/* 通用区块标题 */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
    }

    .more {
        font-size: 26rpx;
        color: #999;
    }
}

/* 3. 快速预约主教练 (根据UI图还原) */
.quick-book-section {
    margin-bottom: 40rpx;

    .quick-book-card {
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

        .coach-avatar {
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
            background-color: #eee;
            margin-right: 24rpx;
        }

        .coach-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

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
                    color: #3b82f6;
                    background-color: #eff6ff;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;
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
            width: 180rpx;
            height: 68rpx;
            line-height: 68rpx;
            background-color: #2f73f6;
            color: #fff;
            font-size: 28rpx;
            border-radius: 34rpx;
            padding: 0;
            text-align: center;

            &::after {
                border: none;
            }

            &:active {
                opacity: 0.8;
            }
        }
    }
}

/* 4. 近期行程卡片 */
.appointment-section {
    margin-bottom: 40rpx;

    .appointment-card {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

        &.has-data {
            .apt-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2rpx dashed #eee;
                padding-bottom: 20rpx;
                margin-bottom: 20rpx;

                .apt-status {
                    font-size: 24rpx;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;

                    &.pending {
                        background-color: #fff3e0;
                        color: #ff9800;
                    }
                }

                .apt-date {
                    font-size: 30rpx;
                    font-weight: bold;
                    color: #333;
                }
            }

            .apt-body {
                margin-bottom: 30rpx;

                .info-row {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 16rpx;

                    .iconfont {
                        color: #999;
                        font-size: 32rpx;
                        margin-right: 16rpx;
                        margin-top: 2rpx;
                    }

                    .text {
                        flex: 1;
                        font-size: 28rpx;
                        color: #444;
                        line-height: 1.5;
                    }
                }
            }

            .apt-footer {
                display: flex;
                justify-content: flex-end;
                gap: 20rpx;

                .btn {
                    margin: 0;
                    padding: 0 30rpx;
                    height: 64rpx;
                    line-height: 64rpx;
                    font-size: 26rpx;
                    border-radius: 32rpx;

                    &::after {
                        border: none;
                    }
                }

                .plain-btn {
                    background-color: #f5f7fa;
                    color: #666;
                }

                .primary-btn {
                    background-color: #007aff;
                    color: #fff;
                }
            }
        }

        &.empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 50rpx 0;

            .empty-img {
                width: 200rpx;
                height: 200rpx;
                margin-bottom: 20rpx;
                opacity: 0.8;
            }

            .empty-tip {
                font-size: 28rpx;
                color: #999;
                margin-bottom: 30rpx;
            }

            .book-btn {
                width: 60%;
                height: 80rpx;
                line-height: 80rpx;
                border-radius: 40rpx;
                background-color: #007aff;
                color: #fff;
                font-size: 30rpx;
                font-weight: bold;
                box-shadow: 0 8rpx 16rpx rgba(0, 122, 255, 0.3);
            }
        }
    }
}

/* 5. 金刚区导航 */
.grid-menu {
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx 10rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    .grid-item {
        width: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10rpx;

        .icon-wrapper {
            width: 88rpx;
            height: 88rpx;
            border-radius: 30%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 16rpx;

            .iconfont {
                font-size: 44rpx;
            }
        }

        .menu-name {
            font-size: 26rpx;
            color: #333;
        }
    }
}

/* 6. 底部头条公告 */
.notice-bar {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    .notice-icon {
        display: flex;
        align-items: center;
        margin-right: 20rpx;
        border-right: 2rpx solid #eee;
        padding-right: 20rpx;

        .icon-notification {
            color: #f56c6c;
            font-size: 32rpx;
            margin-right: 8rpx;
        }

        .notice-label {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            font-style: italic;
        }
    }

    .notice-swiper {
        flex: 1;
        height: 40rpx;
        line-height: 40rpx;

        .notice-content {
            font-size: 26rpx;
            color: #666;
        }
    }
}

.text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 底部安全区垫片：高度 = 你的自定义 Tabbar 高度 + 安全区底部距离 */
.tabbar-spacer {
    height: calc(120rpx + env(safe-area-inset-bottom));
    width: 100%;
}
</style>