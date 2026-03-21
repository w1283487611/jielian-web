<template>
    <view class="filter-wrapper">
        <view class="search-box">
            <text class="iconfont icon-search"></text>
            <input class="search-input" v-model="query.keyword" placeholder="搜索教练姓名" @confirm="handleSearch" />
        </view>

        <scroll-view scroll-x class="tag-scroll">
            <view class="tag-list">
                <text v-for="tag in coachTags" :key="tag.value"
                    :class="['filter-tag', query.tag === tag.value ? 'active' : '']" @click="changeTag(tag.value)">{{
                    tag.label }}</text>
            </view>
        </scroll-view>

        <view class="sort-bar">
            <view class="sort-tabs">
                <text :class="{ active: query.sortBy === 'comprehensive' }"
                    @click="changeSort('comprehensive')">综合</text>
                <text :class="{ active: query.sortBy === 'experience' }" @click="changeSort('experience')">教龄优先</text>
                <text :class="{ active: query.sortBy === 'rating' }" @click="changeSort('rating')">评分最高</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['change']);

// 预设教练标签（后续可从数据字典 sys_dict_data 获取）
const coachTags = ref([
    { label: '全部', value: '' },
    { label: '脾气好', value: '脾气好' },
    { label: '通过率高', value: '通过率高' },
    { label: '严谨认真', value: '严谨认真' },
    { label: '不抽烟', value: '不抽烟' }
]);

const query = reactive({
    keyword: '',
    tag: '',
    sortBy: 'comprehensive'
});

const triggerChange = () => {
    emit('change', { ...query });
};

const handleSearch = () => {
    triggerChange();
};

const changeTag = (tagValue) => {
    if (query.tag !== tagValue) {
        query.tag = tagValue;
        triggerChange();
    }
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

.tag-scroll {
    white-space: nowrap;
    margin-bottom: 20rpx;

    .tag-list {
        display: inline-flex;
        padding: 4rpx 0;
    }

    .filter-tag {
        background-color: #eee;
        padding: 10rpx 24rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        margin-right: 20rpx;
        color: #666;

        &.active {
            background-color: #007aff;
            color: #fff;
        }
    }
}

.sort-bar {
    display: flex;
    justify-content: flex-end;
    /* 靠右对齐，留出空间给未来的其他操作 */
}

.sort-tabs {
  display: flex;
  gap: 30rpx;
  font-size: 26rpx;
  color: #666;
  .active { color: #007aff; font-weight: bold; } 
}
</style>