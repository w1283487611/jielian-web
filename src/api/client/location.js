import request from '@/utils/request';

// 获取城市选择器所需的完整数据(A-Z及热门城市)
export function getCityPickerData() {
  return request({
    url: '/common/location/city-picker-data',
    method: 'get'
  });
}

// 根据城市名称反向解析完整的行政区划对象
export function resolveCityByName(cityName) {
  return request({
    url: '/common/location/resolve-city',
    method: 'get',
    params: { cityName }
  });
}