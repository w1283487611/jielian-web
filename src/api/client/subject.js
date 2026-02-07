import request from '@/utils/request'

// 查询科目信息列表
export function listSubject(query) {
  return request({
    url: '/client/subject/list',
    method: 'get',
    params: query
  })
}


// 通过驾驶证id查询驾驶证下的科目信息列表
export function listSubjectByLicenseId(licenseId) {
  return request({
    url: '/client/subject/list/license/' + licenseId,
    method: 'get'
  })
}


// 通过驾驶证id查询驾驶证下的科目列表
export function tagListSubjectByLicenseId(licenseId) {
  return request({
    url: '/client/subject/tagList/license/' + licenseId,
    method: 'get'
  })
}

// 查询科目信息详细
export function getSubject(id) {
  return request({
    url: '/client/subject/' + id,
    method: 'get'
  })
}

// 新增科目信息
export function addSubject(data) {
  return request({
    url: '/client/subject',
    method: 'post',
    data: data
  })
}

// 修改科目信息
export function updateSubject(data) {
  return request({
    url: '/client/subject',
    method: 'put',
    data: data
  })
}

// 删除科目信息
export function delSubject(id) {
  return request({
    url: '/client/subject/' + id,
    method: 'delete'
  })
}
