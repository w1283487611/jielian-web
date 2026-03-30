<template>
    <view class="school-detail-container">

        <swiper class="media-swiper" indicator-dots autoplay circular :interval="4000" indicator-active-color="#007aff"
            v-if="schoolData.mediaList && schoolData.mediaList.length > 0">
            <swiper-item v-for="(media, index) in schoolData.mediaList" :key="media.fileId || index">
                <view class="media-wrapper" v-if="media.category === 2">
                    <video class="swiper-video" :src="handleVideoUrl(media.previewUrl)"
                        :poster="handleImageUrl(media.thumbnailUrl)" object-fit="cover" controls></video>
                    <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
                </view>
                <view class="media-wrapper" v-else>
                    <image class="swiper-image" :src="handleImageUrl(media.accessUrl)" mode="aspectFill"></image>
                    <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
                </view>
            </swiper-item>
        </swiper>

        <view class="media-swiper default-bg" v-else>
            <view class="media-wrapper">
                <image class="swiper-image" src="/static/assets/images/default-school.jpg" mode="aspectFill"></image>
            </view>
        </view>

        <view class="base-card main-info-card">
            <view class="title-row">
                <text class="school-name">{{ schoolData.name }}</text>
                <view class="premium-tag" v-if="schoolData.isPremium">
                    <uni-icons type="vip" size="14" color="#fff" class="vip-icon"></uni-icons> 黄金驾校
                </view>
            </view>

            <view class="tags-row" v-if="schoolData.tags && schoolData.tags.length > 0">
                <text class="feature-tag" v-for="(tag, idx) in schoolData.tags" :key="idx">{{ tag }}</text>
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

            <view class="review-entry" @click="goToReviewPage">
                <view class="review-left">
                    <text class="score">{{ schoolData.avgRating }}</text>
                    <view class="stars">
                        <uni-icons type="star-filled" size="14" color="#ff9800"
                            v-for="i in Math.floor(schoolData.avgRating || 5)" :key="i"></uni-icons>
                    </view>
                </view>
                <view class="review-right">
                    <text class="review-count">查看全部 {{ schoolData.reviewCount || 0 }} 条评价</text>
                    <uni-icons type="right" size="14" color="#999"></uni-icons>
                </view>
            </view>
        </view>

        <view class="base-card location-card">
            <view class="address-box" @click="openNativeMap">
                <uni-icons type="location-filled" size="22" color="#007aff" class="loc-icon"></uni-icons>
                <view class="address-info">
                    <text class="address-text">{{ schoolData.address }}</text>
                    <text class="distance-text" v-if="schoolData.distance">距离您 {{ schoolData.distance }} km</text>
                </view>
                <view class="nav-btn">
                    <text class="nav-text">导航</text>
                    <uni-icons type="paperplane-filled" size="14" color="#007aff"></uni-icons>
                </view>
            </view>

            <view class="divider"></view>

            <view class="contact-box" @click="callSchool">
                <view class="contact-left">
                    <text class="label">招生热线</text>
                    <text class="phone-num">{{ schoolData.phone || '暂无电话' }}</text>
                </view>
                <view class="call-btn">
                    <uni-icons type="phone-filled" size="20" color="#fff"></uni-icons>
                </view>
            </view>
        </view>

        <view class="base-card package-section" v-if="packageList.length > 0">
            <view class="section-title">招生套餐</view>
            <view class="package-list">
                <view class="package-card" v-for="pkg in packageList" :key="pkg.id">
                    <view class="pkg-main">
                        <text class="pkg-name">{{ pkg.name }}</text>
                        <view class="pkg-price">
                            <text class="symbol">￥</text><text class="num">{{ pkg.currentPrice }}</text>
                        </view>
                    </view>
                    <view class="pkg-desc">{{ pkg.shortDesc }}</view>
                    <view class="pkg-tags">
                        <text class="tag" v-if="pkg.includeExamFee">包考试费</text>
                        <text class="tag" v-if="pkg.includeTransportation">包接送</text>
                        <text class="tag" v-for="(t, idx) in pkg.tags" :key="idx">{{ t }}</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="base-card intro-section" v-if="schoolData.introduction">
            <view class="section-title">驾校简介</view>
            <text class="intro-content">{{ schoolData.introduction }}</text>
        </view>

        <view class="bottom-spacer"></view>

        <view class="fixed-bottom-bar">
            <template v-if="isFromGuide">
                <button class="action-btn plain-btn" @click="goBack">再看看</button>
                <button class="action-btn primary-btn" @click="selectAndBack">认准这家驾校</button>
            </template>

            <template v-else>
                <view class="icon-btn-group">
                    <view class="icon-btn" @click="toggleFavorite">
                        <uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="22"
                            :color="isFavorite ? '#ff3b30' : '#666'"></uni-icons>
                        <text class="icon-text">{{ isFavorite ? '已关注' : '关注' }}</text>
                    </view>
                    <view class="icon-btn">
                        <uni-icons type="redo" size="22" color="#666"></uni-icons>
                        <text class="icon-text">分享</text>
                    </view>
                </view>
                <button class="action-btn primary-btn" @click="callSchool">立即电话咨询</button>
            </template>
        </view>

    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSchoolDetail } from '@/api/student/school';
import { handleImageUrl, handleVideoUrl } from '@/utils/common';

const schoolId = ref(null);
const isFromGuide = ref(false); // 标识是否来自 guide.vue
const isFavorite = ref(false); // 关注状态

// 在你原有的数据基础上扩充了评分、坐标等字段
const schoolData = reactive({
    name: '',
    address: '暂无详细地址',
    avgRating: 0,
    reviewCount: 0, // 新增：评价总数
    successRate: 0,
    totalCoaches: 0,
    totalStudents: 0,
    phone: '',
    introduction: '',
    mediaList: [],
    tags: [], // 新增：驾校特色标签
    isPremium: false, // 新增：黄金驾校标识
    distance: '', // 新增：距离
    latitude: null, // 新增：纬度(用于导航)
    longitude: null // 新增：经度(用于导航)
});

const packageList = ref([]);

onLoad((options) => {
    if (options.id) {
        schoolId.value = Number(options.id);
        fetchSchoolDetail(schoolId.value);
    }
    // 获取从引导页跳过来时可能携带的标记
    if (options.fromGuide === '1') {
        isFromGuide.value = true;
    }
});

const fetchSchoolDetail = async (id) => {
    try {
        uni.showLoading({ title: '加载中' });
        const res = await getSchoolDetail(id);
        uni.hideLoading();

        if (res.code === 200 && res.data) {
            const data = res.data;
            Object.assign(schoolData, {
                name: data.name || '',
                address: data.address || '暂无详细地址',
                avgRating: data.avgRating || 0,
                reviewCount: data.reviewCount || 0, // 需后端提供
                successRate: data.successRate || 0,
                totalCoaches: data.totalCoaches || 0,
                totalStudents: data.totalStudents || 0,
                phone: data.phone || '',
                introduction: data.introduction || '',
                mediaList: data.mediaList || [],
                tags: data.tags || [], // 需后端提供
                isPremium: data.isPremium || false, // 需后端提供
                distance: data.distance || '', // 需后端提供(若有定位)
                latitude: data.latitude || null, // 需后端提供
                longitude: data.longitude || null // 需后端提供
            });
            packageList.value = data.packageList || [];
        } else {
            uni.showToast({ title: res.msg || '获取详情失败', icon: 'none' });
        }
    } catch (error) {
        uni.hideLoading();
        console.error('获取驾校详情异常:', error);
    }
};

// --- 交互事件 ---

// 1. 唤起手机原生内置地图进行位置导航
const openNativeMap = () => {
    if (!schoolData.latitude || !schoolData.longitude) {
        return uni.showToast({ title: '暂无该驾校精确坐标，无法导航', icon: 'none' });
    }
    uni.openLocation({
        latitude: Number(schoolData.latitude),
        longitude: Number(schoolData.longitude),
        name: schoolData.name,
        address: schoolData.address,
        success: () => console.log('打开原生定位成功'),
        fail: (err) => console.error('打开原生定位失败', err)
    });
};

// 2. 去评价列表页 (占位，后续开发)
const goToReviewPage = () => {
    uni.navigateTo({ url: `/pages/student/school-review/school-review?schoolId=${schoolId.value}` });
};

// 3. 拨打电话
const callSchool = () => {
    if (schoolData.phone) {
        uni.makePhoneCall({ phoneNumber: schoolData.phone });
    } else {
        uni.showToast({ title: '暂无联系电话', icon: 'none' });
    }
};

// 4. 关注/收藏
const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value;
    uni.showToast({ title: isFavorite.value ? '已关注' : '已取消关注', icon: 'none' });
};

const goBack = () => uni.navigateBack();

// 5. 专属引导页的选择返回
const selectAndBack = () => {
    uni.$emit('selectSchoolFromDetail', schoolId.value);
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.school-detail-container {
    background-color: #f5f7fa;
    min-height: 100vh;
}

/* 1. 顶部轮播 */
.media-swiper {
    width: 100%;
    height: 480rpx;
    background-color: #000;

    &.default-bg {
        background-color: #eee;
    }

    .media-wrapper {
        position: relative;
        width: 100%;
        height: 100%;

        .swiper-image,
        .swiper-video {
            width: 100%;
            height: 100%;
        }

        .media-tag {
            position: absolute;
            bottom: 40rpx;
            right: 20rpx;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 22rpx;
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            z-index: 10;
        }
    }
}

/* 通用卡片容器 (向上悬浮设计) */
.base-card {
    background-color: #fff;
    border-radius: 20rpx;
    margin: -30rpx 20rpx 24rpx;
    /* 利用负 margin 向上悬浮盖住轮播图底部 */
    padding: 30rpx;
    position: relative;
    z-index: 10;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    &.main-info-card {
        padding-top: 40rpx;
    }

    /* 非首个卡片取消负 margin */
    &:not(.main-info-card) {
        margin-top: 0;
    }
}

/* 区块标题 */
.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    position: relative;
    padding-left: 16rpx;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 28rpx;
        background-color: #007aff;
        border-radius: 4rpx;
    }
}

/* 2. 主信息卡片 */
.title-row {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .school-name {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
        margin-right: 16rpx;
    }

    .premium-tag {
        display: flex;
        align-items: center;
        background: linear-gradient(to right, #f6d365, #fda085);
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;

        .vip-icon {
            margin-right: 4rpx;
        }
    }
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 30rpx;

    .feature-tag {
        font-size: 22rpx;
        color: #007aff;
        background-color: #e6f2ff;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
    }
}

.stat-grid {
    display: flex;
    justify-content: space-around;
    padding-bottom: 30rpx;
    border-bottom: 2rpx dashed #eee;
    margin-bottom: 30rpx;

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

/* 评价跳转区块 */
.review-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fffaf0;
    padding: 20rpx 24rpx;
    border-radius: 12rpx;
    border: 2rpx solid #fff2e0;

    &:active {
        background-color: #fff5e6;
    }

    .review-left {
        display: flex;
        align-items: center;

        .score {
            font-size: 36rpx;
            font-weight: bold;
            color: #ff9800;
            margin-right: 12rpx;
        }

        .stars {
            display: flex;
            gap: 4rpx;
            margin-top: -4rpx;
        }
    }

    .review-right {
        display: flex;
        align-items: center;

        .review-count {
            font-size: 24rpx;
            color: #999;
            margin-right: 4rpx;
        }
    }
}

/* 3. 位置与联系卡片 */
.location-card {
    .address-box {
        display: flex;
        align-items: center;
        padding: 10rpx 0;

        &:active {
            opacity: 0.7;
        }

        .loc-icon {
            margin-right: 16rpx;
            align-self: flex-start;
            margin-top: 4rpx;
        }

        .address-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-right: 20rpx;

            .address-text {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
                margin-bottom: 8rpx;
                line-height: 1.4;
            }

            .distance-text {
                font-size: 24rpx;
                color: #999;
            }
        }

        .nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80rpx;
            border-left: 2rpx solid #eee;
            padding-left: 20rpx;

            .nav-text {
                font-size: 22rpx;
                color: #007aff;
                margin-bottom: 4rpx;
            }
        }
    }

    .divider {
        height: 2rpx;
        background-color: #f0f0f0;
        margin: 30rpx 0;
    }

    .contact-box {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:active {
            opacity: 0.7;
        }

        .contact-left {
            display: flex;
            flex-direction: column;

            .label {
                font-size: 24rpx;
                color: #999;
                margin-bottom: 6rpx;
            }

            .phone-num {
                font-size: 32rpx;
                color: #333;
                font-weight: bold;
                font-family: monospace;
            }
        }

        .call-btn {
            width: 72rpx;
            height: 72rpx;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
        }
    }
}

/* 4. 套餐班型列表 */
.package-list {
    .package-card {
        border: 2rpx solid #f0f0f0;
        border-radius: 12rpx;
        padding: 24rpx;
        margin-bottom: 20rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .pkg-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16rpx;

            .pkg-name {
                font-size: 30rpx;
                font-weight: bold;
                color: #333;
            }

            .pkg-price {
                color: #ff7a00;

                .symbol {
                    font-size: 24rpx;
                    font-weight: bold;
                }

                .num {
                    font-size: 36rpx;
                    font-weight: bold;
                }
            }
        }

        .pkg-desc {
            font-size: 24rpx;
            color: #999;
            line-height: 1.5;
            margin-bottom: 16rpx;
        }

        .pkg-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12rpx;

            .tag {
                font-size: 22rpx;
                padding: 4rpx 12rpx;
                border-radius: 6rpx;
                color: #007aff;
                background-color: #e6f2ff;
            }
        }
    }
}

/* 5. 简介区 */
.intro-section {
    .intro-content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        text-align: justify;
    }
}

.bottom-spacer {
    height: calc(140rpx + env(safe-area-inset-bottom));
}

/* 6. 底部固定操作栏 */
.fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    gap: 20rpx;

    /* 图标功能组 (分享/关注) */
    .icon-btn-group {
        display: flex;
        gap: 40rpx;
        margin-right: 20rpx;
        padding-left: 10rpx;

        .icon-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .icon-text {
                font-size: 22rpx;
                color: #666;
                margin-top: 4rpx;
            }
        }
    }

    .action-btn {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        font-size: 30rpx;
        border-radius: 40rpx;
        margin: 0;

        &::after {
            border: none;
        }

        &.plain-btn {
            background-color: #f0f7ff;
            color: #007aff;
            font-weight: bold;
        }

        &.primary-btn {
            background-color: #007aff;
            color: #fff;
            font-weight: bold;
            box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
        }
    }
}
</style>