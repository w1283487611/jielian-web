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
                        {{ city.name }}
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
                                {{ city.name }}
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

// 去选择具体 POI，并请求后端反解 ID
const goToLocationPicker = () => {
  uni.chooseLocation({
    success: async (res) => {
      locationStore.setLocation(res.latitude, res.longitude);
      
      const cityMatch = res.address.match(/(.*?[市|自治州|盟])/); 
      if (cityMatch && cityMatch[1]) {
        let cityName = cityMatch[1].replace(/省|自治区/g, '').split(/(省|自治区)/).pop(); 
        cityName = cityName.replace('市', ''); 
        
        uni.showLoading({ title: '解析位置中...' });
        try {
          // 调用后端接口精确反查该城市对象
          const backendRes = await resolveCityByName(cityName);
          
          if (backendRes.code === 200 && backendRes.data) {
            locationStore.setCity(backendRes.data);
            uni.$emit('cityChanged', backendRes.data);
          } else {
            uni.showToast({ title: `当前城市 ${cityName} 暂未收录`, icon: 'none' });
            locationStore.setCity({ name: cityName, id: null, code: '' });
            uni.$emit('cityChanged', { name: cityName, id: null, code: '' });
          }
        } catch (error) {
          console.error('解析城市失败', error);
        } finally {
          uni.hideLoading();
        }
      }
      uni.navigateBack();
    }
  });
};


const selectCity = (cityObj) => {
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