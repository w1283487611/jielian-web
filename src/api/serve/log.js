import request from '@/utils/request'

// 查询预约状态变更日志列表
export function listLog(query) {
  return request({
    url: '/serve/log/list',
    method: 'get',
    params: query
  })
}

// 查询预约状态变更日志详细
export function getLog(id) {
  return request({
    url: '/serve/log/' + id,
    method: 'get'
  })
}

// 新增预约状态变更日志
export function addLog(data) {
  return request({
    url: '/serve/log',
    method: 'post',
    data: data
  })
}

// 修改预约状态变更日志
export function updateLog(data) {
  return request({
    url: '/serve/log',
    method: 'put',
    data: data
  })
}

// 删除预约状态变更日志
export function delLog(id) {
  return request({
    url: '/serve/log/' + id,
    method: 'delete'
  })
}
