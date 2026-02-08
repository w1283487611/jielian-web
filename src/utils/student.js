// utils/student.js - 使用 UniApp 存储 API
import useStudentStore from "@/store/modules/student";

import {
  ROLE_STORAGE_KEY as RoleKey,
  USER_STORAGE_KEY as UserKey,
  TOKEN_STORAGE_KEY as TokenKey,
} from "@/utils/constants";
const studentStore = useStudentStore();

// export function hasStudy() {
//   if(studentStore.subjectId) return true;
//   if()
//   return uni.getStorageSync(TokenKey);

//   return false;
// }

// export function hasStudy() {
//   if(studentStore.subjectId) return true;
//   if()
//   return uni.getStorageSync(TokenKey);

//   return false;
// }
// Storage 文件存储
/**
 *
 */
export function getToken() {
  return uni.getStorageSync(TokenKey);
}

// 设置 Token
export function setToken(token, expires = 7) {
  // expires 参数保持兼容，但 UniApp 存储不支持自动过期
  return uni.setStorageSync(TokenKey, token);
}

// 移除 Token
export function removeToken() {
  return uni.removeStorageSync(TokenKey);
}

// 异步版本（可选）
export async function getTokenAsync() {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: TokenKey,
      success: (res) => resolve(res.data),
      fail: reject,
    });
  });
}

export async function setTokenAsync(token) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: TokenKey,
      data: token,
      success: resolve,
      fail: reject,
    });
  });
}

export async function removeTokenAsync() {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: TokenKey,
      success: resolve,
      fail: reject,
    });
  });
}
