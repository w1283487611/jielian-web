// 路由守卫
import { getToken, getUserRole } from "@/utils/auth";
import useUserStore from "@/store/modules/user";
import { isPathMatch } from "@/utils/validate";

import { handleStudentFlow } from "./flow/student";
import { handleCoachFlow } from "./flow/coach";

import {
  LOGIN_PATH,
  SELECT_ROLE_PATH,
  HOME_PATH,
  WHITE_LIST,
  STUDENT,
  COACH
} from "@/utils/constants";

// 白名单判断
const isWhiteList = (url) => {
  return WHITE_LIST.some((pattern) => isPathMatch(pattern, url));
}

// 防重复跳转
let navigating = false;

function safeNavigate(url) {
  if (navigating) return false;
  navigating = true;

  uni.reLaunch({ url });

  setTimeout(() => {
    navigating = false;
  }, 300);

  return false;
}

// ⭐核心守卫
async function beforeEach(args) {
  const userStore = useUserStore();
  const url = args.url;

  // 1️⃣ 白名单
  if (isWhiteList(url)) return args;

  // 2️⃣ 登录校验
  const token = getToken();
  if (!token) {
    return {
      url: `${LOGIN_PATH}?redirect=${url}`
    };
  }

  // 3️⃣ 获取用户信息（只做一次）
  if (!userStore.loaded) {
    try {
      await userStore.getInfo()
      userStore.loaded = true;
    } catch (e) {
      userStore.logOut()
      return { url: LOGIN_PATH };
    }
  }

  // 4️⃣ 角色校验
  const role = getUserRole()
  if (!role) {
    if (url !== SELECT_ROLE_PATH) {
      return { url: SELECT_ROLE_PATH };
    }
    return args;
  }

  // 5️⃣ 角色流分发（核心🔥）
  let redirectUrl = null;

  if (role === STUDENT) {
    redirectUrl = await handleStudentFlow(url);
  }

  if (role === COACH) {
    redirectUrl = await handleCoachFlow(url);
  }

  if (redirectUrl) {
    return { url: redirectUrl };
  }

  return args;
}

// 注册拦截器
export function setupRouterGuard() {
  const interceptor = {
    async invoke(args) {
      const result = await beforeEach(args);

      if (result === false) return false;
      if (result && typeof result === "object") return result;

      return args;
    },
    complete() {}
  }

  uni.addInterceptor("navigateTo", interceptor);
  uni.addInterceptor("redirectTo", interceptor);
  uni.addInterceptor("reLaunch", interceptor);

  console.log("== 路由守卫已启用 ==");
}