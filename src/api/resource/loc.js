import request from '@/utils/request'

// 查询车辆驾校练车点关联列表
export function listLoc(query) {
  return request({
    url: '/resource/loc/list',
    method: 'get',
    params: query
  })
}

// 查询车辆驾校练车点关联详细
export function getLoc(vehicleId) {
  return request({
    url: '/resource/loc/' + vehicleId,
    method: 'get'
  })
}

// 新增车辆驾校练车点关联
export function addLoc(data) {
  return request({
    url: '/resource/loc',
    method: 'post',
    data: data
  })
}

// 修改车辆驾校练车点关联
export function updateLoc(data) {
  return request({
    url: '/resource/loc',
    method: 'put',
    data: data
  })
}

// 删除车辆驾校练车点关联
export function delLoc(vehicleId) {
  return request({
    url: '/resource/loc/' + vehicleId,
    method: 'delete'
  })
}
