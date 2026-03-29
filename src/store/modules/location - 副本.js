import { defineStore } from 'pinia';

export const useLocationStore = defineStore('location', {
  state: () => ({
    // 当前选择的城市名称 (默认可以是系统配置的初始城市)
    currentCity: uni.getStorageSync('USER_CITY') || '未知', 
    // 经纬度，用于计算距离
    latitude: uni.getStorageSync('USER_LAT') || null,
    longitude: uni.getStorageSync('USER_LNG') || null,
  }),
  actions: {
    // 1. 用户手动切换城市
    setCity(cityName) {
      this.currentCity = cityName;
      uni.setStorageSync('USER_CITY', cityName); // 持久化，下次打开 App 还是这个城市
    },
    
    // 2. 更新精确的 GPS 经纬度
    setLocation(lat, lng) {
      this.latitude = lat;
      this.longitude = lng;
      uni.setStorageSync('USER_LAT', lat);
      uni.setStorageSync('USER_LNG', lng);
    },

    // 3. 核心：调用系统 API 获取真实定位并逆地址解析
    async fetchLocation() {
      try {
        const [error, res] = await uni.getLocation({
          type: 'gcj02', // O2O 常用国测局坐标系
          geocode: true  // 是否解析地址信息
        });
        
        if (!error && res) {
          this.setLocation(res.latitude, res.longitude);
          // 如果系统解析出了城市，并且用户之前没有强行锁定城市，可以自动更新
          if (res.address && res.address.city) {
            let city = res.address.city.replace('市', ''); // 把 '莆田市' 变成 '莆田'
            this.setCity(city);
          }
        }
      } catch (err) {
        console.error('获取定位失败', err);
      }
    }
  }
});