<template>
    <view class="detail-container">
        <!-- <swiper class="media-swiper" indicator-dots autoplay circular :interval="4000">
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
        </swiper> -->
        <swiper 
      class="media-swiper" 
      indicator-dots 
      autoplay 
      circular 
      :interval="4000"
      v-if="schoolData.mediaList && schoolData.mediaList.length > 0"
    >
      <swiper-item v-for="(media, index) in schoolData.mediaList" :key="media.fileId || index">
        <view class="media-wrapper" v-if="media.category === 2">
          <video 
            class="swiper-video" 
            :src="handleVideoUrl(media.previewUrl)" 
            :poster="handleImageUrl(media.thumbnailUrl)"
            object-fit="cover"
            controls
          ></video>
          <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
        </view>
        <view class="media-wrapper" v-else>
          <image 
            class="swiper-image" 
            :src="handleImageUrl(media.accessUrl)" 
            mode="aspectFill"
          ></image>
          <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="media-swiper" v-else>
      <view class="media-wrapper">
        <image 
          class="swiper-image" 
          :src="handleImageUrl('')" 
          mode="aspectFill"
        ></image>
      </view>
    </view>

        <view class="info-section base-box">
            <view class="header-row">
                <text class="school-name">{{ schoolData.name }}</text>
                <text class="rating">⭐ {{ schoolData.avgRating }}</text>
            </view>
            <view class="address-row">
                <text class="iconfont icon-location"></text>
                <text class="address-text">{{ schoolData.address }}</text>
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

        <view class="package-section base-box" v-if="packageList.length > 0">
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

        <view class="intro-section base-box" v-if="schoolData.introduction">
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
import { getSchoolDetail } from '@/api/student/school';
import { handleImageUrl, handleVideoUrl } from '@/utils/common'; // 引入全局媒体处理工具


const schoolId = ref(null);

const schoolData = reactive({
    name: '',
    address: '',
    avgRating: 0,
    successRate: 0,
    totalCoaches: 0,
    totalStudents: 0,
    phone: '',
    introduction: '',
    mediaList: [] // 现在是包含完整属性的对象数组
});

const packageList = ref([]);

onLoad((options) => {
    if (options.id) {
        schoolId.value = Number(options.id);
        fetchSchoolDetail(schoolId.value);
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
                successRate: data.successRate || 0,
                totalCoaches: data.totalCoaches || 0,
                totalStudents: data.totalStudents || 0,
                phone: data.phone || '',
                introduction: data.introduction || '',
                mediaList: data.mediaList || []
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

const callSchool = () => {
    if (schoolData.phone) {
        uni.makePhoneCall({ phoneNumber: schoolData.phone });
    } else {
        uni.showToast({ title: '暂无联系电话', icon: 'none' });
    }
};

const selectAndBack = () => {
    uni.$emit('selectSchoolFromDetail', schoolId.value);
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.detail-container {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.media-swiper {
    width: 100%;
    height: 450rpx;
    background-color: #000;

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
            bottom: 20rpx;
            right: 20rpx;
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 22rpx;
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
        }
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
    align-items: flex-start;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 30rpx;

    .icon-location {
        margin-right: 10rpx;
        color: #007aff;
        margin-top: 4rpx;
    }

    .address-text {
        flex: 1;
        line-height: 1.4;
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

.intro-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
}

/* 底部操作栏 */
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
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
    z-index: 100;

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