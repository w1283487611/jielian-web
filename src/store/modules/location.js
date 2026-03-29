import { defineStore } from "pinia";
import { resolveCityByName } from '@/api/client/location';

export const useLocationStore = defineStore("location", {
  state: () => ({
    // 当前选择的城市名称 (默认可以是系统配置的初始城市)
    currentCity: uni.getStorageSync("USER_CITY") || "未知",
    currentCityId: uni.getStorageSync("USER_CITY_ID") || null, // 行政区划ID
    currentCityCode: uni.getStorageSync("USER_CITY_CODE") || "", // 行政区划编码(如 350300)
    // 经纬度，用于计算距离
    latitude: uni.getStorageSync("USER_LAT") || null,
    longitude: uni.getStorageSync("USER_LNG") || null,
  }),
  actions: {
    // 1. 用户手动切换城市
    setCity(cityObj) {
      this.currentCity = cityObj.name;
      this.currentCityId = cityObj.id;
      this.currentCityCode = cityObj.code;

      uni.setStorageSync("USER_CITY", cityObj.name);
      uni.setStorageSync("USER_CITY_ID", cityObj.id);
      uni.setStorageSync("USER_CITY_CODE", cityObj.code);
    },

    // 2. 更新精确的 GPS 经纬度
    setLocation(lat, lng) {
      this.latitude = lat;
      this.longitude = lng;
      uni.setStorageSync("USER_LAT", lat);
      uni.setStorageSync("USER_LNG", lng);
    },

    // 3. 核心：调用系统 API 获取真实定位并逆地址解析
    async fetchLocation() {
      try {
        const res = await uni.getLocation({
          type: "gcj02", // O2O 常用国测局坐标系
          geocode: true, // 是否解析地址信息
        });

        if (res) {
          // console.log(res) // 这里结果没有实际地址 需要外部sdk
          this.setLocation(res.latitude, res.longitude);
          // // 如果系统解析出了城市，并且用户之前没有强行锁定城市，可以自动更新
          if(!res.address) {
            res.address = {city: "莆田"}
          }
          if (res.address && res.address.city) {
            // 提取纯净的城市名，例如：福建省莆田市 -> 莆田
            let cityName = res.address.city.replace(/省|自治区/g, '').split(/(省|自治区)/).pop();
            cityName = cityName.replace('市', '');
            
            // 🔥 调用后端接口反向匹配完整的城市对象
            const backendRes = await resolveCityByName(cityName);
            
            if (backendRes.code === 200 && backendRes.data) {
              this.setCity(backendRes.data); // 存入包含 id 和 code 的完整对象
            } else {
              // 兜底：如果数据库里没有这个城市
              this.setCity({ name: cityName, id: null, code: '' });
            }
          }
        }
      } catch (err) {
        console.error("获取定位失败", err);
      }
    },
  },
});
