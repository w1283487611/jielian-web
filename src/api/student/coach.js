import request from '@/utils/request';

// 获取意向教练列表 (支持分页、所属驾校、标签等筛选)
export function getCoachList(query) {
  return request({
    url: '/student/coach/list',
    method: 'get',
    params: query
  });
}