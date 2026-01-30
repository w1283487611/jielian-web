import request from '@/utils/request'

// 查询车辆列表
export function listType(query) {
  return request({
    url: '/resource/type/list',
    method: 'get',
    params: query
  })
}

// 查询车辆详细
export function getType(id) {
  return request({
    url: '/resource/type/' + id,
    method: 'get'
  })
}

// 新增车辆
export function addType(data) {
  return request({
    url: '/resource/type',
    method: 'post',
    data: data
  })
}

// 修改车辆
export function updateType(data) {
  return request({
    url: '/resource/type',
    method: 'put',
    data: data
  })
}

// 删除车辆
export function delType(id) {
  return request({
    url: '/resource/type/' + id,
    method: 'delete'
  })
}
