import request from '@/utils/request';

// 1. 获取预约大厅初始化数据 (环境感知、待办提醒、智能推荐)
export function getAppointInit() {
  return request({
    url: '/student/appoint/init',
    method: 'get'
  });
}

// 2. 根据日期和分类获取教练列表
export function getAppointCoachList(query) {
  return request({
    url: '/student/appoint/list',
    method: 'get',
    params: query // 包含 date 和 tab
  });
}