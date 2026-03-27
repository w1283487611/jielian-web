<template>
    <view class="detail-container">
        <view class="profile-section base-box">
            <view class="main-info">
                <image class="avatar" :src="handleAvatar(coachData.avatar)" mode="aspectFill"></image>
                <view class="info-right">
                    <view class="name-line">
                        <text class="name">{{ coachData.name }} 教练</text>
                        <text class="rating">⭐ {{ coachData.rating }}</text>
                    </view>
                    <view class="exp-line">教龄 {{ coachData.teachingYears }} 年 | 带教 {{ coachData.totalStudents }} 人
                    </view>
                    <view class="tags-line">
                        <text class="tag" v-for="(tag, index) in coachData.tags" :key="index">{{ tag }}</text>
                    </view>
                </view>
            </view>
            <view class="intro-box" v-if="coachData.shortIntro">
                <text class="quote-icon">“</text>
                <text class="intro-text">{{ coachData.shortIntro }}</text>
                <text class="quote-icon right">”</text>
            </view>
        </view>

        <view class="coach-media-section base-box" v-if="mediaList.length > 0">
            <view class="section-title">教练风采</view>
            <scroll-view scroll-x class="media-scroll">
                <view class="media-item" v-for="media in mediaList" :key="media.fileId">
                    <view class="media-content">
                        <image v-if="media.category === 2" class="media-cover" :src="handleImageUrl(media.thumbnailUrl)"
                            mode="aspectFill"></image>
                        <image v-else class="media-cover" :src="handleImageUrl(media.accessUrl)" mode="aspectFill">
                        </image>
                        <view class="play-icon-mask" v-if="media.category === 2">
                            <text class="iconfont icon-play"></text>
                        </view>
                    </view>
                    <text class="media-tag" v-if="media.tag">{{ media.tag }}</text>
                </view>
            </scroll-view>
        </view>

        <view class="feed-section base-box" v-if="feedList.length > 0">
            <view class="section-title">教练动态</view>
            <scroll-view scroll-x class="feed-scroll">
                <view class="feed-card" v-for="feed in feedList" :key="feed.id">
                    <image class="feed-cover" :src="handleImageUrl(feed.coverUrl)" mode="aspectFill"></image>
                    <view class="feed-content">{{ feed.content }}</view>
                </view>
            </scroll-view>
        </view>

        <view class="review-section base-box" v-if="reviewList.length > 0">
            <view class="section-title">精选评价 ({{ coachData.totalRatings }})</view>
            <view class="review-list">
                <view class="review-item" v-for="review in reviewList" :key="review.id">
                    <view class="reviewer-line">
                        <image class="reviewer-avatar" :src="handleAvatar(review.userAvatar)" mode="aspectFill"></image>
                        <text class="reviewer-name">{{ review.userName }}</text>
                        <text class="review-time">{{ review.createdAt }}</text>
                    </view>
                    <view class="review-content">{{ review.content }}</view>
                </view>
            </view>
        </view>

        <view class="bottom-spacer"></view>

        <view class="fixed-bottom-bar">
            <button class="action-btn primary-btn" @click="selectAndBack">认准这位教练，返回继续</button>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getCoachDetail } from '@/api/student/coach';
import { handleAvatar, handleImageUrl } from '@/utils/common'; // 引入全局媒体处理工具

const coachId = ref(null);

const coachData = reactive({
    name: '',
    avatar: '',
    teachingYears: 0,
    totalStudents: 0,
    rating: 0,
    totalRatings: 0,
    tags: [],
    shortIntro: ''
});

const mediaList = ref([]);
const feedList = ref([]);
const reviewList = ref([]);

onLoad((options) => {
    if (options.id) {
        coachId.value = Number(options.id);
        fetchCoachDetail(coachId.value);
    }
});

const fetchCoachDetail = async (id) => {
    try {
        uni.showLoading({ title: '加载中' });
        const res = await getCoachDetail(id);
        uni.hideLoading();

        if (res.code === 200 && res.data) {
            const data = res.data;

            Object.assign(coachData, {
                name: data.name || '未知教练',
                avatar: data.avatar || '',
                teachingYears: data.teachingYears || 0,
                totalStudents: data.totalStudents || 0,
                rating: data.rating || 0,
                totalRatings: data.totalRatings || 0,
                tags: data.tags || [], // 后端直传 List<String>，直接赋值
                shortIntro: data.shortIntro || '该教练很懒，暂无简介~'
            });

            mediaList.value = data.mediaList || [];
            feedList.value = data.feedList || [];
            reviewList.value = data.reviewList || [];
        } else {
            uni.showToast({ title: res.msg || '获取详情失败', icon: 'none' });
        }
    } catch (error) {
        uni.hideLoading();
        console.error('获取教练详情异常:', error);
    }
};

const selectAndBack = () => {
    uni.$emit('selectCoachFromDetail', coachId.value);
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.detail-container {
    background-color: #f5f7fa;
    min-height: 100vh;
    padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
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

/* 顶部名片区 */
.profile-section {
    padding-top: 40rpx;

    .main-info {
        display: flex;
        align-items: center;
        margin-bottom: 30rpx;

        .avatar {
            width: 140rpx;
            height: 140rpx;
            border-radius: 50%;
            margin-right: 30rpx;
            border: 4rpx solid #e6f2ff;
        }

        .info-right {
            flex: 1;

            .name-line {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                margin-bottom: 10rpx;

                .name {
                    font-size: 36rpx;
                    font-weight: bold;
                    color: #333;
                }

                .rating {
                    font-size: 30rpx;
                    color: #f56c6c;
                    font-weight: bold;
                }
            }

            .exp-line {
                font-size: 26rpx;
                color: #666;
                margin-bottom: 12rpx;
            }

            .tags-line {
                display: flex;
                flex-wrap: wrap;
                gap: 10rpx;

                .tag {
                    font-size: 22rpx;
                    background-color: #f0f7ff;
                    color: #007aff;
                    padding: 4rpx 16rpx;
                    border-radius: 20rpx;
                }
            }
        }
    }

    .intro-box {
        background-color: #f9fafc;
        border-radius: 12rpx;
        padding: 24rpx;
        position: relative;

        .quote-icon {
            font-size: 40rpx;
            color: #c0c4cc;
            font-family: serif;
            position: absolute;
            top: 10rpx;
            left: 10rpx;
        }

        .quote-icon.right {
            top: auto;
            bottom: -10rpx;
            left: auto;
            right: 20rpx;
        }

        .intro-text {
            font-size: 26rpx;
            color: #666;
            line-height: 1.6;
            display: block;
            padding: 0 20rpx;
            text-indent: 2em;
        }
    }
}

/* 教练风采横向滚动区 */
.media-scroll {
    white-space: nowrap;

    .media-item {
        display: inline-block;
        width: 240rpx;
        margin-right: 20rpx;

        .media-content {
            position: relative;
            width: 240rpx;
            height: 320rpx;
            border-radius: 12rpx;
            overflow: hidden;

            .media-cover {
                width: 100%;
                height: 100%;
                background-color: #eee;
            }

            .play-icon-mask {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;

                .icon-play {
                    color: #fff;
                    font-size: 60rpx;
                    opacity: 0.8;
                }
            }
        }

        .media-tag {
            display: block;
            font-size: 24rpx;
            color: #666;
            text-align: center;
            margin-top: 10rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

/* 动态区横向滚动 */
.feed-scroll {
    white-space: nowrap;

    .feed-card {
        display: inline-block;
        width: 280rpx;
        margin-right: 20rpx;
        border-radius: 12rpx;
        overflow: hidden;
        background-color: #f9f9f9;
        border: 2rpx solid #eee;

        .feed-cover {
            width: 100%;
            height: 180rpx;
            background-color: #ddd;
        }

        .feed-content {
            padding: 16rpx;
            font-size: 24rpx;
            color: #333;
            white-space: normal;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }
    }
}

/* 评价区 */
.review-list {
    .review-item {
        border-bottom: 2rpx solid #f0f0f0;
        padding-bottom: 24rpx;
        margin-bottom: 24rpx;

        &:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .reviewer-line {
            display: flex;
            align-items: center;
            margin-bottom: 16rpx;

            .reviewer-avatar {
                width: 60rpx;
                height: 60rpx;
                border-radius: 50%;
                margin-right: 16rpx;
            }

            .reviewer-name {
                font-size: 28rpx;
                color: #333;
                flex: 1;
            }

            .review-time {
                font-size: 24rpx;
                color: #999;
            }
        }

        .review-content {
            font-size: 28rpx;
            color: #444;
            line-height: 1.5;
        }
    }
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

    .primary-btn {
        width: 100%;
        background-color: #007aff;
        color: #fff;
        font-size: 32rpx;
        border-radius: 40rpx;
    }
}
</style>