import { defineStore } from 'pinia';

const studentList = [
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
      badge: 3
    },
    {
      pagePath: '/pages/tabbar/student/my/my',
      text: '我的',
      iconPath: '/static/assets/images/tabbar/personal.png',
      selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
      badge: 0
    }
  ];


const coachList = [
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
      badge: 3
    },
    {
      pagePath: '/pages/tabbar/coach/my/my',
      text: '我的',
      iconPath: '/static/assets/images/tabbar/personal.png',
      selectedIconPath: '/static/assets/images/tabbar/personalHL.png',
      badge: 0
    }
  ];


const useTabbarStore = defineStore('tabbar', {
  state: () => ({
    // TabBar 数据
    tabList: studentList
    // [
    //   {
    //     pagePath: '/pages/index/index',
    //     text: '首页',
    //     iconPath: '/static/tabbar/home.png',
    //     selectedIconPath: '/static/tabbar/home-active.png',
    //     badge: 0
    //   },
    //   {
    //     pagePath: '/pages/category/category',
    //     text: '分类',
    //     iconPath: '/static/tabbar/category.png',
    //     selectedIconPath: '/static/tabbar/category-active.png',
    //     badge: 0
    //   },
    //   {
    //     pagePath: '/pages/cart/cart',
    //     text: '购物车',
    //     iconPath: '/static/tabbar/cart.png',
    //     selectedIconPath: '/static/tabbar/cart-active.png',
    //     badge: 3
    //   },
    //   {
    //     pagePath: '/pages/user/user',
    //     text: '我的',
    //     iconPath: '/static/tabbar/user.png',
    //     selectedIconPath: '/static/tabbar/user-active.png',
    //     badge: 0
    //   }
    // ]
    ,
    // 当前选中索引
    selectedIndex: 0,
    // TabBar 是否显示
    showTabBar: true,
    // 隐藏 TabBar的页面（某些页面需要）
    hideTabBarPages: [
      '/pages/login/login',
      '/pages/register/register'
    ]
  }),

  actions: {
    // 切换 Tab
    switchTab(index) {
      if (this.selectedIndex === index) return
      this.selectedIndex = index
      
      // 跳转到对应页面
      const page = this.tabList[index]
      uni.switchTab({
        url: page.pagePath
      })
    },

    // 更新 badge 数量
    updateBadge(index, count) {
      if (index >= 0 && index < this.tabList.length) {
        this.tabList[index].badge = count
      }
    },

    // 根据页面路径判断是否显示 TabBar
    checkTabBarVisibility(route) {
      this.showTabBar = !this.hideTabBarPages.includes(route)
    },

    // 从本地存储初始化数据
    initFromStorage() {
      try {
        const savedData = uni.getStorageSync('tabbar_state')
        if (savedData) {
          Object.assign(this.$state, JSON.parse(savedData))
        }
      } catch (e) {
        console.error('从本地存储初始化 TabBar 失败:', e)
      }
    },

    // 手动保存到本地存储
    saveToStorage() {
      try {
        uni.setStorageSync('tabbar_state', JSON.stringify(this.$state))
      } catch (e) {
        console.error('保存 TabBar 状态失败:', e)
      }
    },
    // 切换 Tab
    switchRole(roleId) {
        // 3: 教练，4：学员
        this.tabList = roleId === 3 ? coachList : studentList;
        this.saveToStorage();
    },

  },

  // 持久化配置
  persist: {
    key: 'tabbar_state',
    // paths: ['tabList', 'selectedIndex']
  }
})

export default useTabbarStore;