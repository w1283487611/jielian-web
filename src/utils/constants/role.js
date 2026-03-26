import {
    STUDENT_HOME_PATH, COACH_HOME_PATH,
    STUDENT_GUIDE_PATH, COACH_GUIDE_PATH,
} from "./route";
// common/constants/role.js
/**
 * STORAGE 用户当前角色存储KEY
 */
export const ROLE_STORAGE_KEY = "User-Role";
/**
 * 用户当前角色是否初始化存储KEY
 */
export const ROLE_INIT_STORAGE_KEY = "User-Role-Init";

/**
 * 系统角色 - 教练
 */
export const COACH = {
    id: 3,
    roleName: "教练",
    roleKey: "coach",
    path: COACH_HOME_PATH,
    initPath: COACH_GUIDE_PATH
}
/**
 * 系统角色 - 学员
 */
export const STUDENT = {
    id: 4,
    roleName: "学员",
    roleKey: "student",
    path: STUDENT_HOME_PATH,
    initPath: STUDENT_GUIDE_PATH
}

/**
 * 系统角色
 */
export const SYS_ROLES = [ COACH, STUDENT ]

/**
 * 系统角色KEY
 */
export const SYS_ROLE_KEYS = [ COACH.roleKey, STUDENT.roleKey ]

// 方法 //
export const getRole = (roleKey) => {
    const role = SYS_ROLES.find(item => item.roleKey === roleKey);
    return role ? role : null;
}

export const getRoleName = (roleKey) => {
    const role = SYS_ROLES.find(item => item.roleKey === roleKey);
    return role ? role.roleName : null;
}
