// utils/student.js - 使用 UniApp 存储 API
import useStudentStore from "@/store/modules/student";

import {
  STUDENT_STORAGE_KEY, STUDENT_SUBJECT_ID_STORAGE_KEY
} from "@/utils/constants";
const studentStore = useStudentStore();

// export function hasStudy() {
//   if(studentStore.subjectId) return true;
//   if()
//   return uni.getStorageSync(STUDENT_STORAGE_KEY);

//   return false;
// }

export function hasStudy() {
  if(studentStore.subjectId) return true;
  if(uni.getStorageSync(STUDENT_SUBJECT_ID_STORAGE_KEY)) return true;
  // return uni.getStorageSync(STUDENT_STORAGE_KEY);

  return false;
}
/**
 *
 */
export function getStudy() {
  const storeSID = studentStore.subjectId;
  const storeLID = studentStore.licenseId;
  if(storeSID && storeLID) return {subjectId: storeSID, licenseId: storeLID};
  
  const subjectId = uni.getStorageSync(STUDENT_SUBJECT_ID_STORAGE_KEY);
}

// 设置 Student
export function setStudy({licenseId, subjectId}) {
  try {
    studentStore.setStudy({licenseId, subjectId});
    uni.setStorageSync(STUDENT_SUBJECT_ID_STORAGE_KEY, subjectId);
    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
}

// Storage 存储
/**
 *
 */
export function getStudent() {
  return uni.getStorageSync(STUDENT_STORAGE_KEY);
}

// 设置 Student
export function setStudent(student, expires = 7) {
  // expires 参数保持兼容，但 UniApp 存储不支持自动过期
  return uni.setStorageSync(STUDENT_STORAGE_KEY, student);
}

// 移除 Student
export function removeStudent() {
  return uni.removeStorageSync(STUDENT_STORAGE_KEY);
}

// 异步版本（可选）
export async function getStudentAsync() {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: STUDENT_STORAGE_KEY,
      success: (res) => resolve(res.data),
      fail: reject,
    });
  });
}

export async function setStudentAsync(student) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: STUDENT_STORAGE_KEY,
      data: student,
      success: resolve,
      fail: reject,
    });
  });
}

export async function removeStudentAsync() {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: STUDENT_STORAGE_KEY,
      success: resolve,
      fail: reject,
    });
  });
}
