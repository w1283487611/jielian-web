
import request from '@/utils/request';

// 获取指定教练在指定日期的排班时段与科目数据
export function getAppointDetailData(query) {
  return request({
    url: '/student/appoint-detail/data',
    method: 'get',
    params: query // 包含 coachId 和 date
  });
}