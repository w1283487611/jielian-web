import { defineStore } from 'pinia'

/**
 * ===============================
 * 1️⃣ TabBar 配置（只作为“模板”，永不直接使用）
 * ===============================
 */
const STUDENT_TAB_TEMPLATE = [
  {
    pagePath: '/pages/tabbar/student/index/index',
    text: '首页',
    iconPath: '/static/assets/images/tabbar/home.png',
    selectedIconPath: '/static/assets/images/tabbar/homeHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/student/appoint/appoint',
    text: '预约',
    iconPath: '/static/assets/images/tabbar/appoint.png',
    selectedIconPath: '/static/assets/images/tabbar/appointHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/student/test/test',
    text: '学员',
    iconPath: '/static/assets/images/tabbar/personal.png',
    selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/student/my/my',
    text: '我的',
    iconPath: '/static/assets/images/tabbar/personal.png',
    selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
    badge: 0
  }
]

const COACH_TAB_TEMPLATE = [
  {
    pagePath: '/pages/tabbar/coach/index/index',
    text: '首页',
    iconPath: '/static/assets/images/tabbar/home.png',
    selectedIconPath: '/static/assets/images/tabbar/homeHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/coach/category/category',
    text: '分类',
    iconPath: '/static/assets/images/tabbar/personal.png',
    selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/coach/cart/cart',
    text: '教练',
    iconPath: '/static/assets/images/tabbar/personal.png',
    selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
    badge: 0
  },
  {
    pagePath: '/pages/tabbar/coach/my/my',
    text: '我的',
    iconPath: '/static/assets/images/tabbar/personal.png',
    selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
    badge: 0
  }
]

/**
 * ===============================
 * 2️⃣ 工具函数（核心：深拷贝）
 * ===============================
 */
function cloneTabList(list) {
  return list.map(item => ({ ...item }))
}

/**
 * ===============================
 * 3️⃣ Store 定义
 * ===============================
 */
const useTabbarStore = defineStore('tabbar', {
  state: () => ({
    /** 当前 TabBar 列表（一定是“拷贝后的新对象”） */
    tabList: cloneTabList(STUDENT_TAB_TEMPLATE),

    /** 当前选中索引 */
    selectedIndex: 0,

    /** 是否显示 TabBar */
    showTabBar: true,

    /** 不显示 TabBar 的页面 */
    hideTabBarPages: [
      '/pages/login/login',
      '/pages/register/register'
    ]
  }),

  actions: {
    /**
     * 切换 Tab（只做合法 switchTab）
     */
    switchTab(index) {
      if (index === this.selectedIndex) return
      if (!this.tabList[index]) return

      this.selectedIndex = index

      uni.switchTab({
        url: this.tabList[index].pagePath
      })
    },

    /**
     * 更新 badge（安全写法）
     */
    updateBadge(index, count) {
      if (!this.tabList[index]) return

      this.tabList[index] = {
        ...this.tabList[index],
        badge: count
      }
    },

    /**
     * 根据路由显示 / 隐藏 TabBar
     */
    checkTabBarVisibility(route) {
      this.showTabBar = !this.hideTabBarPages.includes(route)
    },

    /**
     * 切换角色的tabbar（核心逻辑）
     */
    switchRole(roleId) {
      let role = '';
      if(roleId === 3) role = 'coach';
      else if(roleId === 4) role = 'student';
      if (role !== 'student' && role !== 'coach') return

      this.role = role
      this.selectedIndex = 0

      this.tabList = cloneTabList(
        role === 'coach'
          ? COACH_TAB_TEMPLATE
          : STUDENT_TAB_TEMPLATE
      )
    },

    /**
     * 从本地存储恢复（安全版）
     */
    initFromStorage() {
      try {
        const saved = uni.getStorageSync('tabbar_state')
        if (!saved) return

        const data = JSON.parse(saved)

        if (data.role === 'student' || data.role === 'coach') {
          this.role = data.role
        }

        this.tabList = cloneTabList(
          this.role === 'coach'
            ? COACH_TAB_TEMPLATE
            : STUDENT_TAB_TEMPLATE
        )

        if (typeof data.selectedIndex === 'number') {
          this.selectedIndex = data.selectedIndex
        }

        if (typeof data.showTabBar === 'boolean') {
          this.showTabBar = data.showTabBar
        }
      } catch (e) {
        console.warn('[tabbar] 存储失败:', e)
      }
    }
  },

  /**
   * ===============================
   * 4️⃣ 持久化（只存“最小必要数据”）
   * ===============================
   */
  persist: {
    key: 'tabbar_state',
    paths: [ 'selectedIndex', 'showTabBar']
  }
})

export default useTabbarStore