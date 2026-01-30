import request from '@/utils/request'

// 查询拉黑记录列表
export function listBlacklist(query) {
  return request({
    url: '/serve/blacklist/list',
    method: 'get',
    params: query
  })
}

// 查询拉黑记录详细
export function getBlacklist(id) {
  return request({
    url: '/serve/blacklist/' + id,
    method: 'get'
  })
}

// 新增拉黑记录
export function addBlacklist(data) {
  return request({
    url: '/serve/blacklist',
    method: 'post',
    data: data
  })
}

// 修改拉黑记录
export function updateBlacklist(data) {
  return request({
    url: '/serve/blacklist',
    method: 'put',
    data: data
  })
}

// 删除拉黑记录
export function delBlacklist(id) {
  return request({
    url: '/serve/blacklist/' + id,
    method: 'delete'
  })
}
