// // import router from './router'
// import { ElMessage } from 'element-plus'
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
// import { getToken } from '@/utils/auth'
// import { isHttp, isPathMatch } from '@/utils/validate'
// import { isRelogin } from '@/utils/request'
// import useUserStore from '@/store/modules/user'
// // import useSettingsStore from '@/store/modules/settings'
// // import usePermissionStore from '@/store/modules/permission'

// NProgress.configure({ showSpinner: false })

// const whiteList = ['/login', '/register']

// const isWhiteList = (path) => {
//   return whiteList.some(pattern => isPathMatch(pattern, path))
// }

// /**
//  * 路由跳转拦截认证，将main.js中内容抽离至此
//  */


// router.beforeEach((to, from, next) => {
//   // console.log('从:', from.path, '到:', to.path)

//   NProgress.start()
//   if (getToken()) {
//     // 设置标题
//     console.log("/src/permission.js:\n设置标题")
//     // to.meta.title && useSettingsStore().setTitle(to.meta.title)
//     /* has token*/
//     if (to.path === '/login') {
//       next({ path: '/' })
//       NProgress.done()
//     } else if (isWhiteList(to.path)) {
//       next()
//     } else {
//       if (useUserStore().roles.length === 0) {
//         isRelogin.show = true
//         // 判断当前用户是否已拉取完user_info信息
//         useUserStore().getInfo().then(() => {
//           isRelogin.show = false
//           // 创建路由
//           console.log("/src/permission.js:\n根据roles权限生成可访问的路由表")
//           // usePermissionStore().generateRoutes().then(accessRoutes => {
//           //   // 根据roles权限生成可访问的路由表
//           //   accessRoutes.forEach(route => {
//           //     if (!isHttp(route.path)) {
//           //       // console.log("6: ",route.path)
//           //       // route.path = route.path.startsWith('/') ? route.path : '/' + route.path;
//           //       router.addRoute(route) // 动态添加可访问路由表
//           //     }
//           //   })
//           //   // console.log('确保addRoutes已完成,\n从:', from.path, '到:', to.path)
//           //   next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
//           // })
//         }).catch(err => {
//           useUserStore().logOut().then(() => {
//             uni.showToast({
//               title: err || '登录失败',
//               icon: 'none'
//             })
//             // ElMessage.error(err)
//             next({ path: '/' })
//           })
//         })
//       } else {
//         // console.log('end,\n从:', from.path, '到:', to.path)

//         // console.log('路由跳转:', `从 ${from.path} 到 ${to.path}`)
//         next()
//       }
//     }
//   } else {
//     // 没有token
//     if (isWhiteList(to.path)) {
//       // 在免登录白名单，直接进入
//       next()
//     } else {
//       next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
//       NProgress.done()
//     }
//   }
// })

// router.afterEach(() => {
//   NProgress.done()
// })
