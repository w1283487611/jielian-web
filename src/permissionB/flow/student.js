// 学员流
import useStudentStore from "@/store/modules/student";


// import {
//   LOGIN_PATH,
//   SELECT_ROLE_PATH,
//   HOME_PATH,
//   WHITE_LIST,
//   STUDENT,
//   COACH
// } from "@/utils/constants";

const GUIDE_PATH = "/pages/student/guide";
const HOME_PATH = "/pages/student/home";

export async function handleStudentFlow(targetUrl) {
  const studentStore = useStudentStore()

  // 1️⃣ 拉初始化数据
  if (!studentStore.loaded) {
    try {
      await studentStore.fetchGuideInfo()
    } finally {
      studentStore.loaded = true
    }
  }

  // 2️⃣ 未初始化 → 强制去引导页
  if (!studentStore.isInitialized) {
    if (targetUrl !== GUIDE_PATH) {
      return GUIDE_PATH
    }
    return null
  }

  // 3️⃣ 已初始化，禁止再进 guide
  if (targetUrl === GUIDE_PATH) {
    return HOME_PATH
  }

  return null
}