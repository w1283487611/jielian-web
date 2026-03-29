<template>
    <view class="city-picker-container">
        <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-left" @click="goBack">
                <text class="iconfont icon-left"></text>
            </view>
            <text class="nav-title">选择城市</text>
            <view class="nav-right" @click="goToLocationPicker">
                <text class="location-text">选择位置</text>
            </view>
        </view>

        <view class="search-wrap">
            <view class="search-box">
                <text class="iconfont icon-search"></text>
                <input class="search-input" v-model="searchKeyword" placeholder="请输入城市名称或拼音" />
            </view>
        </view>

        <scroll-view class="scroll-area" scroll-y :scroll-into-view="scrollIntoId" scroll-with-animation>
            <view class="content-padding">

                <view class="search-result" v-if="searchKeyword">
                    <view class="city-cell" v-for="city in searchResults" :key="city" @click="selectCity(city)">
                        {{ city }}
                    </view>
                    <view class="empty-tip" v-if="searchResults.length === 0">未找到相关城市</view>
                </view>

                <block v-else>
                    <view class="section">
                        <view class="section-title">当前选择城市</view>
                        <view class="grid-box">
                            <view class="grid-item active">
                                {{ locationStore.currentCity || '定位中...' }}
                            </view>
                        </view>
                    </view>

                    <view class="section">
                        <view class="section-title">定位/热门城市</view>
                        <view class="grid-box">
                            <view class="grid-item hot-location" @click="reLocate">
                                <text class="iconfont icon-location-fill"></text> {{ locationStore.currentCity || '莆田'
                                }}
                            </view>
                            <view class="grid-item" v-for="city in hotCities" :key="city" @click="selectCity(city)">
                                {{ city }}
                            </view>
                        </view>
                    </view>

                    <view class="section">
                        <view class="section-title">所有城市</view>
                        <view class="alpha-group" v-for="group in cityData" :key="group.letter"
                            :id="'alpha-' + group.letter">
                            <view class="alpha-letter">{{ group.letter }}</view>
                            <view class="city-cell" v-for="city in group.cities" :key="city" @click="selectCity(city)">
                                {{ city }}
                            </view>
                        </view>
                    </view>
                </block>

            </view>
        </scroll-view>

        <view class="index-bar" v-if="!searchKeyword" @touchstart.stop="onIndexTouch"
            @touchmove.stop.prevent="onIndexTouch">
            <view class="index-item" v-for="item in alphabet" :key="item">{{ item }}</view>
        </view>

    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLocationStore } from '@/store/modules/location';

const locationStore = useLocationStore();
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20;

const searchKeyword = ref('');
const scrollIntoId = ref('');

// 模拟热门城市数据
const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'];

// 模拟 A-Z 城市数据结构
const alphabet = ['A', 'B', 'C', 'F', 'G', 'H', 'N', 'P', 'S', 'W'];
const cityData = [
    { letter: 'A', cities: ['阿拉善盟', '鞍山', '安庆', '安阳'] },
    { letter: 'B', cities: ['北京', '保定', '宝鸡', '包头'] },
    { letter: 'F', cities: ['福州', '佛山', '抚顺'] },
    { letter: 'P', cities: ['莆田', '盘锦', '平顶山', '萍乡'] },
    { letter: 'X', cities: ['厦门', '西安', '襄阳', '徐州'] }
    // ... 实际开发中可以通过后端接口或本地 JSON 获取完整数据
];

// 简单的本地搜索过滤
const searchResults = computed(() => {
    if (!searchKeyword.value) return [];
    const results = [];
    cityData.forEach(group => {
        group.cities.forEach(city => {
            if (city.includes(searchKeyword.value)) {
                results.push(city);
            }
        });
    });
    return results;
});

// 交互事件
const goBack = () => uni.navigateBack();

const goToLocationPicker = () => {
    uni.navigateTo({ url: '/pages/common/location-picker/location-picker' });
};

const selectCity = (city) => {
    locationStore.setCity(city); // 存入 Pinia
    // 触发全局事件，让上一个页面知道城市变了 (可选)
    uni.$emit('cityChanged', city);
    uni.navigateBack();
};

const reLocate = () => {
    uni.showLoading({ title: '定位中...' });
    locationStore.fetchLocation().finally(() => {
        uni.hideLoading();
    });
};

// 侧边栏字母索引点击
const onIndexTouch = (e) => {
    // 简化的点击/滑动索引逻辑，通过计算触摸位置对应字母
    // 实际项目中可按需完善触摸边界计算
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return;

    const query = uni.createSelectorQuery();
    query.select('.index-bar').boundingClientRect(data => {
        if (data) {
            const itemHeight = data.height / alphabet.length;
            const index = Math.floor((touch.clientY - data.top) / itemHeight);
            if (index >= 0 && index < alphabet.length) {
                scrollIntoId.value = 'alpha-' + alphabet[index];
                uni.showToast({ title: alphabet[index], icon: 'none', duration: 800 });
            }
        }
    }).exec();
};
</script>

<style lang="scss" scoped>
.city-picker-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
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

    .nav-left {
        width: 80rpx;

        .icon-left {
            font-size: 36rpx;
            color: #333;
        }
    }

    .nav-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }

    .nav-right {
        width: 120rpx;
        text-align: right;

        .location-text {
            font-size: 28rpx;
            color: #007aff;
        }
    }
}

.search-wrap {
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-bottom: 2rpx solid #f0f0f0;

    .search-box {
        display: flex;
        align-items: center;
        background-color: #f5f7fa;
        height: 72rpx;
        border-radius: 36rpx;
        padding: 0 24rpx;

        .icon-search {
            font-size: 32rpx;
            color: #999;
            margin-right: 12rpx;
        }

        .search-input {
            flex: 1;
            font-size: 28rpx;
        }
    }
}

.scroll-area {
    flex: 1;
    height: 0;

    .content-padding {
        padding-bottom: 40rpx;
    }

    .section {
        padding: 30rpx;
        background-color: #fff;
        margin-bottom: 20rpx;

        .section-title {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 24rpx;
        }

        .grid-box {
            display: flex;
            flex-wrap: wrap;
            gap: 20rpx;
            margin-right: 40rpx;

            /* 给右侧索引条留空间 */
            .grid-item {
                width: calc((100% - 40rpx) / 3);
                height: 72rpx;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f5f7fa;
                border-radius: 8rpx;
                font-size: 28rpx;
                color: #333;

                &.active {
                    background-color: #fff;
                    border: 2rpx solid #007aff;
                    color: #007aff;
                    font-weight: bold;
                    box-sizing: border-box;
                }

                &.hot-location {
                    color: #007aff;

                    .icon-location-fill {
                        margin-right: 8rpx;
                        font-size: 28rpx;
                    }
                }
            }
        }

        .alpha-group {
            margin-bottom: 20rpx;

            .alpha-letter {
                font-size: 30rpx;
                color: #999;
                padding: 10rpx 0;
                background-color: #f5f7fa;
                margin: 0 -30rpx;
                padding-left: 30rpx;
                font-weight: bold;
            }
        }
    }

    .city-cell {
        padding: 30rpx 0;
        border-bottom: 2rpx solid #f0f0f0;
        font-size: 30rpx;
        color: #333;

        &:active {
            background-color: #f9f9f9;
        }
    }
}

/* 右侧浮动索引条 */
.index-bar {
    position: fixed;
    right: 10rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;

    .index-item {
        font-size: 22rpx;
        color: #999;
        padding: 4rpx 10rpx;
        margin-bottom: 4rpx;

        &.active {
            color: #007aff;
            font-weight: bold;
        }
    }
}
</style>