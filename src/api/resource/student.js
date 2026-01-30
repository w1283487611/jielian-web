import request from '@/utils/request'

// 查询学员列表
export function listStudent(query) {
  return request({
    url: '/resource/student/list',
    method: 'get',
    params: query
  })
}

// 查询学员详细
export function getStudent(id) {
  return request({
    url: '/resource/student/' + id,
    method: 'get'
  })
}

// 新增学员
export function addStudent(data) {
  return request({
    url: '/resource/student',
    method: 'post',
    data: data
  })
}

// 修改学员
export function updateStudent(data) {
  return request({
    url: '/resource/student',
    method: 'put',
    data: data
  })
}

// 删除学员
export function delStudent(id) {
  return request({
    url: '/resource/student/' + id,
    method: 'delete'
  })
}
