<template>
    <view class="booking-container">
        <!-- 教练信息 -->
        <view class="coach-header">
            <view class="left">
                <text class="name">预约：张教练</text>
                <text class="sub">请选择练习时段和内容</text>
            </view>
        </view>

        <!-- 日期选择 (横向滚动) -->
        <scroll-view scroll-x class="date-scroll" :show-scrollbar="false">
            <view class="date-wrapper">
                <view v-for="(day, index) in days" :key="index" class="date-card"
                    :class="{ active: selectedDate === day.fullDate }" @click="selectedDate = day.fullDate">
                    <text class="week">{{ day.week }}</text>
                    <text class="day">{{ day.day }}</text>
                    <view v-if="day.fullDate === selectedDate" class="dot"></view>
                </view>
            </view>
        </scroll-view>

        <!-- 时段网格 -->
        <view class="time-section">
            <view class="section-title">选择时段 ({{ selectedDate }})</view>
            <view class="time-grid">
                <view v-for="slot in timeSlots" :key="slot.id" class="time-box" :class="{
                    disabled: slot.remaining <= 0,
                    active: selectedSlotId === slot.id
                }" @click="selectSlot(slot)">
                    <text class="time-range">{{ slot.start }}-{{ slot.end }}</text>
                    <text class="status-text">
                        {{ slot.remaining > 0 ? `余${slot.remaining}` : '满员' }}
                    </text>
                </view>
            </view>
        </view>

        <!-- 练习内容设置 -->
        <view class="content-section" v-if="selectedSlotId">
            <view class="section-title">练习内容</view>
            <view class="tags-row">
                <view v-for="item in contentOptions" :key="item" class="tag-item"
                    :class="{ active: selectedContents.includes(item) }" @click="toggleContent(item)">
                    {{ item }}
                </view>
            </view>
            <textarea class="remark-input" placeholder="给教练留言（选填）" v-model="remark" />
        </view>

        <!-- 底部确认条 -->
        <view class="bottom-bar">
            <view class="info">
                <text v-if="!selectedSlotId" class="tip">请选择时段</text>
                <view v-else>
                    <text class="selected-time">{{ getSelectedTimeStr() }}</text>
                    <text class="count">已选 {{ selectedContents.length }} 项内容</text>
                </view>
            </view>
            <button class="confirm-btn" :disabled="!selectedSlotId" @click="submitBooking">立即预约</button>
        </view>
    </view>
        <!-- 自定义 TabBar -->
        <tabbar />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Tabbar from "@/components/tabbar/index.vue";
// 模拟日历数据
const days = ref([]);
const selectedDate = ref('');
const selectedSlotId = ref(null);
const selectedContents = ref([]);
const remark = ref('');

// 模拟时段数据
const timeSlots = ref([
    { id: 1, start: '08:00', end: '10:00', remaining: 0 },
    { id: 2, start: '10:00', end: '12:00', remaining: 2 },
    { id: 3, start: '14:00', end: '16:00', remaining: 3 },
    { id: 4, start: '16:00', end: '18:00', remaining: 1 },
]);

const contentOptions = ['倒车入库', '侧方停车', '坡道定点', '直角转弯', 'S弯行驶', '模拟考试'];

onMounted(() => {
    // 生成未来7天
    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = `${d.getMonth() + 1}-${d.getDate()}`; // 简单格式化
        days.value.push({
            week: i === 0 ? '今天' : '周' + weekMap[d.getDay()],
            day: dateStr,
            fullDate: dateStr
        });
    }
    selectedDate.value = days.value[0].fullDate;
});

const selectSlot = (slot) => {
    if (slot.remaining <= 0) return;
    selectedSlotId.value = slot.id;
};

const toggleContent = (item) => {
    const idx = selectedContents.value.indexOf(item);
    if (idx > -1) {
        selectedContents.value.splice(idx, 1);
    } else {
        selectedContents.value.push(item);
    }
};

const getSelectedTimeStr = () => {
    const slot = timeSlots.value.find(s => s.id === selectedSlotId.value);
    return slot ? `${selectedDate.value} ${slot.start}-${slot.end}` : '';
};

const submitBooking = () => {
    if (selectedContents.value.length === 0) {
        return uni.showToast({ title: '请至少选择一项练习内容', icon: 'none' });
    }

    uni.showModal({
        title: '确认预约',
        content: `您将预约 ${getSelectedTimeStr()} 的练车，请确认。`,
        success: (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '提交中' });
                setTimeout(() => {
                    uni.hideLoading();
                    uni.redirectTo({ url: '/pages/student/appoint-detail/appoint-detail?id=new_id' });
                }, 1000);
            }
        }
    });
};
</script>

<style scoped lang="scss">
.booking-container {
    padding-bottom: 120rpx;
    background: #fff;
    min-height: 100vh;
}

.coach-header {
    padding: 30rpx;
    background: #f8f8f8;

    .name {
        font-size: 34rpx;
        font-weight: bold;
        display: block;
    }

    .sub {
        font-size: 24rpx;
        color: #666;
    }
}

.date-scroll {
    white-space: nowrap;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;

    .date-wrapper {
        padding: 0 20rpx;
        display: flex;
    }

    .date-card {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 120rpx;
        height: 120rpx;
        background: #f5f7fa;
        border-radius: 16rpx;
        margin-right: 20rpx;
        transition: all 0.3s;

        .week {
            font-size: 24rpx;
            color: #666;
            margin-bottom: 8rpx;
        }

        .day {
            font-size: 30rpx;
            font-weight: bold;
        }

        &.active {
            background: #2979ff;
            color: #fff;
            box-shadow: 0 4rpx 10rpx rgba(41, 121, 255, 0.3);

            .week {
                color: rgba(255, 255, 255, 0.8);
            }

            .dot {
                width: 8rpx;
                height: 8rpx;
                background: #fff;
                border-radius: 50%;
                margin-top: 6rpx;
            }
        }
    }
}

.time-section,
.content-section {
    padding: 30rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
    border-left: 6rpx solid #2979ff;
    padding-left: 16rpx;
}

.time-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .time-box {
        border: 2rpx solid #eee;
        border-radius: 12rpx;
        padding: 24rpx;
        text-align: center;

        .time-range {
            display: block;
            font-size: 30rpx;
            font-weight: 500;
            margin-bottom: 8rpx;
        }

        .status-text {
            font-size: 24rpx;
            color: #2979ff;
        }

        &.disabled {
            background: #f5f5f5;
            color: #ccc;
            border-color: #f5f5f5;

            .status-text {
                color: #ccc;
            }
        }

        &.active {
            border-color: #2979ff;
            background: #eef5ff;

            .status-text {
                font-weight: bold;
            }
        }
    }
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 30rpx;

    .tag-item {
        padding: 12rpx 30rpx;
        background: #f5f7fa;
        border-radius: 30rpx;
        font-size: 26rpx;
        color: #333;

        &.active {
            background: #2979ff;
            color: #fff;
        }
    }
}

.remark-input {
    width: 100%;
    height: 160rpx;
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;

    .info {
        .tip {
            color: #999;
            font-size: 28rpx;
        }

        .selected-time {
            display: block;
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
        }

        .count {
            font-size: 24rpx;
            color: #666;
        }
    }

    .confirm-btn {
        margin: 0;
        background: #2979ff;
        color: #fff;
        font-size: 30rpx;
        border-radius: 40rpx;
        padding: 0 60rpx;

        &[disabled] {
            background: #ccc;
            color: #fff;
        }
    }
}
</style>