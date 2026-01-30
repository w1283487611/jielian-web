import request from '@/utils/request'

// 查询评价列表
export function listReview(query) {
  return request({
    url: '/serve/review/list',
    method: 'get',
    params: query
  })
}

// 查询评价详细
export function getReview(id) {
  return request({
    url: '/serve/review/' + id,
    method: 'get'
  })
}

// 新增评价
export function addReview(data) {
  return request({
    url: '/serve/review',
    method: 'post',
    data: data
  })
}

// 修改评价
export function updateReview(data) {
  return request({
    url: '/serve/review',
    method: 'put',
    data: data
  })
}

// 删除评价
export function delReview(id) {
  return request({
    url: '/serve/review/' + id,
    method: 'delete'
  })
}
