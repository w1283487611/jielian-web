<template>
    <view class="discovery-container">

        <view class="search-header">
            <view class="search-box">
                <text class="iconfont icon-search"></text>
                <input class="search-input" v-model="queryParams.keyword" placeholder="搜索教练姓名/标签" confirm-type="search"
                    @confirm="handleSearch" />
                <text class="iconfont icon-close-circle clear-icon" v-if="queryParams.keyword"
                    @click="clearSearch"></text>
            </view>
        </view>

        <view class="context-title" v-if="pageTitle">
            <text class="title">{{ pageTitle }}</text>
            <text class="sub-title">{{ pageSubTitle }}</text>
        </view>

        <view class="filter-bar">
            <view class="filter-item" :class="{ 'active': queryParams.orderBy === 'default' }"
                @click="switchSort('default')">综合推荐</view>
            <view class="filter-item" :class="{ 'active': queryParams.orderBy === 'rating' }"
                @click="switchSort('rating')">评分最高</view>
            <view class="filter-item" :class="{ 'active': queryParams.orderBy === 'hot' }" @click="switchSort('hot')">
                人气最旺</view>
            <view class="filter-item" :class="{ 'active': queryParams.orderBy === 'experience' }"
                @click="switchSort('experience')">教龄最长</view>
        </view>

        <scroll-view class="list-scroll" scroll-y @scrolltolower="loadMore">
            <view class="coach-list" v-if="coachList.length > 0">
                <view class="coach-card" v-for="coach in coachList" :key="coach.id" @click="goToCoachDetail(coach.id)">

                    <view class="card-left">
                        <image class="avatar" :src="handleAvatar(coach.avatar)" mode="aspectFill"></image>
                        <view class="tag-badge" v-if="coach.canBeHired">私教</view>
                    </view>

                    <view class="card-right">
                        <view class="name-line">
                            <text class="name">{{ coach.name }}</text>
                            <text class="score">⭐ {{ coach.rating }}</text>
                        </view>

                        <view class="desc-line">
                            <text class="exp">教龄 {{ coach.teachingYears }} 年</text>
                            <text class="divider">|</text>
                            <text class="students">累计带教 {{ coach.totalStudents || 0 }} 人</text>
                        </view>

                        <view class="tags-line">
                            <text class="tag" v-for="(tag, idx) in (coach.tags || ['耐心细致', '通过率高'])" :key="idx">{{ tag
                                }}</text>
                        </view>
                    </view>

                    <view class="action-zone">
                        <button class="action-btn" @click.stop="handleAction(coach)">
                            {{ actionBtnText }}
                        </button>
                    </view>
                </view>

                <view class="load-more">
                    <text v-if="loading">加载中...</text>
                    <text v-else-if="isNoMore">没有更多教练了</text>
                    <text v-else>上拉加载更多</text>
                </view>
            </view>

            <view class="empty-state" v-if="coachList.length === 0 && !loading">
                <!-- <image class="empty-img" src="/static/assets/images/empty-search.png" mode="aspectFit"></image> -->
                <text class="empty-text">未找到符合条件的教练</text>
                <button class="reset-btn" v-if="queryParams.keyword" @click="clearSearch">清空搜索条件</button>
            </view>
        </scroll-view>

    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { handleAvatar } from '@/utils/common';
import { getDiscoveryCoachList } from '@/api/student/coach'; 

// --- 页面核心配置与参数 ---
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    orderBy: 'default', // default, rating, hot, experience
    schoolId: null,
    isIndependent: null
});

// 列表与分页状态
const coachList = ref([]);
const total = ref(0);
const loading = ref(false);
const isNoMore = computed(() => coachList.value.length >= total.value && total.value > 0);

// --- 动态场景计算 ---
// 计算页面标题
const pageTitle = computed(() => {
    if (queryParams.schoolId) return '本校教练';
    if (queryParams.isIndependent) return '严选独立私教';
    return '';
});

const pageSubTitle = computed(() => {
    if (queryParams.schoolId) return '选择一位导师，开启您的学车之旅';
    if (queryParams.isIndependent) return '平台认证 · 自由支配 · 专属服务';
    return '';
});

// 计算按钮文案 (如果是为了入校绑定主教练，显示"绑定"；如果是私教推荐，显示"预约")
const actionBtnText = computed(() => {
    if (queryParams.schoolId) return '选TA为主教练';
    return '查看主页';
});

// --- 初始化拦截 ---
onLoad((options) => {
    // 根据上个页面传来的参数，自动锁定页面的“领域模式”
    if (options.schoolId) queryParams.schoolId = Number(options.schoolId);
    if (options.isIndependent) queryParams.isIndependent = Number(options.isIndependent);

    // 如果有特殊的页面标题诉求，动态设置导航栏标题
    const navTitle = options.schoolId ? '选择主教练' : (options.isIndependent ? '私教大厅' : '找教练');
    uni.setNavigationBarTitle({ title: navTitle });

    fetchData(true);
});

// --- 核心拉取逻辑 ---
const fetchData = async (reset = false) => {
    if (reset) {
        queryParams.pageNum = 1;
        coachList.value = [];
    }

    if (loading.value || (isNoMore.value && !reset)) return;
    loading.value = true;

    try {
        // 调用后端的动态查询接口
        const res = await getDiscoveryCoachList(queryParams);
        if (res.code === 200) {
            coachList.value = reset ? res.rows : [...coachList.value, ...res.rows];
            total.value = res.total;
        }
    } catch (error) {
        console.error('获取教练列表异常:', error);
    } finally {
        loading.value = false;
    }
};

// --- 交互事件 ---
const handleSearch = () => { fetchData(true); };

const clearSearch = () => {
    queryParams.keyword = '';
    fetchData(true);
};

const switchSort = (type) => {
    if (queryParams.orderBy === type) return;
    queryParams.orderBy = type;
    fetchData(true);
};

const loadMore = () => { fetchData(false); };

// 点击卡片：去教练详情页 (在详情页里可以看评价、排班)
const goToCoachDetail = (coachId) => {
    uni.navigateTo({ url: `/pages/student/coach-detail/coach-detail?id=${coachId}` });
};

// 按钮动作分发
const handleAction = (coach) => {
    if (queryParams.schoolId) {
        // 模式 A：绑定驾校教练逻辑
        uni.showModal({
            title: '绑定主教练',
            content: `确定选择 ${coach.name} 作为您的专属主教练吗？`,
            success: (res) => {
                if (res.confirm) {
                    // TODO: 调用绑定接口
                    uni.showToast({ title: '绑定成功！', icon: 'success' });
                    setTimeout(() => uni.switchTab({ url: '/pages/tabbar/student/index/index' }), 1000);
                }
            }
        });
    } else {
        // 模式 B：普通大厅模式，去详情页或直接去排班
        goToCoachDetail(coach.id);
    }
};
</script>

<style lang="scss" scoped>
.discovery-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
}

/* 1. 顶部搜索 */
.search-header {
    background-color: #fff;
    padding: 20rpx 30rpx;
    position: sticky;
    top: 0;
    z-index: 100;

    .search-box {
        display: flex;
        align-items: center;
        background-color: #f5f7fa;
        border-radius: 36rpx;
        padding: 0 30rpx;
        height: 72rpx;

        .icon-search {
            font-size: 32rpx;
            color: #999;
            margin-right: 16rpx;
        }

        .search-input {
            flex: 1;
            font-size: 28rpx;
            color: #333;
            height: 100%;
        }

        .clear-icon {
            font-size: 36rpx;
            color: #ccc;
            padding: 10rpx;
            margin-right: -10rpx;
        }
    }
}

/* 2. 场景标题 */
.context-title {
    padding: 30rpx 30rpx 10rpx;
    background-color: #fff;

    .title {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
    }

    .sub-title {
        font-size: 26rpx;
        color: #666;
    }
}

/* 3. 吸顶过滤栏 */
.filter-bar {
    display: flex;
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    position: sticky;
    top: 112rpx;
    /* search-box height + padding */
    z-index: 99;

    .filter-item {
        flex: 1;
        text-align: center;
        font-size: 28rpx;
        color: #666;
        transition: all 0.2s;
        position: relative;

        &.active {
            color: #007aff;
            font-weight: bold;

            &::after {
                content: '';
                position: absolute;
                bottom: -20rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 30rpx;
                height: 6rpx;
                background-color: #007aff;
                border-radius: 4rpx;
            }
        }
    }
}

/* 4. 列表滚动区 */
.list-scroll {
    flex: 1;
    height: 0;
    /* 让 flex 子元素可以正常内部滚动 */
}

.coach-list {
    padding: 30rpx;

    .coach-card {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 30rpx;
        margin-bottom: 24rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: center;

        .card-left {
            position: relative;
            margin-right: 24rpx;

            .avatar {
                width: 120rpx;
                height: 120rpx;
                border-radius: 16rpx;
                border: 2rpx solid #f0f0f0;
            }

            .tag-badge {
                position: absolute;
                bottom: -10rpx;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(to right, #ff9800, #f56c6c);
                color: #fff;
                font-size: 20rpx;
                padding: 2rpx 12rpx;
                border-radius: 20rpx;
                white-space: nowrap;
                border: 2rpx solid #fff;
                font-weight: bold;
            }
        }

        .card-right {
            flex: 1;

            .name-line {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8rpx;

                .name {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                }

                .score {
                    font-size: 26rpx;
                    color: #f56c6c;
                    font-weight: bold;
                }
            }

            .desc-line {
                font-size: 24rpx;
                color: #666;
                margin-bottom: 12rpx;

                .divider {
                    margin: 0 12rpx;
                    color: #eee;
                }
            }

            .tags-line {
                display: flex;
                flex-wrap: wrap;
                gap: 10rpx;

                .tag {
                    font-size: 20rpx;
                    color: #007aff;
                    background-color: #e6f2ff;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;
                }
            }
        }

        .action-zone {
            margin-left: 20rpx;

            .action-btn {
                background-color: #f0f7ff;
                color: #007aff;
                font-size: 24rpx;
                font-weight: bold;
                height: 60rpx;
                line-height: 60rpx;
                padding: 0 24rpx;
                border-radius: 30rpx;
                border: 2rpx solid #cce5ff;

                &::after {
                    border: none;
                }
            }
        }
    }

    .load-more {
        text-align: center;
        font-size: 24rpx;
        color: #999;
        padding: 30rpx 0;
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-img {
        width: 240rpx;
        height: 240rpx;
        opacity: 0.7;
        margin-bottom: 30rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 40rpx;
    }

    .reset-btn {
        width: 240rpx;
        height: 72rpx;
        line-height: 72rpx;
        border-radius: 36rpx;
        background-color: #f5f7fa;
        color: #666;
        font-size: 28rpx;
        border: 2rpx solid #ddd;

        &::after {
            border: none;
        }
    }
}
</style>