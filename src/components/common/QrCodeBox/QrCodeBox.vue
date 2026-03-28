<template>
    <view class="qrcode-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
        <canvas :id="canvasId" :canvas-id="canvasId" :style="{ width: size + 'px', height: size + 'px' }"></canvas>
    </view>
</template>

<script setup>
import { watch, nextTick, getCurrentInstance } from 'vue';
import UQRCode from 'uqrcodejs';

const props = defineProps({
    text: {
        type: String,
        required: true,
        default: ''
    },
    size: {
        type: Number,
        default: 180
    },
    canvasId: {
        type: String,
        default: 'default-qrcode-canvas'
    }
});

// 获取 Vue 3 组件实例，UniApp 画图在自定义组件中必须带上它
const instance = getCurrentInstance();

const makeQrCode = () => {
    if (!props.text) return;

    const qr = new UQRCode();
    qr.data = props.text;
    qr.size = props.size;
    qr.useDynamicSize = false;
    qr.make();

    // 核心避坑：自定义组件中必须传入 instance.proxy
    const ctx = uni.createCanvasContext(props.canvasId, instance?.proxy);
    qr.canvasContext = ctx;
    qr.drawCanvas();
};

// 监听 text 的变化，一旦有数据就开始画图
watch(
    () => props.text,
    (newVal) => {
        if (newVal) {
            nextTick(() => {
                makeQrCode();
            });
        }
    },
    { immediate: true } // 如果组件挂载时 text 就有值，立即触发
);
</script>

<style lang="scss" scoped>
.qrcode-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>