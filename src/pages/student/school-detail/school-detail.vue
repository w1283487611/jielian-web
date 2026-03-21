<template>
    <view class="detail-container">
        <swiper class="media-swiper" indicator-dots autoplay circular>
            <swiper-item v-for="(img, index) in schoolData.mediaList" :key="index">
                <image :src="img" mode="aspectFill" class="swiper-image"></image>
            </swiper-item>
        </swiper>

        <view class="info-section base-box">
            <view class="header-row">
                <text class="school-name">{{ schoolData.name }}</text>
                <text class="rating">⭐ {{ schoolData.avgRating }}</text>
            </view>
            <view class="address-row">
                <text class="iconfont icon-location"></text>
                <text class="address-text">{{ schoolData.address }}</text>
                <text class="distance">距您 {{ schoolData.distance }} km</text>
            </view>
            <view class="stat-grid">
                <view class="stat-item">
                    <text class="num">{{ schoolData.successRate }}%</text>
                    <text class="label">考试通过率</text>
                </view>
                <view class="stat-item">
                    <text class="num">{{ schoolData.totalCoaches }}</text>
                    <text class="label">优质教练</text>
                </view>
                <view class="stat-item">
                    <text class="num">{{ schoolData.totalStudents }}</text>
                    <text class="label">累计学员</text>
                </view>
            </view>
        </view>

        <view class="package-section base-box">
            <view class="section-title">招生套餐</view>
            <view class="package-list">
                <view class="package-card" v-for="pkg in packageList" :key="pkg.id">
                    <view class="pkg-main">
                        <text class="pkg-name">{{ pkg.name }}</text>
                        <text class="pkg-price">￥{{ pkg.currentPrice }}</text>
                    </view>
                    <view class="pkg-desc">{{ pkg.shortDesc }}</view>
                    <view class="pkg-tags">
                        <text class="tag" v-if="pkg.includeExamFee">包考试费</text>
                        <text class="tag" v-if="pkg.includeTransportation">包接送</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="intro-section base-box">
            <view class="section-title">驾校简介</view>
            <text class="intro-content">{{ schoolData.introduction }}</text>
        </view>

        <view class="bottom-spacer"></view>

        <view class="fixed-bottom-bar">
            <view class="action-btn icon-btn" @click="callSchool">
                <text class="iconfont icon-phone"></text>
                <text>电话咨询</text>
            </view>
            <button class="action-btn primary-btn" @click="selectAndBack">就选这家，返回继续</button>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const schoolId = ref(null);

const schoolData = reactive({
    name: '',
    address: '',
    distance: 0,
    avgRating: 0,
    successRate: 0,
    totalCoaches: 0,
    totalStudents: 0,
    phone: '',
    introduction: '',
    mediaList: []
});

const packageList = ref([]);

onLoad((options) => {
    if (options.id) {
        schoolId.value = Number(options.id);
        fetchSchoolDetail(schoolId.value);
    }
});

const fetchSchoolDetail = async (id) => {
    // 模拟请求后端的驾校详情数据
    uni.showLoading({ title: '加载中' });

    // 模拟数据赋值
    Object.assign(schoolData, {
        name: '顺达驾校',
        address: '广东省广州市天河区科韵路12号',
        distance: 1.2,
        avgRating: 4.8,
        successRate: 89.5,
        totalCoaches: 45,
        totalStudents: 3200,
        phone: '400-123-4567',
        introduction: '顺达驾校成立于2010年，拥有独立的标准化大型综合训练场地。我们秉承“严谨教学，用心服务”的理念，为广大学员提供优质的驾驶培训服务。驾校配备全新教练车，接送服务覆盖全城。',
        mediaList: [
            '/static/assets/images/login-background.jpg',
            '/static/assets/images/pay.png'
        ]
    });

    packageList.value = [
        { id: 1, name: 'C1 手动挡全包班', currentPrice: 3999, shortDesc: '适合时间充裕学员，不限学时练到考过为止', includeExamFee: true, includeTransportation: true },
        { id: 2, name: 'C2 自动挡VIP班', currentPrice: 4599, shortDesc: '一人一车，专属教练，优先安排考试', includeExamFee: true, includeTransportation: true }
    ];

    uni.hideLoading();
};

const callSchool = () => {
    uni.makePhoneCall({
        phoneNumber: schoolData.phone
    });
};

const selectAndBack = () => {
    // 触发全局事件，通知引导页更新选中的驾校ID
    uni.$emit('selectSchoolFromDetail', schoolId.value);
    // 返回上一页（引导页）
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.detail-container {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.media-swiper {
    width: 100%;
    height: 400rpx;

    .swiper-image {
        width: 100%;
        height: 100%;
    }
}

.base-box {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
    color: #333;
}

/* 核心信息区 */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .school-name {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
    }

    .rating {
        font-size: 32rpx;
        color: #f56c6c;
        font-weight: bold;
    }
}

.address-row {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 30rpx;

    .icon-location {
        margin-right: 10rpx;
        color: #007aff;
    }

    .address-text {
        flex: 1;
    }

    .distance {
        color: #999;
        margin-left: 20rpx;
    }
}

.stat-grid {
    display: flex;
    justify-content: space-around;
    border-top: 2rpx solid #f0f0f0;
    padding-top: 30rpx;

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .num {
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 8rpx;
        }

        .label {
            font-size: 24rpx;
            color: #999;
        }
    }
}

/* 套餐区 */
.package-card {
    border: 2rpx solid #eee;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .pkg-main {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;

        .pkg-name {
            font-size: 30rpx;
            font-weight: bold;
        }

        .pkg-price {
            font-size: 32rpx;
            color: #ff5722;
            font-weight: bold;
        }
    }

    .pkg-desc {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 16rpx;
    }

    .pkg-tags {
        display: flex;
        gap: 16rpx;

        .tag {
            font-size: 20rpx;
            padding: 4rpx 12rpx;
            border-radius: 6rpx;
            background-color: #e6f2ff;
            color: #007aff;
        }
    }
}

/* 简介区 */
.intro-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
}

/* 底部操作栏 */
.bottom-spacer {
    height: 140rpx;
}

.fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

    .icon-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 22rpx;
        color: #666;
        margin-right: 40rpx;

        .iconfont {
            font-size: 40rpx;
            margin-bottom: 4rpx;
        }
    }

    .primary-btn {
        flex: 1;
        background-color: #007aff;
        color: #fff;
        font-size: 32rpx;
        border-radius: 40rpx;
    }
}
</style>