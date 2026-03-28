import request from '@/utils/request';

// 分页获取学员的练车预约记录
export function getRecordList(query) {
  return request({
    url: '/student/record/list',
    method: 'get',
    params: query // 包含 pageNum, pageSize, status
  });
}

// 学员取消预约单 (含违约判定)
export function cancelAppointmentOrder(data) {
  return request({
    url: '/student/record/cancel',
    method: 'post',
    data: data
  });
}

// 删除历史练车记录 (软删除)
export function deleteAppointmentRecord(id) {
  return request({
    url: `/student/record/${id}`,
    method: 'delete'
  });
}