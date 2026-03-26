// #ifdef H5
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// #endif
import { isLogin, getToken, removeToken, hasRole, getUserRole, isRoleInit } from "@/utils/auth";
import { isHttp, isPathMatch } from "@/utils/validate";
import { isRelogin } from "@/utils/request";
import $bus from '@/plugins/bus';
import useUserStore from "@/store/modules/user";
// import useSettingsStore from '@/store/modules/settings';
// import useSettingsStore from '@/store/modules/settings';
// import usePermissionStore from '@/store/modules/permission';

const userStore = useUserStore();
// #ifdef H5
NProgress.configure({ showSpinner: false });
// #endif
import {
  SYS_ROLES,
  SYS_ROLE_KEYS,
  COACH,
  STUDENT,
  getRole,
  HOME_PATH as indexPath,
  LOGIN_PATH as loginPath,
  REGISTER_PATH as registerPath,
  PERM_WHITE_LIST as whiteList,
  SELECT_ROLE_PATH,
} from "@/utils/constants";

// const indexPath = "/pages/index/index";
// const loginPath = "/pages/login/login";
// const registerPath = "/pages/register/register";
// const whiteList = [loginPath, registerPath];

const isWhiteList = (path) => {
  return whiteList.some((pattern) => isPathMatch(pattern, path));
};

// const

// 用标记避免重复注册（开发环境很重要）
let isPermBound = false;
// 注册认证事件
const setupPermEvents = async () => {
  if (isPermBound) return;
  isPermBound = true;
  // 监听token过期事件
  $bus.on($bus.EVENT_TYPES.TOKEN_EXPIRED, async () => {
    // 调用用户信息的退出登录方法
    await userStore.logOut();

    // 跳转到登录页面重新登录
    uni.reLaunch({
      url: loginPath,
    });
  });
}
// 开启认证相关事件
setupPermEvents();
/**
 * 路由前置操作
 * @param {*路由配置项} args
 */
const beforeEach = (args) => {
  // 开启路由加载进度条
  // #ifdef H5
  NProgress.start();
  // #endif

  // if (getToken()) { //获取到了token 已经登录
  /** 检查是否登录 */
  if (!isLogin()) { // 没有登录
    /** 检查是否在白名单 */
    if (isWhiteList(args.url)) {
      // 在免登录白名单，直接进入
      // #ifdef H5
      NProgress.done();
      // #endif
      return args;
    }
    // 否则全部重定向到登录页
    args.url = `${loginPath}?redirect=${args.url}`;
    // #ifdef H5
    NProgress.done();
    // #endif
    return args;
  } // 已经登录

  // 设置目标页面的标题
  // to.meta.title && useSettingsStore().setTitle(to.meta.title)

  /** 已经登录，防止二次登录 */
  if (args.url === loginPath) {
    
    uni.showToast({ title: "您已登录，无需再次登录", type: "none" });
    args.url = indexPath;
    // #ifdef H5
    NProgress.done();
    // #endif
    return args;
  }

  /** 检查是否选择角色 */
  const roleKey = getUserRole();
  if (
    !SYS_ROLE_KEYS.includes(roleKey) // 未选择角色
    && args.url != SELECT_ROLE_PATH // 排除“角色选择页面”
  ) {
    // 未选择角色

    console.error("未选择角色: ", roleKey);
    uni.showToast({ title: "请选择角色" , type: "none" });
    args.url = SELECT_ROLE_PATH;
    // #ifdef H5
    NProgress.done();
    // #endif
    return args;
  }

  // 获取角色相关信息
  const role = getRole(roleKey);
  /** 判断所跳转的页面是否是对应角色可以访问的页面 */


  /** 判断角色信息是否完成初始化 */
  if (!isRoleInit(roleKey) // 没有完成初始化
    && true// 排除“角色初始化页面”
    ) { 
      // console.error("未完成必须设置，正在跳转设置~")
    uni.showToast({ title: "未完成必须设置，正在跳转设置~" , type: "none" });
    // 根据 roleKey 跳转对应角色的初始化页面
    args.url = role.initPath;
    // #ifdef H5
    NProgress.done();
    // #endif
    return args;
  }

  /** 放行 */
  // #ifdef H5
  NProgress.done();
  // #endif
  return args;
};

/**
 * 路由后置操作
 */
const afterEach = () => {
  // #ifdef H5
  NProgress.done();
  // #endif
};

// 添加所有路由方法的拦截器
const addAllInterceptors = () => {
  // 跳转拦截器配置
  const interceptorConfig = {
    invoke(args) {
      console.log("跳转前拦截:", args.url || args);
      console.log(args)
      const result = beforeEach(args);

      // 如果返回 false，阻止跳转
      if (result === false) {
        return false;
      }

      // 如果返回修改后的参数，使用新参数
      if (result && typeof result === "object") {
        return result;
      }


      // 默认返回原始参数
      return args;
    },
    success(args) {
      console.log("跳转成功:", args);
    },
    fail(err) {
      console.log("跳转失败:", err);
      // if(err.includes"redirectTo:fail can not redirectTo a tabbar page")
    },
    complete(res) {
      console.log("跳转结束:", res);
      afterEach();
    },
  };

  // 拦截 navigateTo（保留当前页面，跳转到应用内某个页面）
  uni.addInterceptor("navigateTo", interceptorConfig);

  // 拦截 redirectTo（关闭当前页面，跳转到应用内某个页面）
  uni.addInterceptor("redirectTo", interceptorConfig);

  // 拦截 reLaunch（关闭所有页面，打开到应用内某个页面）
  uni.addInterceptor("reLaunch", interceptorConfig);

  // 拦截 switchTab（跳转到 tabBar 页面）
  // uni.addInterceptor("switchTab", {
  //     ...interceptorConfig,
  //     // invoke(args) {
  //     //     console.log("跳转到Tab页:", args.url);

  //     //     // Tab切换的特殊处理
  //     //     const token = uni.getStorageSync('token');
  //     //     const needLoginTabs = ['/pages/user/index'];

  //     //     if (needLoginTabs.includes(args.url) && !token) {
  //     //         uni.showModal({
  //     //             title: '提示',
  //     //             content: '该功能需要登录，是否前往登录？',
  //     //             success(res) {
  //     //                 if (res.confirm) {
  //     //                     uni.navigateTo({
  //     //                         url: '/pages/login/index'
  //     //                     });
  //     //                 }
  //     //             }
  //     //         });
  //     //         return false;
  //     //     }

  //     //     const result = beforeEach(args);
  //     //     return result === false ? false : args;
  //     // }
  //     invoke(args) {
  //       console.log(args)
  //     }
  // });

  // 拦截 navigateBack（返回上一页面或多级页面）
  uni.addInterceptor("navigateBack", {
    invoke(args) {
      console.log("返回上一页，delta:", args.delta || 1);

      // 返回前的确认提示示例
      // const pages = getCurrentPages();
      // const currentPage = pages[pages.length - 1];

      // if (currentPage.route === 'pages/edit/index') {
      //   return new Promise((resolve, reject) => {
      //     uni.showModal({
      //       title: '提示',
      //       content: '内容尚未保存，确定返回吗？',
      //       success(res) {
      //         if (res.confirm) {
      //           resolve(args);
      //         } else {
      //           reject(new Error('用户取消返回'));
      //         }
      //       }
      //     });
      //   });
      // }

      return args;
    },
    success(args) {
      console.log("返回成功:", args);
    },
    fail(err) {
      console.log("返回失败:", err);
    },
    complete(res) {
      console.log("返回完成:", res);
      afterEach();
    },
  });

  console.log("所有路由拦截器已注册");
};

// 移除拦截器（如果需要）
// uni.removeInterceptor('navigateTo')

// 移除所有拦截器（如果需要）
const removeAllInterceptors = () => {
  uni.removeInterceptor("navigateTo");
  uni.removeInterceptor("redirectTo");
  uni.removeInterceptor("reLaunch");
  uni.removeInterceptor("switchTab");
  uni.removeInterceptor("navigateBack");
  console.log("所有路由拦截器已移除");
};

addAllInterceptors();
