// utils/router.js
class Router {
  constructor() {
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  // 添加前置守卫
  beforeEach(callback) {
    this.beforeEachHooks.push(callback);
  }

  // 添加后置守卫
  afterEach(callback) {
    this.afterEachHooks.push(callback);
  }

  // 封装 navigateTo
  navigateTo(options) {
    return this._interceptAndNavigate("navigateTo", options);
  }

  // 封装 redirectTo
  redirectTo(options) {
    return this._interceptAndNavigate("redirectTo", options);
  }

  // 封装 switchTab
  switchTab(options) {
    return this._interceptAndNavigate("switchTab", options);
  }

  // 封装 reLaunch
  reLaunch(options) {
    return this._interceptAndNavigate("reLaunch", options);
  }

  // 封装 navigateBack
  navigateBack(options) {
    return uni.navigateBack(options);
  }

  // 拦截和导航的通用方法
  async _interceptAndNavigate(method, options) {
    const { url, success, fail, complete, ...rest } = options;

    // 执行前置守卫
    for (const hook of this.beforeEachHooks) {
      const result = await hook({ url, method });
      if (result === false) {
        return Promise.reject(new Error("Navigation aborted"));
      }
      if (typeof result === "object") {
        Object.assign(options, result);
      }
    }

    return new Promise((resolve, reject) => {
      uni[method]({
        url,
        ...rest,
        success: (res) => {
          // 执行后置守卫
          this.afterEachHooks.forEach((hook) => hook({ url, method }));
          success && success(res);
          resolve(res);
        },
        fail: (err) => {
          fail && fail(err);
          reject(err);
        },
        complete: (res) => {
          complete && complete(res);
        },
      });
    });
  }
}

// 创建单例
export const router = new Router();

// 使用示例
router.beforeEach((to) => {
  console.log("跳转到:", to.url);

  // 登录检查
  const token = uni.getStorageSync("token");
  if (to.url.includes("/user") && !token) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });

    // 重定向到登录页
    setTimeout(() => {
      router.navigateTo({ url: "/pages/login/login" });
    }, 1500);

    return false; // 阻止跳转
  }

  // 可以修改跳转参数
  return {
    ...to,
    url: to.url + "?from=interceptor",
  };
});

router.afterEach((to) => {
  console.log("跳转完成:", to.url);
  // 发送页面浏览统计等
});

export default router;
