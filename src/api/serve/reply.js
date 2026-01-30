import request from '@/utils/request'

// 查询评价回复列表
export function listReply(query) {
  return request({
    url: '/serve/reply/list',
    method: 'get',
    params: query
  })
}

// 查询评价回复详细
export function getReply(id) {
  return request({
    url: '/serve/reply/' + id,
    method: 'get'
  })
}

// 新增评价回复
export function addReply(data) {
  return request({
    url: '/serve/reply',
    method: 'post',
    data: data
  })
}

// 修改评价回复
export function updateReply(data) {
  return request({
    url: '/serve/reply',
    method: 'put',
    data: data
  })
}

// 删除评价回复
export function delReply(id) {
  return request({
    url: '/serve/reply/' + id,
    method: 'delete'
  })
}
