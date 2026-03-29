<template>
    <view class="city-picker-container">
        <view class="custom-nav">
            <text class="nav-left">选择城市</text>

            <view class="search-wrap">
                <view class="search-box">
                    <uni-icons type="search" size="18" color="#999" class="search-icon"></uni-icons>
                    <input class="search-input" v-model="searchKeyword" placeholder="请输入城市名称或拼音" />
                </view>
            </view>
            <view class="nav-right" @click="goToLocationPicker">
                <text class="location-text">选择位置</text>
            </view>
        </view>


        <scroll-view class="scroll-area" scroll-y :scroll-into-view="scrollIntoId" scroll-with-animation>
            <view class="content-padding">

                <view class="search-result" v-if="searchKeyword">
                    <view class="result-list" v-if="searchResults.length > 0">
                        <view class="result-item" v-for="city in searchResults" :key="city.id"
                            @click="selectCity(city)">
                            <view class="item-left">
                                <view class="icon-bg">
                                    <uni-icons type="location-filled" size="18" color="#007aff"></uni-icons>
                                </view>
                                <text class="city-name">{{ city.name }}</text>
                            </view>
                            <uni-icons type="right" size="16" color="#dcdfe6"></uni-icons>
                        </view>
                    </view>

                    <view class="empty-state" v-else>
                        <view class="empty-icon-wrap">
                            <uni-icons type="search" size="40" color="#c0c4cc"></uni-icons>
                        </view>
                        <text class="empty-text">未能找到包含“<text class="highlight">{{ searchKeyword }}</text>”的城市</text>
                        <text class="sub-text">请检查您的拼写是否正确</text>
                    </view>
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
                                <uni-icons type="location-filled" size="16" color="#007aff" class="loc-icon"></uni-icons> 
                                {{ locationStore.currentCity ? getCityLevel(locationStore.currentCity) : '未知'
                                }}
                            </view>
                            <view class="grid-item" v-for="city in hotCities" :key="city" @click="selectCity(city)">
                                {{ getCityLevel(city.name) }}
                            </view>
                        </view>
                    </view>

                    <view class="section">
                        <view class="section-title">所有城市</view>
                        <view class="alpha-group" v-for="group in cityData" :key="group.letter"
                            :id="'alpha-' + group.letter">
                            <view class="alpha-letter">{{ group.letter }}</view>
                            <view class="city-cell" v-for="city in group.cities" :key="city" @click="selectCity(city)">
                                {{ city.name }}
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
import { ref, computed, onMounted } from 'vue';
import { useLocationStore } from '@/store/modules/location';
import { getCityPickerData, resolveCityByName } from '@/api/client/location';

const locationStore = useLocationStore();
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20;

const searchKeyword = ref('');
const scrollIntoId = ref('');

// 模拟热门城市数据
// const hotCities = ref([
//   { id: 1, code: '110000', name: '北京' },
//   { id: 310000, code: '310000', name: '上海' },
//   { id: 350300, code: '350300', name: '莆田' }
// ]);
// const cityData = ref([
//   { 
//     letter: 'P', 
//     cities: [
//       { id: 350300, code: '350300', name: '莆田' },
//       { id: 211100, code: '211100', name: '盘锦' }
//     ] 
//   }
// ]);
// 响应式数据源（由后端提供）
const hotCities = ref([]);
const cityData = ref([]);

// 右侧固定字母表 A-Z (可以直接写死，或根据后端返回的 keys 动态生成)
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

const fetchCityData = async () => {
    try {
        uni.showLoading({ title: '加载城市数据...' });
        const res = await getCityPickerData();
        if (res.code === 200 && res.data) {
            hotCities.value = res.data.hotCities || [];
            cityData.value = res.data.cityData || [];
        }
    } catch (error) {
        console.error('获取城市列表异常:', error);
        uni.showToast({ title: '城市数据加载失败', icon: 'none' });
    } finally {
        uni.hideLoading();
    }
};

// 本地搜索过滤
const searchResults = computed(() => {
    if (!searchKeyword.value) return [];
    const results = [];
    cityData.value.forEach(group => {
        group.cities.forEach(city => {
            // 支持对城市名（如“莆田”）的模糊搜索
            if (city.name.includes(searchKeyword.value)) {
                results.push(city);
            }
        });
    });
    return results;
});

// 交互事件
const goBack = () => uni.navigateBack();


// 辅助函数：通过城市名称反查完整的城市对象 (包含 id 和 code)
// const findCityObjByName = (cityName) => {
//   // 遍历 A-Z 城市列表
//   for (const group of cityData.value) {
//     const found = group.cities.find(c => c.name === cityName || c.name + '市' === cityName);
//     if (found) return found;
//   }
//   return null; // 如果本地没找到该城市
// };

// const goToLocationPicker = () => {
//   uni.chooseLocation({
//     success: (res) => {
//       console.log('微信原生位置选择成功:', res);
//       // 1. 更新精确经纬度
//       locationStore.setLocation(res.latitude, res.longitude);

//       // 2. 尝试从详细地址中提取城市名 (如"福建省莆田市城厢区" -> "莆田市")
//       // 正则适配市、自治州、盟等行政单位
//       const cityMatch = res.address.match(/(.*?[市|自治州|盟])/); 
//       if (cityMatch && cityMatch[1]) {
//         // 剥离省份前缀
//         let cityName = cityMatch[1].replace(/省|自治区/g, '').split(/(省|自治区)/).pop(); 
//         // 剥离“市”的后缀，统一为我们数据的格式：“莆田”
//         cityName = cityName.replace('市', ''); 

//         // 3. 🔥 核心改造：去本地列表中匹配完整的城市对象
//         const matchedCityObj = findCityObjByName(cityName);

//         if (matchedCityObj) {
//           // 找到了完整的对象 (包含 id: 350300)，完美存入 Pinia
//           locationStore.setCity(matchedCityObj);
//           uni.$emit('cityChanged', matchedCityObj);
//         } else {
//           // 兜底处理：如果微信定位的城市在你本地列表里不存在（比如未开通城市）
//           console.warn('本地未匹配到该城市数据：', cityName);
//           uni.showToast({ title: `当前城市 ${cityName} 暂未收录`, icon: 'none' });
//           // 降级存入：只存名字，不存 ID，后端查询时可能会返回空列表
//           locationStore.setCity({ name: cityName, id: null, code: '' });
//           uni.$emit('cityChanged', { name: cityName, id: null, code: '' });
//         }
//       }

//       // 4. 返回上一页 (报名页)
//       uni.navigateBack();
//     },
//     fail: (err) => {
//       console.log('用户取消了位置选择', err);
//     }
//   });
// };

function simplifyCityName(name) {
    if (!name) return "";
    const oldName = name;

    // 去掉地级后缀
    name = name.replace(/(市|地区|自治州|自治县|盟)$/, "");

    // 去掉民族部分（关键）
    // 匹配：藏族 / 羌族 / 回族 / 维吾尔族 等
    name = name.replace(/([\u4e00-\u9fa5]+?)(?:[\u4e00-\u9fa5]*族)+$/, "$1");

    if (name.length === 1) return oldName.substring(0, 2);
    return name;
}
function getCityLevel(address) {
    if (!address) return "莆田";

    const municipalities = ["北京市", "上海市", "天津市", "重庆市"];
    const direct = municipalities.find(city => address.includes(city));
    if (direct) return direct.replace(/市$/, "");

    const match = address
        .replace(/^.*?(省|自治区|特别行政区)/, "")
        .match(/([\u4e00-\u9fa5]+?(市|地区|自治州|盟))/);

    if (!match) return address;

    return simplifyCityName(match[1]);
}


// 去选择具体 POI，并请求后端反解 ID
const goToLocationPicker = () => {
    uni.chooseLocation({
        success: async (res) => {
            locationStore.setLocation(res.latitude, res.longitude);

            let cityName = getCityLevel(res.address);
            if (cityName) {
                uni.showLoading({ title: `解析位置中...${cityName}` });
                try {
                    // 调用后端接口精确反查该城市对象
                    const backendRes = await resolveCityByName(cityName);

                    if (backendRes.code === 200 && backendRes.data) {
                        backendRes.data.name = cityName;
                        locationStore.setCity(backendRes.data);
                        uni.$emit('cityChanged', backendRes.data);
                    } else {
                        uni.showToast({ title: `当前城市 ${cityName} 暂未收录`, icon: 'none' });
                        locationStore.setCity({ name: cityName, id: null, code: '' });
                        uni.$emit('cityChanged', { name: cityName, id: null, code: '' });
                    }
                } catch (error) {
                    console.error('解析城市失败', error);
                    uni.showToast({ title: `当前城市 ${cityName} 暂未收录`, icon: 'none' });
                    locationStore.setCity({ name: cityName, id: 3387, code: '653100' });
                    uni.$emit('cityChanged', { name: cityName, id: 3387, code: '653100' });
                } finally {
                    uni.hideLoading();
                }
            } else {
                console.error("城市匹配错误: ", res);
                uni.showToast({ title: `城市匹配错误`, icon: 'none' });
            }
            uni.navigateBack();
        }
    });
};


const selectCity = (city) => {
    const cityObj = {
        ...city,
        name: getCityLevel(city.name)
    }
    locationStore.setCity(cityObj); // 存入包含 ID 的对象
    // 触发全局事件，让上一个页面知道城市变了 (可选)
    uni.$emit('cityChanged', cityObj);
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


// 页面挂载时拉取城市列表
onMounted(() => {
    fetchCityData();
});
</script>

<style lang="scss" scoped>
.city-picker-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    // background-color: #f5f7fa;
}

.custom-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    background-color: #fff;
    padding: 20rpx 30rpx;
    position: relative;
    z-index: 10;

    .nav-left {
        width: 120rpx;
        font-size: 28rpx;

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

// /* ================= 优美的搜索结果面板 ================= */
.search-result {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    z-index: 20;
    padding: 0 30rpx;

    /* 搜索结果列表 */
    .result-list {
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30rpx 0;
            border-bottom: 2rpx solid #f5f7fa;
            transition: background-color 0.2s;

            &:active {
                background-color: #f9f9f9;
                border-radius: 12rpx;
            }

            .item-left {
                display: flex;
                align-items: center;

                .icon-bg {
                    width: 56rpx;
                    height: 56rpx;
                    background-color: #e6f2ff;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 20rpx;

                    .icon-location-fill {
                        color: #007aff;
                        font-size: 32rpx;
                    }
                }

                .city-name {
                    font-size: 30rpx;
                    color: #333;
                    font-weight: 500;
                }
            }

            .arrow-icon {
                color: #dcdfe6;
                font-size: 28rpx;
            }
        }
    }

    /* 搜索空状态 */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 160rpx;

        .empty-icon-wrap {
            width: 140rpx;
            height: 140rpx;
            background-color: #f5f7fa;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30rpx;

            .icon-search {
                font-size: 64rpx;
                color: #c0c4cc;
            }
        }

        .empty-text {
            font-size: 28rpx;
            color: #666;
            margin-bottom: 12rpx;

            .highlight {
                color: #ff3b30;
                font-weight: bold;
                margin: 0 6rpx;
            }
        }

        .sub-text {
            font-size: 24rpx;
            color: #999;
        }
    }
}


</style>