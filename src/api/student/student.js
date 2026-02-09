import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/common";

// 获取用户详细信息
export function getInfo() {
    return request({
      url: '/student/getInfo',
      method: 'get'
    })
}

// 修改学员
export function updateStudent(data) {
  return request({
    url: '/student',
    method: 'put',
    data: data
  })
}