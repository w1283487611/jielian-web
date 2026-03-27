import request from "@/utils/request";

// 获取指定教练在指定日期的排班时段与科目数据
export function getAppointDetailData(query) {
  return request({
    url: "/student/appoint-detail/data",
    method: "get",
    params: query, // 包含 coachId 和 date
  });
}

// 提交预约订单 (核心防超卖)
export function submitAppointmentOrder(data) {
  return request({
    url: "/student/appoint-detail/submit",
    method: "post",
    data: data, // POST 请求将数据放在 body 中
  });
}
