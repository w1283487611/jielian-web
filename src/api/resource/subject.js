import request from '@/utils/request'

// 查询科目信息列表
export function listSubject(query) {
  return request({
    url: '/resource/subject/list',
    method: 'get',
    params: query
  })
}

// 查询科目信息详细
export function getSubject(id) {
  return request({
    url: '/resource/subject/' + id,
    method: 'get'
  })
}

// 新增科目信息
export function addSubject(data) {
  return request({
    url: '/resource/subject',
    method: 'post',
    data: data
  })
}

// 修改科目信息
export function updateSubject(data) {
  return request({
    url: '/resource/subject',
    method: 'put',
    data: data
  })
}

// 删除科目信息
export function delSubject(id) {
  return request({
    url: '/resource/subject/' + id,
    method: 'delete'
  })
}
