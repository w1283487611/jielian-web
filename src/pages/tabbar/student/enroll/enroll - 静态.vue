<template>
    <view class="enroll-container">

        <view class="custom-header">
            <view class="location" @click="chooseCity">
                <!-- <text class="city-name">{{ currentCity }}</text> -->
                <!-- <text class="city-name">{{ locationStore.currentCity }}</text> -->
                <text class="city-name">{{ locationStore.currentCity || '定位中...' }}</text>
                <text class="iconfont icon-caret-down"></text>
            </view>
            <view class="search-box" @click="goToSearch">
                <text class="iconfont icon-search"></text>
                <text class="placeholder">搜索心仪的驾校</text>
            </view>
            <view class="msg-icon">
                <text class="iconfont icon-message"></text>
            </view>
        </view>

        <view class="grid-nav">
            <view class="grid-item" @click="goToRank('school')">
                <view class="icon-wrap bg-blue">
                    <text class="iconfont icon-trophy-fill"></text>
                </view>
                <text class="text">驾校排行</text>
            </view>
            <view class="grid-item" @click="goToRank('coach')">
                <view class="icon-wrap bg-orange">
                    <text class="iconfont icon-user-tie"></text>
                </view>
                <text class="text">教练排行</text>
            </view>
            <view class="grid-item" @click="goToNearby('school')">
                <view class="icon-wrap bg-green">
                    <text class="iconfont icon-map-marker"></text>
                </view>
                <text class="text">附近驾校</text>
            </view>
            <view class="grid-item" @click="goToNearby('coach')">
                <view class="icon-wrap bg-purple">
                    <text class="iconfont icon-compass"></text>
                </view>
                <text class="text">附近教练</text>
            </view>
        </view>

        <view class="help-banner">
            <view class="banner-left">
                <text class="iconfont icon-robot"></text>
                <view class="text-group">
                    <text class="title">你想找什么样的驾校？</text>
                    <text class="sub">练车近 · 价格低 · 口碑好 · 合格率高</text>
                </view>
            </view>
            <button class="help-btn">帮我找</button>
        </view>

        <view class="sticky-filter">
            <view class="filter-tabs">
                <view class="tab" :class="{ 'active': queryParams.orderBy === 'default' }"
                    @click="switchSort('default')">综合</view>
                <view class="tab" :class="{ 'active': queryParams.orderBy === 'distance' }"
                    @click="switchSort('distance')">距离</view>
                <view class="tab" :class="{ 'active': queryParams.orderBy === 'price' }" @click="switchSort('price')">价格
                </view>
                <view class="tab" :class="{ 'active': queryParams.orderBy === 'rating' }" @click="switchSort('rating')">
                    口碑</view>

                <view class="filter-btn" @click="openFilter">
                    <text>筛选</text>
                    <text class="iconfont icon-filter"></text>
                </view>
            </view>

            <view class="quick-tags" v-if="activeTags.length > 0">
                <view class="tag-item" v-for="(tag, index) in activeTags" :key="index">
                    {{ tag }} <text class="iconfont icon-close" @click="removeTag(index)"></text>
                </view>
                <view class="clear-all" @click="clearAllTags">
                    <text class="iconfont icon-delete"></text> 清除
                </view>
            </view>
        </view>

        <view class="school-list">
            <view class="school-card" v-for="school in schoolList" :key="school.id"
                @click="goToSchoolDetail(school.id)">

                <view class="cover-img-wrap">
                    <image class="cover-img" :src="handleAvatar(school.coverImage)" mode="aspectFill"></image>
                    <view class="play-icon" v-if="school.hasVideo">
                        <text class="iconfont icon-play"></text>
                    </view>
                </view>

                <view class="info-wrap">
                    <view class="title-row">
                        <text class="name">{{ school.name }}</text>
                        <view class="crown-tag" v-if="school.isPremium">
                            <text class="iconfont icon-crown"></text> 黄金
                        </view>
                    </view>

                    <view class="rating-row">
                        <view class="stars">
                            <text class="iconfont icon-star-fill active" v-for="i in Math.floor(school.rating)"
                                :key="i"></text>
                        </view>
                        <text class="score">{{ school.rating }}</text>
                        <text class="reviews">{{ school.reviewCount }}条评价</text>
                    </view>

                    <view class="price-row">
                        <view class="price-box">
                            <text class="num">{{ school.minPrice }}</text>
                            <text class="unit">元起</text>
                            <text class="license">C1 小车</text>
                        </view>
                        <view class="location-box">
                            <text class="district">{{ school.district }}</text>
                            <text class="distance">{{ school.distance }}km</text>
                        </view>
                    </view>

                    <view class="tags-row">
                        <text class="tag rank-tag" v-if="school.rank">综合排行榜 第{{ school.rank }}名</text>
                        <text class="tag normal-tag" v-for="(tag, idx) in school.tags" :key="idx">{{ tag }}</text>
                    </view>
                </view>

                <view class="phone-btn" @click.stop="makePhoneCall(school.phone)">
                    <text class="iconfont icon-phone"></text>
                </view>
            </view>

            <view class="load-more">
                <text v-if="loading">加载中...</text>
                <text v-else>到底了~</text>
            </view>
        </view>

        <view class="filter-mask" v-if="showFilter" @click="closeFilter"></view>

        <view class="filter-drawer" :class="{ 'show': showFilter }">
            <scroll-view scroll-y class="drawer-content">

                <view class="filter-group">
                    <view class="group-title">驾照类型</view>
                    <view class="options-box">
                        <view class="option-btn" v-for="lic in licenseOptions" :key="lic.id"
                            :class="{ 'active': filterState.licenseId === lic.id }"
                            @click="filterState.licenseId = lic.id">
                            {{ lic.name }}
                        </view>
                    </view>
                </view>

                <view class="filter-group">
                    <view class="group-title">
                        <!-- 所属区域 <text class="sub-title">({{ currentCity }})</text> -->
                        所属区域 <text class="sub-title">({{ locationStore.currentCity }})</text>
                    </view>
                    <view class="options-box">
                        <view class="option-btn" v-for="dist in districtOptions" :key="dist"
                            :class="{ 'active': filterState.district === dist }" @click="filterState.district = dist">
                            {{ dist }}
                        </view>
                    </view>
                </view>

            </scroll-view>

            <view class="drawer-footer">
                <button class="reset-btn" @click="resetFilter">重置</button>
                <button class="confirm-btn" @click="confirmFilter">确定</button>
            </view>
        </view>

        <view class="tabbar-spacer"></view>
        <Tabbar />
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import Tabbar from "@/components/tabbar/index.vue";
import { handleAvatar } from '@/utils/common';
import { useLocationStore } from '@/store/modules/location';

const locationStore = useLocationStore();
// const currentCity = ref('未知');
const loading = ref(false);
// --- 筛选抽屉状态与数据 ---
const showFilter = ref(false);

// 后端字典或写死的配置数据
const licenseOptions = [
  { id: 1, name: 'C1 手动挡' },
  { id: 2, name: 'C2 自动挡' },
  { id: 3, name: 'D/E 摩托车' },
  { id: 4, name: 'B2 大货车' }
];

const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    orderBy: 'default',
    city: '', // 传给后端的城市参数
    lat: null, // 传给后端的纬度
    lng: null  // 传给后端的经度
});

// 根据 currentCity 动态获取的区县列表 (这里以莆田为例)
const districtOptions = ['荔城区', '城厢区', '涵江区', '秀屿区', '仙游县'];

// 抽屉内部的临时状态（用户点确定前，不影响外面的列表）
const filterState = reactive({
  licenseId: null,
  district: ''
});

// 外部展示的快捷标签
const activeTags = ref([]);

// 模拟驾校列表数据
const schoolList = ref([
    {
        id: 1,
        name: '大众驾校',
        coverImage: '/static/assets/images/mock-school1.jpg',
        isPremium: true,
        rating: 5.0,
        reviewCount: 92,
        minPrice: 2888,
        district: '荔城区',
        distance: 2.3,
        hasVideo: true,
        rank: 3,
        tags: ['1年会员', '服务热情'],
        phone: '13800000001'
    },
    {
        id: 2,
        name: '九华驾校体育中心分校',
        coverImage: '/static/assets/images/mock-school2.jpg',
        isPremium: true,
        rating: 5.0,
        reviewCount: 306,
        minPrice: 3200,
        district: '城厢区',
        distance: 2.4,
        hasVideo: false,
        rank: null,
        tags: ['3年会员', '服务热情', '有接送'],
        phone: '13800000002'
    },
    {
        id: 3,
        name: '涵江大地驾校',
        coverImage: '/static/assets/images/mock-school3.jpg',
        isPremium: false,
        rating: 5.0,
        reviewCount: 14,
        minPrice: 3300,
        district: '荔城区',
        distance: 2.6,
        hasVideo: false,
        rank: null,
        tags: ['环境好', '场地大'],
        phone: '13800000003'
    }
]);


// 模拟网络请求 (真实开发需传 queryParams 给后端)
const fetchSchools = (reset = false) => {
  loading.value = true;
  // 同步当前最新的定位参数给查询条件
  queryParams.city = locationStore.currentCity;
  queryParams.lat = locationStore.latitude;
  queryParams.lng = locationStore.longitude;
  
  setTimeout(() => {
    // TODO: 调用 getEnrollSchoolList(queryParams)
    loading.value = false;
    uni.stopPullDownRefresh();
  }, 800);
};

// 页面加载时自动获取一次定位
onMounted(() => {
  if (!locationStore.latitude) {
    locationStore.fetchLocation();
  }
});

onShow(() => { fetchSchools(true); });
onPullDownRefresh(() => { fetchSchools(true); });
onReachBottom(() => { fetchSchools(false); });

// 交互事件
const switchSort = (type) => {
    queryParams.orderBy = type;
    fetchSchools(true);
};

// --- 抽屉操作方法 ---
const openFilter = () => { 
  showFilter.value = true; 
};

const closeFilter = () => { 
  showFilter.value = false; 
};

const resetFilter = () => {
  filterState.licenseId = null;
  filterState.district = '';
};

// 点击确定：把筛选条件同步给 queryParams，并生成顶部快捷标签
const confirmFilter = () => {
  // 1. 同步参数供后端查询
  queryParams.licenseId = filterState.licenseId;
  queryParams.district = filterState.district;
  
  // 2. 生成顶部展示标签
  const tags = [];
  if (filterState.licenseId) {
    const lic = licenseOptions.find(item => item.id === filterState.licenseId);
    if (lic) tags.push(lic.name);
  }
  if (filterState.district) {
    tags.push(filterState.district);
  }
  activeTags.value = tags;

  // 3. 关闭抽屉并重新拉取数据
  closeFilter();
  fetchSchools(true);
};

// 重写之前的 removeTag 方法：不仅要删标签，还要清空对应的查询参数
const removeTag = (index) => {
  const removedTag = activeTags.value[index];
  activeTags.value.splice(index, 1);
  
  // 反向清除查询参数和抽屉状态
  if (districtOptions.includes(removedTag)) {
    queryParams.district = '';
    filterState.district = '';
  } else {
    queryParams.licenseId = null;
    filterState.licenseId = null;
  }
  
  fetchSchools(true);
};

// 点击清空所有标签
const clearAllTags = () => {
  activeTags.value = [];
  resetFilter();
  confirmFilter(); // 触发重置并查询
};

const makePhoneCall = (phone) => {
    uni.makePhoneCall({ phoneNumber: phone });
};

const goToSchoolDetail = (id) => {
    uni.navigateTo({ url: `/pages/student/school-detail/school-detail?id=${id}` });
};

const goToSearch = () => { uni.showToast({ title: '去搜索页', icon: 'none' }); };
// 点击城市名称，跳转到我们手写的 A-Z 城市选择页
const chooseCity = () => { 
  uni.navigateTo({ url: '/pages/common/city-picker/city-picker' }); 
};
// 去对应排行或附近列表
const goToRank = (type) => { uni.showToast({ title: `${type === 'school' ? '驾校' : '教练'}排行榜`, icon: 'none' }); };
const goToNearby = (type) => {
    if (type === 'coach') {
        // 🔥 完美复用我们上一节写的教练发现大厅！
        uni.navigateTo({ url: '/pages/student/coach-list/coach-list' });
    } else {
        uni.showToast({ title: '附近驾校列表', icon: 'none' });
    }
};

// 预留的测试原生位置选择器的方法 (未来在添加收获地址、练车点打卡时可用)
const testNativeLocationPicker = () => {
  uni.chooseLocation({
    success: (res) => {
      console.log('用户选择了位置：', res.name, res.address, res.latitude, res.longitude);
      // locationStore.setLocation(res.latitude, res.longitude);
    }
  });
};
</script>

<style lang="scss" scoped>
.enroll-container {
    min-height: 100vh;
    background-color: #fff;
    /* 列表页背景全白更干净 */
}

/* 1. 顶部搜索栏 */
.custom-header {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    padding-top: calc(20rpx + env(safe-area-inset-top));
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 100;

    .location {
        display: flex;
        align-items: center;
        margin-right: 20rpx;

        .city-name {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
        }

        .icon-caret-down {
            font-size: 24rpx;
            color: #333;
            margin-left: 4rpx;
        }
    }

    .search-box {
        flex: 1;
        display: flex;
        align-items: center;
        background-color: #f5f7fa;
        height: 68rpx;
        border-radius: 34rpx;
        padding: 0 24rpx;

        .icon-search {
            color: #999;
            font-size: 32rpx;
            margin-right: 12rpx;
        }

        .placeholder {
            font-size: 26rpx;
            color: #999;
        }
    }

    .msg-icon {
        margin-left: 30rpx;

        .icon-message {
            font-size: 44rpx;
            color: #333;
        }
    }
}

/* 2. 四宫格 */
.grid-nav {
    display: flex;
    justify-content: space-around;
    padding: 30rpx 20rpx;

    .grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .icon-wrap {
            width: 90rpx;
            height: 90rpx;
            border-radius: 40%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 16rpx;

            .iconfont {
                font-size: 44rpx;
                color: #fff;
            }

            &.bg-blue {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            &.bg-orange {
                background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
            }

            &.bg-green {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }

            &.bg-purple {
                background: linear-gradient(135deg, #c471f5 0%, #fa71cd 100%);
            }
        }

        .text {
            font-size: 26rpx;
            color: #333;
            font-weight: 500;
        }
    }
}

/* 3. Banner */
.help-banner {
    margin: 0 30rpx 30rpx;
    padding: 24rpx 30rpx;
    background: linear-gradient(to right, #e6f2ff, #f0f7ff);
    border-radius: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .banner-left {
        display: flex;
        align-items: center;

        .icon-robot {
            font-size: 60rpx;
            color: #007aff;
            margin-right: 20rpx;
        }

        .text-group {
            display: flex;
            flex-direction: column;

            .title {
                font-size: 30rpx;
                font-weight: bold;
                color: #333;
                margin-bottom: 6rpx;
            }

            .sub {
                font-size: 22rpx;
                color: #666;
            }
        }
    }

    .help-btn {
        margin: 0;
        background-color: #007aff;
        color: #fff;
        font-size: 26rpx;
        height: 56rpx;
        line-height: 56rpx;
        border-radius: 28rpx;
        padding: 0 30rpx;

        &::after {
            border: none;
        }
    }
}

/* 4. 吸顶过滤栏 */
.sticky-filter {
    position: sticky;
    top: calc(100rpx + env(safe-area-inset-top));
    z-index: 99;
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-bottom: 2rpx solid #f9f9f9;

    .filter-tabs {
        display: flex;
        align-items: center;

        .tab {
            margin-right: 40rpx;
            font-size: 30rpx;
            color: #666;
            transition: all 0.2s;

            &.active {
                color: #007aff;
                font-weight: bold;
            }
        }

        .filter-btn {
            margin-left: auto;
            font-size: 26rpx;
            color: #007aff;
            display: flex;
            align-items: center;

            .icon-filter {
                font-size: 24rpx;
                margin-left: 6rpx;
            }
        }
    }

    .quick-tags {
        display: flex;
        align-items: center;
        margin-top: 20rpx;

        .tag-item {
            background-color: #f5f7fa;
            color: #666;
            font-size: 22rpx;
            padding: 6rpx 20rpx;
            border-radius: 24rpx;
            margin-right: 16rpx;
            display: flex;
            align-items: center;

            .icon-close {
                font-size: 18rpx;
                margin-left: 8rpx;
                color: #999;
            }
        }

        .clear-all {
            margin-left: auto;
            font-size: 22rpx;
            color: #999;
            display: flex;
            align-items: center;

            .icon-delete {
                font-size: 24rpx;
                margin-right: 4rpx;
            }
        }
    }
}

/* 5. 驾校列表 */
.school-list {
    padding: 0 30rpx;

    .school-card {
        display: flex;
        padding: 30rpx 0;
        border-bottom: 2rpx solid #f5f7fa;
        position: relative;

        .cover-img-wrap {
            width: 220rpx;
            height: 160rpx;
            border-radius: 12rpx;
            overflow: hidden;
            position: relative;
            margin-right: 24rpx;

            .cover-img {
                width: 100%;
                height: 100%;
                background-color: #eee;
            }

            .play-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60rpx;
                height: 60rpx;
                background-color: rgba(0, 0, 0, 0.4);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;

                .icon-play {
                    color: #fff;
                    font-size: 30rpx;
                    margin-left: 6rpx;
                }
            }
        }

        .info-wrap {
            flex: 1;
            overflow: hidden;

            .title-row {
                display: flex;
                align-items: center;
                margin-bottom: 10rpx;

                .name {
                    font-size: 34rpx;
                    font-weight: bold;
                    color: #333;
                    margin-right: 12rpx;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 65%;
                }

                .crown-tag {
                    background: linear-gradient(to right, #f6d365, #fda085);
                    color: #fff;
                    font-size: 20rpx;
                    padding: 2rpx 10rpx;
                    border-radius: 6rpx;
                    display: flex;
                    align-items: center;

                    .icon-crown {
                        font-size: 22rpx;
                        margin-right: 4rpx;
                    }
                }
            }

            .rating-row {
                display: flex;
                align-items: center;
                font-size: 22rpx;
                color: #999;
                margin-bottom: 12rpx;

                .stars {
                    display: flex;
                    margin-right: 8rpx;

                    .icon-star-fill {
                        color: #ff9800;
                        font-size: 20rpx;
                        margin-right: 2rpx;
                    }
                }

                .score {
                    color: #ff9800;
                    font-weight: bold;
                    margin-right: 16rpx;
                    font-size: 24rpx;
                }
            }

            .price-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 12rpx;

                .price-box {
                    display: flex;
                    align-items: baseline;

                    .num {
                        color: #ff7a00;
                        font-size: 36rpx;
                        font-weight: bold;
                    }

                    .unit {
                        color: #ff7a00;
                        font-size: 22rpx;
                        margin: 0 12rpx 0 4rpx;
                    }

                    .license {
                        font-size: 24rpx;
                        color: #666;
                    }
                }

                .location-box {
                    font-size: 22rpx;
                    color: #999;

                    .district {
                        margin-right: 12rpx;
                    }
                }
            }

            .tags-row {
                display: flex;
                flex-wrap: wrap;
                gap: 12rpx;

                .tag {
                    font-size: 20rpx;
                    padding: 4rpx 10rpx;
                    border-radius: 4rpx;
                }

                .rank-tag {
                    color: #d48806;
                    background-color: #fffbe6;
                    border: 2rpx solid #ffe58f;
                }

                .normal-tag {
                    color: #007aff;
                    background-color: #e6f2ff;
                }
            }
        }

        .phone-btn {
            position: absolute;
            right: 0;
            top: 30rpx;
            width: 64rpx;
            height: 64rpx;
            background-color: #e6f2ff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;

            .icon-phone {
                color: #007aff;
                font-size: 32rpx;
            }
        }
    }

    .load-more {
        text-align: center;
        padding: 40rpx 0;
        font-size: 24rpx;
        color: #ccc;
    }
}

.tabbar-spacer {
    height: calc(120rpx + env(safe-area-inset-bottom));
    width: 100%;
}

/* ================= 侧拉筛选抽屉样式 ================= */
.filter-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.filter-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 600rpx; /* 抽屉宽度 */
  background-color: #fff;
  z-index: 1000;
  transform: translateX(100%); /* 默认藏在屏幕右侧外部 */
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  
  /* 激活时滑入 */
  &.show {
    transform: translateX(0);
  }

  /* 抽屉内部滚动区 */
  .drawer-content {
    flex: 1;
    height: 0;
    padding: calc(40rpx + env(safe-area-inset-top)) 30rpx 40rpx;
    box-sizing: border-box;
  }

  .filter-group {
    margin-bottom: 50rpx;

    .group-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 24rpx;

      .sub-title {
        font-size: 24rpx;
        color: #999;
        font-weight: normal;
        margin-left: 12rpx;
      }
    }

    .options-box {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .option-btn {
        width: calc((100% - 40rpx) / 3); /* 每行放3个，减去间距 */
        height: 64rpx;
        line-height: 64rpx;
        text-align: center;
        background-color: #f5f7fa;
        color: #333;
        font-size: 24rpx;
        border-radius: 8rpx;
        border: 2rpx solid transparent;
        transition: all 0.2s;
        box-sizing: border-box;

        /* 选中状态：主色调高亮 */
        &.active {
          background-color: #e6f2ff;
          color: #007aff;
          font-weight: bold;
          border-color: #007aff;
        }
      }
    }
  }

  /* 底部操作区 */
  .drawer-footer {
    display: flex;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    background-color: #fff;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
    gap: 30rpx;

    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 30rpx;
      border-radius: 40rpx;
      margin: 0;
      &::after { border: none; }
    }

    .reset-btn {
      background-color: #f5f7fa;
      color: #666;
    }

    .confirm-btn {
      background-color: #007aff;
      color: #fff;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
    }
  }
}
</style>