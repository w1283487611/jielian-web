import request from '@/utils/request';

// 分页获取学员的练车预约记录
export function getRecordList(query) {
  return request({
    url: '/student/record/list',
    method: 'get',
    params: query // 包含 pageNum, pageSize, status
  });
}

// TODO: 这里还可以预留取消预约等接口
// export function cancelAppointment(id) { ... }