import { defineStore } from "pinia";

import { login, logout, getInfo } from "@/api/login";
import {
  getToken, setToken, removeToken,
  getUserRole, setUserRole, removeUserRole 
} from "@/utils/auth";
import { isHttp, isEmpty } from "@/utils/validate";
import defAva from "@/assets/images/profile.jpg";

import { 
 SYS_ROLES, SYS_ROLE_KEYS, COACH, STUDENT
} from "@/utils/constants";

/**
 * 用户登录信息Store
 */
const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken(),
    id: "",
    name: "",
    username: "",
    nickName: "",
    avatar: "",
    phone: "",
    roleId: "",
    /** 当前角色：student | coach */
    role: getUserRole(),
    roles: [],
    permissions: [],
    user: undefined,
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then((res) => {
            // 将token存储
            setToken(res.token);
            // console.log(this);
            // 存储数据到store
            this.token = res.token;
            this.getInfo();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.user;
            let avatar = user.avatar || "";
            if (!isHttp(avatar)) {
              avatar = isEmpty(avatar)
                ? defAva
                : import.meta.env.VITE_APP_BASE_API + avatar;
            }
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.roles;
              this.permissions = res.permissions;
            } else {
              this.roles = ["ROLE_DEFAULT"];
            }
            this.id = user.userId;
            this.roleId = user.roleId;
            this.username = user.username;
            this.nickName = user.nickName;
            this.avatar = avatar;
            this.phone = user.phone;
            this.user = user;
            // /* 初始密码提示 */
            // if (res.isDefaultModifyPwd) {
            //   ElMessageBox.confirm(
            //     "您的密码还是初始密码，请修改密码！",
            //     "安全提示",
            //     {
            //       confirmButtonText: "确定",
            //       cancelButtonText: "取消",
            //       type: "warning",
            //     }
            //   )
            //     .then(() => {
            //       // router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
            //       console.log("路由跳转");
            //     })
            //     .catch(() => {});
            // }
            // /* 过期密码提示 */
            // if (!res.isDefaultModifyPwd && res.isPasswordExpired) {
            //   ElMessageBox.confirm(
            //     "您的密码已过期，请尽快修改密码！",
            //     "安全提示",
            //     {
            //       confirmButtonText: "确定",
            //       cancelButtonText: "取消",
            //       type: "warning",
            //     }
            //   )
            //     .then(() => {
            //       // router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
            //       console.log("路由跳转");
            //     })
            //     .catch(() => {});
            // }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = "";
            this.roles = [];
            this.permissions = [];
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /**
     * 切换角色: student/coach
     */
    setRole(role) {
      if (!SYS_ROLE_KEYS.includes(role)) return;
      // if (role !== "student" && role !== "coach") return;
      if (this.role === role) return;
      this.role = role;

      setUserRole(this.role);
    },
  },
  // 持久化配置
  persist: {
    key: "user_state",
    paths: ["token", "getInfo","role"],
  },
});

export default useUserStore;
