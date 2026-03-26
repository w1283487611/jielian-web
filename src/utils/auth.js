import { isTokenExpired, isTokenExpiring } from "@/utils/jwt";
// import Cookies from 'js-cookie'

// const TokenKey = 'Admin-Token'

// export function getToken() {
//   return Cookies.get(TokenKey)
// }

// export function setToken(token) {
//   return Cookies.set(TokenKey, token)
// }

// export function removeToken() {
//   return Cookies.remove(TokenKey)
// }

// utils/auth.js - 使用 UniApp 存储 API
import { 
  ROLE_INIT_STORAGE_KEY as RoleInitKey,
  ROLE_STORAGE_KEY as RoleKey,
  USER_STORAGE_KEY as UserKey,
  TOKEN_STORAGE_KEY as TokenKey,
  TOKEN_EXPIRE_STORAGE_KEY as Expire_Key
} from "@/utils/constants";

// const TokenKey = 'Login-Token';
// const UserKey = 'Login-User';
// const RoleKey = 'User-Role';

// Token
// 获取 Token
export function getToken() {
  return uni.getStorageSync(TokenKey);
}

// 设置 Token
export function setToken(token, expires = 7 * 24 * 3600 * 1000) {
  // expires 参数保持兼容，但 UniApp 存储不支持自动过期
  return uni.setStorageSync(TokenKey, token);
  // 设置token过期时间
  // uni.setStorageSync(Expire_Key, Date.now() + expires);
}

// 移除 Token
export function removeToken() {
  return uni.removeStorageSync(TokenKey)
}

// 异步版本（可选）
export async function getTokenAsync() {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: TokenKey,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

export async function setTokenAsync(token) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: TokenKey,
      data: token,
      success: resolve,
      fail: reject
    })
  })
}

export async function removeTokenAsync() {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: TokenKey,
      success: resolve,
      fail: reject
    })
  })
}

// UserRole 用户当前使用的角色
// 获取 Token
export function getUserRole() {
  return uni.getStorageSync(RoleKey)
}

// 设置 Token
export function setUserRole(role, expires = 7) {
  // expires 参数保持兼容，但 UniApp 存储不支持自动过期
  return uni.setStorageSync(RoleKey, role)
}

// 移除 Token
export function removeUserRole() {
  return uni.removeStorageSync(RoleKey)
}

// 异步版本（可选）
export async function getUserRoleAsync() {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: RoleKey,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

export async function setUserRoleAsync(role) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: RoleKey,
      data: role,
      success: resolve,
      fail: reject
    })
  })
}

export async function removeUserRoleAsync() {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: RoleKey,
      success: resolve,
      fail: reject
    })
  })
}


// UserRoleInit 用户当前使用的角色是否初始化
// 获取 用户当前使用的角色是否初始化
export function getUserRoleInit(roleKey) {
  return uni.getStorageSync(RoleInitKey+':'+roleKey);
}

// 设置 用户当前使用的角色初始化
export function setUserRoleInit(roleKey, init = 1) {
  return uni.setStorageSync(RoleInitKey+':'+roleKey, init);
}

// 移除 用户当前使用的角色是否初始化
export function removeUserRoleInit() {
  return uni.removeStorageSync(RoleInitKey)
}

// 异步版本
export async function getUserRoleInitAsync(roleKey) {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: RoleInitKey+':'+roleKey,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

export async function setUserRoleInitAsync(roleKey,init=1) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: RoleInitKey+':'+roleKey,
      data: init,
      success: resolve,
      fail: reject
    })
  })
}

export async function removeUserRoleInitAsync() {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: RoleInitKey,
      success: resolve,
      fail: reject
    })
  })
}

// =========================
// ⭐状态判断（关键）
// =========================
// 是否登录
export function isLogin() {
  const token = getToken();
  if (token === null || token === undefined || token === "") return false;


  // isTokenExpiring
  // 检查token是否过期
  if(isTokenExpired(token)) {
    // 过期，异步删除token
    // removeTokenAsync();
    // 发布token失效通知事件
    // $bus.emit($bus.EVENT_TYPES.TOKEN_EXPIRED);
    return false;
  } 
  // 获取token过期时间
  // const expire = Number(uni.getStorageSync(Expire_Key));
  // return Date.now() < expire;
  // return !!getToken()

  return true;
}


// 是否选择角色
export function hasRole() {
  // const role = getUserRole();
  // if (role === null || role === undefined) return false;

  // return true;
  // return !!getUserRole();
}

// 对应角色是否初始化
export function isRoleInit(roleKey) {
  // const roleInit = getUserRoleInit();
  // if (roleInit === null || roleInit === undefined) return false;

  // console.log(!!roleInit)
  // return true;

  return !!getUserRoleInit(roleKey);
}

// // =========================
// // ⭐统一登录写入（强烈推荐）
// // =========================
// export function setAuth(data) {
//   const { token, role, userInfo } = data

//   if (token) setToken(token)
//   if (role) setUserRole(role)
//   if (userInfo) setUserInfo(userInfo)
// }

// // =========================
// // ⭐统一清理（退出登录）
// // =========================
// export function clearAuth() {
//   removeToken()
//   removeUserRole()
//   removeUserInfo()
// }