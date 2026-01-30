import request from '@/utils/request'

// 查询车辆列表
export function listVehicle(query) {
  return request({
    url: '/resource/vehicle/list',
    method: 'get',
    params: query
  })
}

// 查询车辆详细
export function getVehicle(id) {
  return request({
    url: '/resource/vehicle/' + id,
    method: 'get'
  })
}

// 新增车辆
export function addVehicle(data) {
  return request({
    url: '/resource/vehicle',
    method: 'post',
    data: data
  })
}

// 修改车辆
export function updateVehicle(data) {
  return request({
    url: '/resource/vehicle',
    method: 'put',
    data: data
  })
}

// 删除车辆
export function delVehicle(id) {
  return request({
    url: '/resource/vehicle/' + id,
    method: 'delete'
  })
}
