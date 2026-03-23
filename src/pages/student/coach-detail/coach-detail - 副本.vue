<template>
    <view class="detail-container">
        <view class="profile-section base-box">
            <view class="main-info">
                <image class="avatar" :src="coachData.avatar" mode="aspectFill"></image>
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
            <view class="intro-box">
                <text class="quote-icon">“</text>
                <text class="intro-text">{{ coachData.shortIntro }}</text>
                <text class="quote-icon right">”</text>
            </view>
        </view>

        <view class="feed-section base-box" v-if="feedList.length > 0">
            <view class="section-title">教练动态</view>
            <scroll-view scroll-x class="feed-scroll">
                <view class="feed-card" v-for="feed in feedList" :key="feed.id">
                    <image class="feed-cover" :src="feed.coverUrl" mode="aspectFill"></image>
                    <view class="feed-content">{{ feed.content }}</view>
                </view>
            </scroll-view>
        </view>

        <view class="review-section base-box">
            <view class="section-title">精选评价 ({{ coachData.totalRatings }})</view>
            <view class="review-list">
                <view class="review-item" v-for="review in reviewList" :key="review.id">
                    <view class="reviewer-line">
                        <image class="reviewer-avatar" :src="review.userAvatar" mode="aspectFill"></image>
                        <text class="reviewer-name">{{ review.userName }}</text>
                        <text class="review-time">{{ review.createdAt }}</text>
                    </view>
                    <view class="review-content">{{ review.content }}</view>
                    <view class="review-tags" v-if="review.tags">
                        <text class="rtag" v-for="(t, i) in review.tags.split(',')" :key="i">{{ t }}</text>
                    </view>
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

            // // 处理 tags 字符串转数组 (兼容后端可能传回的 JSON 字符串或逗号分隔符)
            // let parsedTags = [];
            // if (data.tags) {
            //     try {
            //         // 尝试按 JSON 数组解析
            //         parsedTags = JSON.parse(data.tags);
            //     } catch (e) {
            //         // 解析失败则按逗号分割
            //         parsedTags = data.tags.split(',');
            //     }
            // }

            Object.assign(coachData, {
                name: data.name,
                avatar: data.avatar || '/static/assets/images/noUser.jpg', // 提供默认头像兜底
                teachingYears: data.teachingYears || 0,
                totalStudents: data.totalStudents || 0,
                rating: data.rating || 0,
                totalRatings: data.totalRatings || 0,
                tags: data.tags || [], // 后端直接返回了数组，极其丝滑
                shortIntro: data.shortIntro || '该教练很懒，暂无简介~'
            });

            feedList.value = data.feedList || [];
            reviewList.value = data.reviewList || [];
        } else {
            uni.showToast({ title: res.msg || '获取详情失败', icon: 'none' });
        }
    } catch (error) {
        uni.hideLoading();
        console.error('获取教练详情异常:', error);
    }

    // uni.showLoading({ title: '加载中' });

    // // 模拟合并了 coach, coach_statistic, user 表的数据
    // Object.assign(coachData, {
    //     name: '张建国',
    //     avatar: '/static/assets/images/profile.jpg',
    //     teachingYears: 8,
    //     totalStudents: 850,
    //     rating: 4.9,
    //     totalRatings: 326,
    //     tags: ['脾气好', '通过率高', '不抽烟'],
    //     shortIntro: '从事驾培行业8年，总结了一套通俗易懂的练车技巧。对待学员耐心细致，承诺绝不吃拿卡要，希望能帮助大家轻松拿证，安全驾驶。'
    // });

    // // 模拟 coach_feed 动态数据
    // feedList.value = [
    //     { id: 1, content: '今天科二考试全员一把过！大家辛苦了！', coverUrl: '/static/assets/images/login-background.jpg' },
    //     { id: 2, content: '倒车入库点位讲解小视频，建议收藏。', coverUrl: '/static/assets/images/login-background.png' }
    // ];

    // // 模拟 review 评价数据
    // reviewList.value = [
    //     { id: 1, userName: '李*明', userAvatar: '/static/assets/images/profile.jpg', createdAt: '2026-03-15', content: '张教练真的很有耐心，我科二挂了一次，教练一直鼓励我帮我找原因，第二次终于过了！', tags: '耐心指导,专业规范' },
    //     { id: 2, userName: '王*芳', userAvatar: '/static/assets/images/profile.jpg', createdAt: '2026-03-10', content: '练车环境很好，教练车里很干净，教练也不抽烟，教学方法很容易懂。', tags: '脾气好' }
    // ];

    // uni.hideLoading();
};

const selectAndBack = () => {
    // 触发全局事件，通知引导页更新选中的教练ID
    uni.$emit('selectCoachFromDetail', coachId.value);
    // 返回上一页
    uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.detail-container {
    background-color: #f5f7fa;
    min-height: 100vh;
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
            /* 恢复内容换行 */
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
            margin-bottom: 16rpx;
        }

        .review-tags {
            display: flex;
            gap: 12rpx;
            flex-wrap: wrap;

            .rtag {
                font-size: 20rpx;
                color: #ff9800;
                border: 2rpx solid #ffcc80;
                padding: 2rpx 10rpx;
                border-radius: 6rpx;
            }
        }
    }
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

    .primary-btn {
        width: 100%;
        background-color: #007aff;
        color: #fff;
        font-size: 32rpx;
        border-radius: 40rpx;
    }
}
</style>