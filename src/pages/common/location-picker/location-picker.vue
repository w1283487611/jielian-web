<template>
    <view class="location-picker-container">

        <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-left" @click="goBack">取消</view>
            <view class="nav-title">选择位置</view>
            <view class="nav-right">
                <text class="confirm-btn" :class="{ 'disabled': !selectedPoi }" @click="confirmLocation">确定</text>
            </view>
        </view>

        <view class="map-wrap">
            <map id="myMap" class="map" :latitude="mapState.latitude" :longitude="mapState.longitude" :scale="16"
                :markers="mapState.markers" show-location @regionchange="onRegionChange">
                <image class="center-marker" src="/static/assets/icons/marker-center.png"></image>
            </map>

            <view class="locate-me-btn" @click="moveToCurrentLocation">
                <text class="iconfont icon-crosshairs"></text>
            </view>
        </view>

        <view class="bottom-panel">
            <view class="search-box">
                <text class="iconfont icon-search"></text>
                <input class="search-input" v-model="searchKeyword" placeholder="输入位置" @confirm="searchLocation"
                    confirm-type="search" />
            </view>

            <scroll-view class="poi-list" scroll-y>
                <view class="poi-item" v-for="poi in poiList" :key="poi.id" @click="selectPoi(poi)">
                    <view class="poi-info">
                        <text class="poi-title" :class="{ 'active': selectedPoi?.id === poi.id }">{{ poi.title }}</text>
                        <text class="poi-address">{{ poi.address }}</text>
                    </view>

                    <text class="iconfont icon-check text-blue" v-if="selectedPoi?.id === poi.id"></text>
                </view>

                <view class="loading-tip" v-if="isLoading">加载周边位置...</view>
            </scroll-view>
        </view>

    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useLocationStore } from '@/store/modules/location';

const locationStore = useLocationStore();
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20;

const searchKeyword = ref('');
const isLoading = ref(false);
const selectedPoi = ref(null);

// 地图状态
const mapState = reactive({
    latitude: 25.454226, // 默认莆田纬度
    longitude: 119.007788, // 默认莆田经度
    markers: []
});

// 模拟百度地图/腾讯地图返回的周边 POI 数据
const poiList = ref([
    { id: '1', title: '莆田学院体育学院', address: '福建省莆田市城厢区学园中街809号', lat: 25.454226, lng: 119.007788 },
    { id: '2', title: '莆田学院(学园校区)中区-雄馨图书馆', address: '福建省莆田市城厢区龙桥街道学园中街1133号', lat: 25.456100, lng: 119.008200 },
    { id: '3', title: '凤达山庄-二期', address: '龙桥街道筱塘北街1136号', lat: 25.452100, lng: 119.005100 }
]);

onMounted(() => {
    // 1. 初始化，将地图中心移到当前定位
    if (locationStore.latitude && locationStore.longitude) {
        mapState.latitude = locationStore.latitude;
        mapState.longitude = locationStore.longitude;
    } else {
        moveToCurrentLocation();
    }
    // 默认选中第一个
    if (poiList.value.length > 0) {
        selectedPoi.value = poiList.value[0];
    }
});

const goBack = () => uni.navigateBack();

// 回到自身定位
const moveToCurrentLocation = () => {
    uni.getLocation({
        type: 'gcj02',
        success: (res) => {
            mapState.latitude = res.latitude;
            mapState.longitude = res.longitude;
            // 在这里调用百度地图 API 获取最新的周边 POI
            fetchPois(res.latitude, res.longitude);
        }
    });
};

// 拖动地图结束时触发
const onRegionChange = (e) => {
    if (e.type === 'end') {
        const mapCtx = uni.createMapContext('myMap');
        mapCtx.getCenterLocation({
            success: (res) => {
                // 拖动结束后，中心点变了，重新获取周边 POI
                fetchPois(res.latitude, res.longitude);
            }
        });
    }
};

const fetchPois = (lat, lng) => {
    isLoading.value = true;
    // TODO: 真实开发中，这里你需要调用百度地图的“逆地址解析 API”或“周边检索 API”
    // URL: `https://api.map.baidu.com/reverse_geocoding/v3/?ak=你的AK&output=json&coordtype=gcj02ll&location=${lat},${lng}`

    setTimeout(() => {
        isLoading.value = false;
        // 模拟刷新列表数据...
    }, 500);
};

const searchLocation = () => {
    uni.showToast({ title: '搜索: ' + searchKeyword.value, icon: 'none' });
    // TODO: 调用百度地图的“地点检索 API”
};

const selectPoi = (poi) => {
    selectedPoi.value = poi;
    // 选中列表某项后，把地图中心移过去
    mapState.latitude = poi.lat;
    mapState.longitude = poi.lng;
};

// 核心：点击确认，把位置信息存入 Store
const confirmLocation = () => {
    if (!selectedPoi.value) return;

    // 更新经纬度
    locationStore.setLocation(selectedPoi.value.lat, selectedPoi.value.lng);

    // 也可以顺便更新城市 (解析 address 里的城市名)
    const cityMatch = selectedPoi.value.address.match(/(.*?[市|自治州])/);
    if (cityMatch && cityMatch[1]) {
        locationStore.setCity(cityMatch[1].replace('省', '').replace('福建', '')); // 简易过滤
    }

    // 通知之前的页面
    uni.$emit('locationSelected', selectedPoi.value);

    // 如果是从 city-picker 进来的，回退两层可以回到报名页
    uni.navigateBack({ delta: 2 });
};
</script>

<style lang="scss" scoped>
.location-picker-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.custom-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    background-color: #fff;
    padding: 0 30rpx;
    position: relative;
    z-index: 10;
    border-bottom: 2rpx solid #f0f0f0;

    .nav-left {
        width: 100rpx;
        font-size: 30rpx;
        color: #666;
    }

    .nav-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }

    .nav-right {
        width: 100rpx;
        text-align: right;

        .confirm-btn {
            color: #007aff;
            font-size: 30rpx;
            font-weight: bold;

            &.disabled {
                color: #999;
            }
        }
    }
}

/* 上半部分地图 */
.map-wrap {
    flex: 4;
    position: relative;
    width: 100%;

    .map {
        width: 100%;
        height: 100%;
    }

    /* 屏幕中心永远固定这个气泡针 */
    .center-marker {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 64rpx;
        height: 64rpx;
        transform: translate(-50%, -100%);
        z-index: 10;
    }

    .locate-me-btn {
        position: absolute;
        bottom: 30rpx;
        right: 30rpx;
        width: 80rpx;
        height: 80rpx;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;

        .icon-crosshairs {
            font-size: 40rpx;
            color: #007aff;
        }
    }
}

/* 下半部分列表 */
.bottom-panel {
    flex: 5;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    margin-top: -20rpx;
    position: relative;
    z-index: 20;
    padding-top: 20rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.search-box {
    display: flex;
    align-items: center;
    background-color: #f5f7fa;
    height: 72rpx;
    border-radius: 36rpx;
    margin: 0 30rpx 20rpx;
    padding: 0 24rpx;

    .icon-search {
        font-size: 32rpx;
        color: #999;
        margin-right: 12rpx;
    }

    .search-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
    }
}

.poi-list {
    flex: 1;
    height: 0;
    padding: 0 30rpx;

    .poi-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 0;
        border-bottom: 2rpx solid #f0f0f0;

        .poi-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            margin-right: 20rpx;

            .poi-title {
                font-size: 32rpx;
                color: #333;
                margin-bottom: 8rpx;

                &.active {
                    color: #007aff;
                    font-weight: bold;
                }
            }

            .poi-address {
                font-size: 24rpx;
                color: #999;
            }
        }

        .text-blue {
            color: #007aff;
            font-size: 36rpx;
            font-weight: bold;
        }
    }

    .loading-tip {
        text-align: center;
        font-size: 24rpx;
        color: #ccc;
        padding: 40rpx 0;
    }
}
</style>