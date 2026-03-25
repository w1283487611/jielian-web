// 教练流
const HOME_PATH = "/pages/coach/home"

export async function handleCoachFlow(targetUrl) {
  // 目前教练无需初始化，可扩展

  // 示例：禁止进入学员页面
  if (targetUrl.includes("/student/")) {
    return HOME_PATH
  }

  return null
}