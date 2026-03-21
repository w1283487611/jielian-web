<template>
    <view class="filter-wrapper">
        <view class="search-box">
            <text class="iconfont icon-search"></text>
            <input class="search-input" v-model="query.keyword" placeholder="搜索驾校名称" @confirm="handleSearch" />
        </view>

        <view class="filter-actions">
            <picker mode="region" @change="onRegionChange" class="region-picker">
                <view class="picker-text">
                    <text class="iconfont icon-location"></text>
                    <text class="text-content">{{ regionText || '选择地区 (省/市/区)' }}</text>
                </view>
            </picker>

            <view class="sort-tabs">
                <text :class="{ active: query.sortBy === 'comprehensive' }"
                    @click="changeSort('comprehensive')">综合</text>
                <text :class="{ active: query.sortBy === 'distance' }" @click="changeSort('distance')">距离</text>
                <text :class="{ active: query.sortBy === 'rating' }" @click="changeSort('rating')">好评</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['change']);

const regionText = ref('');

// 组件内部维护的查询状态
const query = reactive({
    keyword: '',
    sortBy: 'comprehensive',
    provinceName: '',
    cityName: '',
    districtName: ''
});

// 触发传递给父组件
const triggerChange = () => {
    // 深拷贝一份数据传给父组件，防止父组件意外修改内部状态
    emit('change', { ...query });
};

const handleSearch = () => {
    triggerChange();
};

const onRegionChange = (e) => {
    const values = e.detail.value;
    regionText.value = values.join('/');
    query.provinceName = values[0];
    query.cityName = values[1];
    query.districtName = values[2];
    triggerChange();
};

const changeSort = (type) => {
    if (query.sortBy !== type) {
        query.sortBy = type;
        triggerChange();
    }
};
</script>

<style lang="scss" scoped>
.filter-wrapper {
    background-color: #f5f7fa;
    padding-bottom: 20rpx;
}

.search-box {
    background-color: #fff;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    padding: 10rpx 30rpx;
    margin-bottom: 20rpx;

    .icon-search {
        color: #999;
        margin-right: 10rpx;
    }

    .search-input {
        flex: 1;
        font-size: 26rpx;
        height: 60rpx;
    }
}

.filter-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.region-picker {
    background-color: #fff;
    padding: 12rpx 20rpx;
    border-radius: 30rpx;

    .picker-text {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #333;

        .icon-location {
            color: #007aff;
            margin-right: 6rpx;
        }

        .text-content {
            max-width: 200rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.sort-tabs {
  display: flex;
  gap: 30rpx;
  font-size: 26rpx;
  color: #666;
  .active { color: #007aff; font-weight: bold; }
}
</style>