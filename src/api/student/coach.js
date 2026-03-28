import request from '@/utils/request';

// 获取所有的教练标签
export function getCoachTags(keyword) {
  return request({
    url: '/student/coach/tag/list?keyword='+keyword,
    method: 'get'
  })
}

// 获取意向教练列表 (支持分页、所属驾校、标签等筛选)
export function getCoachList(query) {
  return request({
    url: '/student/coach/list',
    method: 'get',
    params: query
  });
}

// 获取教练详情
export function getCoachDetail(id) {
  return request({
    url: '/student/coach/' + id,
    method: 'get'
  });
}

// 获取我的教练列表 (主教练 + 历史教练)
export function getMyCoachList() {
  return request({
    url: '/student/coach/my-list',
    method: 'get'
  });
}