import request from '@/utils/request'

// 查询地点信息列表
export function listLocation(query) {
  return request({
    url: '/resource/location/list',
    method: 'get',
    params: query
  })
}

// 查询地点信息详细
export function getLocation(id) {
  return request({
    url: '/resource/location/' + id,
    method: 'get'
  })
}

// 新增地点信息
export function addLocation(data) {
  return request({
    url: '/resource/location',
    method: 'post',
    data: data
  })
}

// 修改地点信息
export function updateLocation(data) {
  return request({
    url: '/resource/location',
    method: 'put',
    data: data
  })
}

// 删除地点信息
export function delLocation(id) {
  return request({
    url: '/resource/location/' + id,
    method: 'delete'
  })
}
