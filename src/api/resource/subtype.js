import request from '@/utils/request'

// 查询车辆类型列表
export function listSubtype(query) {
  return request({
    url: '/resource/subtype/list',
    method: 'get',
    params: query
  })
}

// 查询车辆类型详细
export function getSubtype(id) {
  return request({
    url: '/resource/subtype/' + id,
    method: 'get'
  })
}

// 新增车辆类型
export function addSubtype(data) {
  return request({
    url: '/resource/subtype',
    method: 'post',
    data: data
  })
}

// 修改车辆类型
export function updateSubtype(data) {
  return request({
    url: '/resource/subtype',
    method: 'put',
    data: data
  })
}

// 删除车辆类型
export function delSubtype(id) {
  return request({
    url: '/resource/subtype/' + id,
    method: 'delete'
  })
}
