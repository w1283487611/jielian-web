// common/constants/role.js
/**
 * STORAGE 用户当前角色存储KEY
 */
export const STORAGE_KEY = "user_role";

/**
 * 系统角色 - 教练
 */
export const COACH = {
    id: 3,
    roleName: "教练",
    roleKey: "coach",

}
/**
 * 系统角色 - 学员
 */
export const STUDENT = {
    id: 4,
    roleName: "学员",
    roleKey: "student",
    
}

/**
 * 系统角色
 */
export const SYS_ROLES = [ COACH, STUDENT ]

/**
 * 系统角色KEY
 */
export const SYS_ROLE_KEYS = [ COACH.roleKey, STUDENT.roleKey ]