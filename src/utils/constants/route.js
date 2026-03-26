// common/constants/route.js
export const PLATFORM = {
  H5: 'h5',
  MP_WEIXIN: 'mp-weixin',
  APP: 'app'
}

// 学员路由常量
/**
 * 学员主页
 */
export const STUDENT_HOME_PATH = "/pages/tabbar/student/index/index";


/**
 * 学员引导页
 */
export const STUDENT_GUIDE_PATH = "/pages/student/guide/guide";

/**
 * 和教练进行预约页
 */
export const STUDENT_DO_APPOINT_PATH = "/pages/student/do-appoint/do-appoint"

/**
 * 预约详情页
 */
export const STUDENT_APPOINT_DETAIL_PATH = "/pages/student/appoint-detail/appoint-detail"


// 教练路由常量
/**
 * 教练主页
 */
export const COACH_HOME_PATH = "/pages/tabbar/coach/index/index";
/**
 * 教练引导页
 */
export const COACH_GUIDE_PATH = "/pages/coach/guide/guide";

// 通用路由常量
/**
 * 角色选择页
 */
export const SELECT_ROLE_PATH = "/pages/select-role/select-role";
/**
 * 系统主页
 */
export const HOME_PATH = "/pages/index/index";
/**
 * 登录页
 */
export const LOGIN_PATH = "/pages/login/login";
/**
 * 注册页
 */
export const REGISTER_PATH = "/pages/register/register";
/**
 * 路径跳转白名单
 */
export const PERM_WHITE_LIST = [LOGIN_PATH, REGISTER_PATH];