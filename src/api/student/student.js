import request from '@/utils/request';
import { parseStrEmpty } from "@/utils/common";

// 提交学员初始引导配置 (驾照、驾校、教练)
export function submitStudentInit(data) {
  return request({
    url: '/student/initGuide',
    method: 'post',
    data: data
  });
}

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