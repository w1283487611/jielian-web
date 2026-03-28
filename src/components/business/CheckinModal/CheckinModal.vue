<template>
    <view class="checkin-modal-mask" v-if="visible" @click="closeModal">
        <view class="checkin-modal-content" @click.stop>
            <view class="modal-header">
                <text class="title">练车签到码</text>
                <text class="iconfont icon-close close-btn" @click="closeModal">x</text>
            </view>

            <view class="modal-body">
                <text class="tips">请在上车前向教练出示此码</text>

                <view class="qrcode-box">
                    <QrCodeBox v-if="visible && appointmentNo" :text="qrPayload" :size="180"
                        :canvasId="`checkin-canvas-${appointmentNo}`" />
                </view>

                <view class="code-text-box">
                    <text class="label">数字核销码</text>
                    <text class="code-number">{{ digitalCode }}</text>
                </view>
            </view>

            <view class="modal-footer">
                <!-- <text class="warning-text">注：扫码确认后即开始计算学时，请确保已实际到达场地。</text> -->
                <text class="warning-text">注：扫码确认后即开始计算学时，请确保到达场地。</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from 'vue';
import QrCodeBox from '@/components/common/QrCodeBox/QrCodeBox.vue';

const props = defineProps({
    // 支持 v-model:visible 语法
    visible: {
        type: Boolean,
        default: false
    },
    appointmentNo: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:visible']);

// 自动提取后 6 位作为数字码
const digitalCode = computed(() => {
    if (!props.appointmentNo) return '------';
    return props.appointmentNo.substring(props.appointmentNo.length - 6);
});

// 自动生成给二维码的 JSON 载荷
const qrPayload = computed(() => {
    if (!props.appointmentNo) return '';
    return JSON.stringify({ type: 'checkin', no: props.appointmentNo });
});

// 关闭弹窗
const closeModal = () => {
    emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
/* 把之前页面里的弹窗样式直接剪切到这里，完美做到样式隔离 */
.checkin-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.checkin-modal-content {
    width: 600rpx;
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(40rpx);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
    }

    .close-btn {
        font-size: 40rpx;
        color: #999;
        padding: 10rpx;
        margin: -10rpx;
    }

}

.modal-body {
    padding: 50rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tips {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 40rpx;
    }
}

.qrcode-box {
    width: 360rpx;
    height: 360rpx;
    padding: 20rpx;
    background-color: #f9f9f9;
    border-radius: 16rpx;
    border: 2rpx solid #eee;
    margin-bottom: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.code-text-box {
    text-align: center;

    .label {
        font-size: 24rpx;
        color: #999;
        display: block;
        margin-bottom: 10rpx;
    }

    .code-number {
        font-size: 56rpx;
        font-weight: bold;
        color: #007aff;
        letter-spacing: 8rpx;
    }
}

.modal-footer {
    background-color: #fff8e6;
    padding: 24rpx 30rpx;
    text-align: center;

    .warning-text {
        font-size: 22rpx;
        color: #ff9800;
        line-height: 1.5;
    }
}
</style>