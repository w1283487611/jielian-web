import request from '@/utils/request';

// 获取意向驾校列表 (支持分页和多条件筛选)
export function getSchoolList(query) {
  return request({
    url: '/student/school/list',
    method: 'get',
    params: query
  });
}

// 获取意向驾校列表 (支持分页和多条件筛选)
export function getEnrollSchoolList(query) {
  return request({
    url: '/student/school/school-list',
    method: 'get',
    params: query
  });
}

// 获取驾校详情
export function getSchoolDetail(id) {
  return request({
    url: '/student/school/' + id,
    method: 'get'
  });
}