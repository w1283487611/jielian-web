<template>
    <view class="school-detail-container">

        <swiper class="media-swiper" indicator-dots autoplay circular :interval="4000" indicator-active-color="#007aff"
            v-if="schoolData.mediaList && schoolData.mediaList.length > 0">
            <swiper-item v-for="(media, index) in schoolData.mediaList" :key="media.fileId || index">
                <view class="media-wrapper" v-if="media.category === 2">
                    <video class="swiper-video" :src="media.previewUrl" :poster="media.thumbnailUrl" object-fit="cover"
                        controls></video>
                    <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
                </view>
                <view class="media-wrapper" v-else>
                    <image class="swiper-image" :src="media.accessUrl" mode="aspectFill"></image>
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

const schoolId = ref(null);
const isFromGuide = ref(false);
const isFavorite = ref(false);

// 初始化响应式数据
const schoolData = reactive({
    name: '加载中...',
    address: '获取地址中...',
    avgRating: 0,
    reviewCount: 0,
    successRate: 0,
    totalCoaches: 0,
    totalStudents: 0,
    phone: '',
    introduction: '',
    mediaList: [],
    tags: [],
    isPremium: false,
    distance: '',
    latitude: null,
    longitude: null
});

const packageList = ref([]);

onLoad((options) => {
    if (options.id) {
        schoolId.value = Number(options.id);
    }
    if (options.fromGuide === '1') {
        isFromGuide.value = true;
    }

    // 触发获取静态模拟数据
    fetchMockSchoolDetail();
});

// --- 🔥 纯静态逼真 Mock 数据获取 ---
const fetchMockSchoolDetail = () => {
    uni.showLoading({ title: '加载中' });

    // 模拟网络延迟 500ms，让你看清加载过渡
    setTimeout(() => {
        // 填充驾校主信息
        Object.assign(schoolData, {
            name: '大众驾校 (东圳东路总校区)',
            isPremium: true,
            avgRating: 4.9,
            reviewCount: 1284,
            successRate: 92,
            totalCoaches: 86,
            totalStudents: 15420,
            tags: ['自建考场', '免费班车', '随到随学', '金牌口碑'],
            address: '福建省莆田市荔城区东圳东路123号大众学车基地',
            distance: '1.5',
            latitude: 25.454226,  // 真实的莆田坐标，测试导航有效
            longitude: 119.007788,
            phone: '400-888-6666',
            introduction: '大众驾校成立于2005年，是本市占地面积最大、车辆最多的国家一级驾校。拥有占地200亩的自建大型专业封闭式训练场，1:1还原真实考试场地。我们提供全市覆盖的免费班车接送服务，所有教练员均经过星级评定执教，承诺“一次性收费，绝无吃拿卡要”，旨在为您提供最专业、最轻松的学车拿证体验！'
        });

        // 填充轮播媒体图 (使用了网络公开的占位图来保证显示效果)
        schoolData.mediaList = [
            {
                fileId: 1,
                category: 1,
                accessUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
                tag: '绝美训练场'
            },
            {
                fileId: 2,
                category: 1,
                accessUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=800&auto=format&fit=crop',
                tag: '全新教练车'
            },
            {
                fileId: 3,
                category: 1,
                accessUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
                tag: '学员休息室'
            }
        ];

        // 填充套餐列表
        packageList.value = [
            {
                id: 1,
                name: 'C1 基础无忧班',
                currentPrice: 2888,
                shortDesc: '性价比首选，包含所有基础科目培训费用，自主预约练车。',
                includeExamFee: false,
                includeTransportation: true,
                tags: ['多人一车', '适合学生']
            },
            {
                id: 2,
                name: 'C2 VIP尊享包过班',
                currentPrice: 4299,
                shortDesc: '专车专教，提供门对门接送服务，包含所有补考费，拿证最快。',
                includeExamFee: true,
                includeTransportation: true,
                tags: ['1对1教学', '科二科三连考', '优先安排']
            }
        ];

        uni.hideLoading();
    }, 500);
};

// --- 交互事件 ---
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

const goToReviewPage = () => {
    uni.showToast({ title: '去往评价列表页 (待开发)', icon: 'none' });
    // uni.navigateTo({ url: `/pages/student/school-review/school-review?schoolId=${schoolId.value}` });
};

const callSchool = () => {
    if (schoolData.phone) {
        uni.makePhoneCall({ phoneNumber: schoolData.phone });
    } else {
        uni.showToast({ title: '暂无联系电话', icon: 'none' });
    }
};

const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value;
    uni.showToast({ title: isFavorite.value ? '已关注' : '已取消关注', icon: 'none' });
};

const goBack = () => uni.navigateBack();

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
    padding: 30rpx;
    position: relative;
    z-index: 10;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    &.main-info-card {
        padding-top: 40rpx;
    }

    &:not(.main-info-card) {
        margin-top: 0;
    }
}

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