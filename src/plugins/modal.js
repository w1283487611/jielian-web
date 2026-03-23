let loadingInstance = null

export default {
  // 消息提示
  msg(content) {
    uni.showToast({
      title: content,
      icon: 'none'
    })
  },

  // 错误消息
  msgError(content) {
    uni.showToast({
      title: content,
      icon: 'none'
    })
  },

  // 成功消息
  msgSuccess(content) {
    uni.showToast({
      title: content,
      icon: 'success'
    })
  },

  // 警告消息
  msgWarning(content) {
    uni.showToast({
      title: content,
      icon: 'none'
    })
  },

  // 弹出提示
  alert(content) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '系统提示',
        content,
        showCancel: false,
        success: () => resolve()
      })
    })
  },

  // 错误提示
  alertError(content) {
    return this.alert(content)
  },

  // 成功提示
  alertSuccess(content) {
    return this.alert(content)
  },

  // 警告提示
  alertWarning(content) {
    return this.alert(content)
  },

  // 通知提示（用toast模拟）
  notify(content) {
    uni.showToast({
      title: content,
      icon: 'none'
    })
  },

  notifyError(content) {
    this.msgError(content)
  },

  notifySuccess(content) {
    this.msgSuccess(content)
  },

  notifyWarning(content) {
    this.msgWarning(content)
  },

  // 确认框
  confirm(content) {
    return new Promise((resolve, reject) => {
      uni.showModal({
        title: '系统提示',
        content,
        success: (res) => {
          if (res.confirm) {
            resolve(true)
          } else {
            reject(false)
          }
        }
      })
    })
  },

  // 输入框（uni没有原生prompt，需模拟）
  prompt(content) {
    return new Promise((resolve, reject) => {
      uni.showModal({
        title: '系统提示',
        editable: true, // ⚠️ App/H5支持，小程序部分平台不支持
        placeholderText: content,
        success: (res) => {
          if (res.confirm) {
            resolve(res.content)
          } else {
            reject()
          }
        }
      })
    })
  },

  // 打开加载
  loading(content = '加载中...') {
    uni.showLoading({
      title: content,
      mask: true
    })
    loadingInstance = true
  },

  // 关闭加载
  closeLoading() {
    if (loadingInstance) {
      uni.hideLoading()
      loadingInstance = null
    }
  }
}