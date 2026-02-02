import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
import { isHttp, isPathMatch } from "@/utils/validate";
import { isRelogin } from "@/utils/request";
import useUserStore from "@/store/modules/user";
// import useSettingsStore from '@/store/modules/settings'
// import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const indexPath = "/pages/index/index";
const loginPath = "/pages/login/login";
const registerPath = "/pages/register/register";
const whiteList = [loginPath, registerPath];

const isWhiteList = (path) => {
    return whiteList.some((pattern) => isPathMatch(pattern, path));
};

/**
 * 路由前置操作
 * @param {*路由配置项} args
 */
const beforeEach = (args) => {
    // 开启进度条
    NProgress.start();

    if (getToken()) { //获取到了token
        // 设置目标页面的标题
        // to.meta.title && useSettingsStore().setTitle(to.meta.title)
        if (args.url === loginPath) {
            //已经登录，防止二次登录
            args.url = indexPath;
            NProgress.done();
        } else if (isWhiteList(args.url)) {
            // 白名单，例如注册
            return args;
        } else {
            // 普通路径
            if (useUserStore().roles.length === 0) {
                isRelogin.show = true;
                // 判断当前用户是否已拉取完user_info信息
                useUserStore()
                    .getInfo()
                    .then(() => {
                        isRelogin.show = false;
                        // 创建路由
                        // usePermissionStore()
                        //     .generateRoutes()
                        //     .then((accessRoutes) => {
                        //         // 根据roles权限生成可访问的路由表
                        //         accessRoutes.forEach((route) => {
                        //             if (!isHttp(route.path)) {
                        //                 // console.log("6: ",route.path)
                        //                 // route.path = route.path.startsWith('/') ? route.path : '/' + route.path;
                        //                 router.addRoute(route); // 动态添加可访问路由表
                        //             }
                        //         });
                        //         // console.log('确保addRoutes已完成,\n从:', from.path, '到:', to.path)
                        //         next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
                        //     });
                        return args;
                    })
                    .catch((err) => {
                        useUserStore()
                            .logOut()
                            .then(() => {
                                uni.showToast({
                                    title: err || '未登录',
                                    icon: 'none'
                                });
                                args.url = indexPath;
                                return args;

                            });
                    });
            } else {
                // console.log('end,\n从:', from.path, '到:', to.path)

                // console.log('路由跳转:', `从 ${from.path} 到 ${to.path}`)
                return args;
            }
        }
    } else { // 没有token
        if (isWhiteList(args.url)) {
            // 在免登录白名单，直接进入
            return args;
        } else { // 否则全部重定向到登录页
            args.url = `${loginPath}?redirect=${args.url}`
            NProgress.done();
            return args;
        }
    }
};


/**
 * 路由后置操作
 */
const afterEach = () => {
    NProgress.done()
}

// 拦截 navigateTo
// uni.addInterceptor("navigateTo", {
//     // 跳转前拦截
//     invoke(args) {
//         console.log("跳转前:", args);
//         console.log("跳转前:", args.url);

//         // 权限验证示例
//         // const authStore = useAuthStore()
//         // if (args.url.includes('/user') && !authStore.isLogin) {
//         //   uni.showToast({
//         //     title: '请先登录',
//         //     icon: 'none'
//         //   })

//         //   // 重定向到登录页
//         //   setTimeout(() => {
//         //     uni.navigateTo({
//         //       url: '/pages/login/login'
//         //     })
//         //   }, 1500)

//         //   // 阻止原跳转
//         //   return false
//         // }

//         // 添加公共参数
//         // args.url =
//         //     args.url +
//         //     (args.url.includes("?") ? "&" : "?") +
//         //     "timestamp=" +
//         //     Date.now();

//         return beforeEach(args);
//     },

//     // 跳转成功回调
//     success(args) {
//         console.log("跳转成功:", args);
//     },

//     // 跳转失败回调
//     fail(err) {
//         console.log("跳转失败:", err);
//     },

//     // 跳转完成回调（无论成功失败）
//     complete(res) {
//         console.log("跳转完成:", res);
//         afterEach();
//     },
// });


// // 拦截 navigateTo
// uni.addInterceptor("navigateTo", {
//     // 跳转前拦截
//     invoke(args) {
//         console.log("跳转前:", args);
//         console.log("跳转前:", args.url);
//         return beforeEach(args);
//     },

//     // 跳转成功回调
//     success(args) {
//         console.log("跳转成功:", args);
//     },

//     // 跳转失败回调
//     fail(err) {
//         console.log("跳转失败:", err);
//     },

//     // 跳转完成回调（无论成功失败）
//     complete(res) {
//         console.log("跳转完成:", res);
//         afterEach();
//     },
// });

// 同样可以拦截其他跳转方法
// uni.addInterceptor("redirectTo", {
//     invoke(args) {
//         // 处理逻辑
//         return args;
//     },
// });

// uni.addInterceptor("reLaunch", {
//     invoke(args) {
//         // 处理逻辑
//         return args;
//     },
// });

// 添加所有路由方法的拦截器
const addAllInterceptors = () => {
    // 跳转拦截器配置
    const interceptorConfig = {
        invoke(args) {
            console.log("跳转前拦截:", args.url || args);
            const result = beforeEach(args);

            // 如果返回 false，阻止跳转
            if (result === false) {
                return false;
            }

            // 如果返回修改后的参数，使用新参数
            if (result && typeof result === 'object') {
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
        },
        complete(res) {
            console.log("跳转完成:", res);
            afterEach();
        }
    };

    // 拦截 navigateTo（保留当前页面，跳转到应用内某个页面）
    uni.addInterceptor("navigateTo", interceptorConfig);

    // 拦截 redirectTo（关闭当前页面，跳转到应用内某个页面）
    uni.addInterceptor("redirectTo", interceptorConfig);

    // 拦截 reLaunch（关闭所有页面，打开到应用内某个页面）
    uni.addInterceptor("reLaunch", interceptorConfig);

    // 拦截 switchTab（跳转到 tabBar 页面）
    uni.addInterceptor("switchTab", {
        ...interceptorConfig,
        invoke(args) {
            console.log("跳转到Tab页:", args.url);

            // Tab切换的特殊处理
            const token = uni.getStorageSync('token');
            const needLoginTabs = ['/pages/user/index'];

            if (needLoginTabs.includes(args.url) && !token) {
                uni.showModal({
                    title: '提示',
                    content: '该功能需要登录，是否前往登录？',
                    success(res) {
                        if (res.confirm) {
                            uni.navigateTo({
                                url: '/pages/login/index'
                            });
                        }
                    }
                });
                return false;
            }

            const result = beforeEach(args);
            return result === false ? false : args;
        }
    });

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
        }
    });

    console.log('所有路由拦截器已注册');
};

// 移除拦截器（如果需要）
// uni.removeInterceptor('navigateTo')

// 移除所有拦截器（如果需要）
const removeAllInterceptors = () => {
    uni.removeInterceptor('navigateTo');
    uni.removeInterceptor('redirectTo');
    uni.removeInterceptor('reLaunch');
    uni.removeInterceptor('switchTab');
    uni.removeInterceptor('navigateBack');
    console.log('所有路由拦截器已移除');
};


addAllInterceptors();