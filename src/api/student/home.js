import request from '@/utils/request';

// 获取学员主页聚合数据 (包含进度、教练、行程、头条)
export function getStudentHomeData() {
  return request({
    url: '/student/home/index',
    method: 'get'
  });
}