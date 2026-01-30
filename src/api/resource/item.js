import request from '@/utils/request'

// 查询项目信息列表
export function listItem(query) {
  return request({
    url: '/resource/item/list',
    method: 'get',
    params: query
  })
}

// 查询项目信息详细
export function getItem(id) {
  return request({
    url: '/resource/item/' + id,
    method: 'get'
  })
}

// 新增项目信息
export function addItem(data) {
  return request({
    url: '/resource/item',
    method: 'post',
    data: data
  })
}

// 修改项目信息
export function updateItem(data) {
  return request({
    url: '/resource/item',
    method: 'put',
    data: data
  })
}

// 删除项目信息
export function delItem(id) {
  return request({
    url: '/resource/item/' + id,
    method: 'delete'
  })
}
