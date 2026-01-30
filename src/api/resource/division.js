import request from '@/utils/request'

// 查询行政区划编码，用于规范地址信息管理列表
export function listDivision(query) {
  return request({
    url: '/resource/division/list',
    method: 'get',
    params: query
  })
}

// 查询行政区划编码，用于规范地址信息管理详细
export function getDivision(id) {
  return request({
    url: '/resource/division/' + id,
    method: 'get'
  })
}

// 新增行政区划编码，用于规范地址信息管理
export function addDivision(data) {
  return request({
    url: '/resource/division',
    method: 'post',
    data: data
  })
}

// 修改行政区划编码，用于规范地址信息管理
export function updateDivision(data) {
  return request({
    url: '/resource/division',
    method: 'put',
    data: data
  })
}

// 删除行政区划编码，用于规范地址信息管理
export function delDivision(id) {
  return request({
    url: '/resource/division/' + id,
    method: 'delete'
  })
}
