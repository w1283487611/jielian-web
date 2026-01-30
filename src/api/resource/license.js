import request from '@/utils/request'

// 查询具体驾驶证类型，定义每种驾驶证的详细信息列表
export function listLicense(query) {
  return request({
    url: '/resource/license/list',
    method: 'get',
    params: query
  })
}

// 查询具体驾驶证类型，定义每种驾驶证的详细信息详细
export function getLicense(id) {
  return request({
    url: '/resource/license/' + id,
    method: 'get'
  })
}

// 新增具体驾驶证类型，定义每种驾驶证的详细信息
export function addLicense(data) {
  return request({
    url: '/resource/license',
    method: 'post',
    data: data
  })
}

// 修改具体驾驶证类型，定义每种驾驶证的详细信息
export function updateLicense(data) {
  return request({
    url: '/resource/license',
    method: 'put',
    data: data
  })
}

// 删除具体驾驶证类型，定义每种驾驶证的详细信息
export function delLicense(id) {
  return request({
    url: '/resource/license/' + id,
    method: 'delete'
  })
}
