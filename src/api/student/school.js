import request from '@/utils/request';

// 获取意向驾校列表 (支持分页和多条件筛选)
export function getSchoolList(query) {
  return request({
    url: '/student/school/list',
    method: 'get',
    params: query
  });
}