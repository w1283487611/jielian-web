import request from '@/utils/request'

// 查询违规记录列表
export function listViolation(query) {
  return request({
    url: '/serve/violation/list',
    method: 'get',
    params: query
  })
}

// 查询违规记录详细
export function getViolation(id) {
  return request({
    url: '/serve/violation/' + id,
    method: 'get'
  })
}

// 新增违规记录
export function addViolation(data) {
  return request({
    url: '/serve/violation',
    method: 'post',
    data: data
  })
}

// 修改违规记录
export function updateViolation(data) {
  return request({
    url: '/serve/violation',
    method: 'put',
    data: data
  })
}

// 删除违规记录
export function delViolation(id) {
  return request({
    url: '/serve/violation/' + id,
    method: 'delete'
  })
}
