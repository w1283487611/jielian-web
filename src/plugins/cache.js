// 内存缓存，用于模拟非H5端的 session 缓存
const sessionData = {}

const sessionCache = {
  set (key, value) {
    // #ifdef H5
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value)
      return
    }
    // #endif
    if (key != null && value != null) {
      sessionData[key] = value
    }
  },
  get (key) {
    // #ifdef H5
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key)
    }
    // #endif
    if (key == null) {
      return null
    }
    return sessionData[key] || null
  },
  setJSON (key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON (key) {
    const value = this.get(key)
    if (value != null) {
      try {
        return JSON.parse(value)
      } catch (e) {
        console.error('sessionCache getJSON error:', e)
        return null
      }
    }
    return null
  },
  remove (key) {
    // #ifdef H5
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key)
      return
    }
    // #endif
    delete sessionData[key]
  }
}

const localCache = {
  set (key, value) {
    if (key != null && value != null) {
      uni.setStorageSync(key, value)
    }
  },
  get (key) {
    if (key == null) {
      return null
    }
    const val = uni.getStorageSync(key)
    // uni.getStorageSync 即使不存在也可能返回空字符串，为了保持与原代码逻辑一致（返回null），这里做个判断
    return val === '' ? null : val
  },
  setJSON (key, jsonValue) {
    if (jsonValue != null) {
      // 保持原有逻辑，存为 JSON 字符串
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON (key) {
    const value = this.get(key)
    if (value != null) {
      try {
        return JSON.parse(value)
      } catch (e) {
        console.error('localCache getJSON error:', e)
        // 如果解析失败（可能是由于 uni.setStorageSync 直接存了对象导致），尝试直接返回
        return value
      }
    }
    return null
  },
  remove (key) {
    uni.removeStorageSync(key)
  }
}

export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache
}