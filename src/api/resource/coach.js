import request from '@/utils/request'

// 查询教练基本信息，存储教练的雇佣关系和身份信息列表
export function listCoach(query) {
  return request({
    url: '/resource/coach/list',
    method: 'get',
    params: query
  })
}

// 查询教练基本信息，存储教练的雇佣关系和身份信息详细
export function getCoach(id) {
  return request({
    url: '/resource/coach/' + id,
    method: 'get'
  })
}

// 新增教练基本信息，存储教练的雇佣关系和身份信息
export function addCoach(data) {
  return request({
    url: '/resource/coach',
    method: 'post',
    data: data
  })
}

// 修改教练基本信息，存储教练的雇佣关系和身份信息
export function updateCoach(data) {
  return request({
    url: '/resource/coach',
    method: 'put',
    data: data
  })
}

// 删除教练基本信息，存储教练的雇佣关系和身份信息
export function delCoach(id) {
  return request({
    url: '/resource/coach/' + id,
    method: 'delete'
  })
}
