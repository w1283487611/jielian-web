import request from '@/utils/request'

// 查询驾校基本信息，存储驾校的核心注册信息列表
export function listSchool(query) {
  return request({
    url: '/resource/school/list',
    method: 'get',
    params: query
  })
}

// 查询驾校基本信息，存储驾校的核心注册信息详细
export function getSchool(id) {
  return request({
    url: '/resource/school/' + id,
    method: 'get'
  })
}

// 新增驾校基本信息，存储驾校的核心注册信息
export function addSchool(data) {
  return request({
    url: '/resource/school',
    method: 'post',
    data: data
  })
}

// 修改驾校基本信息，存储驾校的核心注册信息
export function updateSchool(data) {
  return request({
    url: '/resource/school',
    method: 'put',
    data: data
  })
}

// 删除驾校基本信息，存储驾校的核心注册信息
export function delSchool(id) {
  return request({
    url: '/resource/school/' + id,
    method: 'delete'
  })
}
