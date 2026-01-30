import request from '@/utils/request'

// 查询核心预约练车列表
export function listAppointment(query) {
  return request({
    url: '/serve/appointment/list',
    method: 'get',
    params: query
  })
}

// 查询核心预约练车详细
export function getAppointment(id) {
  return request({
    url: '/serve/appointment/' + id,
    method: 'get'
  })
}

// 新增核心预约练车
export function addAppointment(data) {
  return request({
    url: '/serve/appointment',
    method: 'post',
    data: data
  })
}

// 修改核心预约练车
export function updateAppointment(data) {
  return request({
    url: '/serve/appointment',
    method: 'put',
    data: data
  })
}

// 删除核心预约练车
export function delAppointment(id) {
  return request({
    url: '/serve/appointment/' + id,
    method: 'delete'
  })
}
