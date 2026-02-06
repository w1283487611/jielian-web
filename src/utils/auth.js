/**
 * 从存储空间读取数据
 */
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
  ROLE_STORAGE_KEY as RoleKey,
  USER_STORAGE_KEY as UserKey,
  TOKEN_STORAGE_KEY as TokenKey
} from "@/utils/constants";

// const TokenKey = 'Login-Token';
// const UserKey = 'Login-User';
// const RoleKey = 'User-Role';

// Token
// 获取 Token
export function getToken() {
  return uni.getStorageSync(TokenKey)
}

// 设置 Token
export function setToken(token, expires = 7) {
  // expires 参数保持兼容，但 UniApp 存储不支持自动过期
  return uni.setStorageSync(TokenKey, token)
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