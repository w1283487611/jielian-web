<template>
    <view class="review-container">
        <view class="review-card">
            <view class="title">本次练车体验如何？</view>
            <view class="subtitle">您的评价将帮助我们提升服务质量，且对教练匿名</view>

            <!-- <view class="star-group">
                <view class="star-item" v-for="star in 5" :key="star" @click="formData.rating = star">
                    <text class="iconfont"
                        :class="star <= formData.rating ? 'icon-star-fill active' : 'icon-star'"></text>
                </view>
            </view> -->
            <view class="star-group">
                <view class="star-item" v-for="star in 5" :key="star" @click="formData.rating = star">
                    <text class="star-icon" :class="{ 'active': star <= formData.rating }">★</text>
                </view>
            </view>
            <view class="rating-text">{{ ratingDesc }}</view>
        </view>

        <view class="feedback-card">
            <view class="card-title">想对教练说点什么（选填）</view>
            <textarea class="feedback-input" v-model="formData.feedback" placeholder="教练教学耐心吗？场地环境怎么样？写下您的真实感受吧..."
                maxlength="200"></textarea>
            <view class="word-count">{{ formData.feedback.length }}/200</view>
        </view>

        <button class="submit-btn" :class="{ 'disabled': formData.rating === 0 }" @click="submit">
            提交评价
        </button>
    </view>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { submitAppointmentReview } from '@/api/student/record';

const formData = reactive({
    appointmentId: null,
    rating: 0, // 默认 0 星（强制必须打分才能提交）
    feedback: ''
});

// 星级对应的文案提示
const ratingDesc = computed(() => {
    const map = { 1: '极差，非常不满', 2: '较差，需要改进', 3: '一般，马马虎虎', 4: '良好，比较满意', 5: '非常棒，强烈推荐！' };
    return map[formData.rating] || '请点击星星打分';
});

onLoad((options) => {
    if (options.appointmentId) {
        formData.appointmentId = Number(options.appointmentId);
    } else {
        uni.showToast({ title: '参数错误', icon: 'none' });
        setTimeout(() => uni.navigateBack(), 1500);
    }
});

const submit = async () => {
    if (formData.rating === 0) {
        uni.showToast({ title: '请至少点亮一颗星星', icon: 'none' });
        return;
    }

    try {
        uni.showLoading({ title: '提交中...', mask: true });
        const res = await submitAppointmentReview(formData);

        if (res.code === 200) {
            uni.showToast({ title: '评价成功', icon: 'success' });
            // 延迟返回，返回后触发上一页(record.vue)的 onShow 刷新状态
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        } else {
            uni.showToast({ title: res.msg || '提交失败', icon: 'none' });
        }
    } catch (error) {
        console.error('评价提交异常:', error);
        uni.showToast({ title: '网络异常，请重试', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};
</script>

<style lang="scss" scoped>
.review-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding: 30rpx;
}

.review-card,
.feedback-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
}

.review-card {
    text-align: center;

    .title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 16rpx;
    }

    .subtitle {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 50rpx;
    }

    .star-group {
        display: flex;
        justify-content: center;
        gap: 30rpx;
        margin-bottom: 24rpx;

        .star-item {
            width: 80rpx;
            height: 80rpx;
            display: flex;
            justify-content: center;
            align-items: center;

            .star-icon {
                font-size: 70rpx;
                /* 默认灰色的星星 */
                color: #e4e7ed;
                transition: color 0.3s, transform 0.1s;
                display: inline-block;
                line-height: 1;

                /* 激活状态：变成橙黄色，并加一点点放大效果，手感更好 */
                &.active {
                    color: #ff9800;
                    transform: scale(1.1);
                }
            }
        }
    }

    .rating-text {
        font-size: 28rpx;
        color: #ff9800;
        font-weight: bold;
        height: 40rpx;
    }
}

.feedback-card {
    .card-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 24rpx;
    }

    .feedback-input {
        width: 100%;
        height: 240rpx;
        background-color: #f9f9f9;
        padding: 24rpx;
        border-radius: 12rpx;
        font-size: 28rpx;
        box-sizing: border-box;
    }

    .word-count {
        text-align: right;
        font-size: 24rpx;
        color: #ccc;
        margin-top: 16rpx;
    }
}

.submit-btn {
    background-color: #007aff;
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: bold;
    height: 88rpx;
    line-height: 88rpx;
    margin-top: 60rpx;

    &.disabled {
        background-color: #a0cfff;
    }

    &::after {
        border: none;
    }
}
</style>