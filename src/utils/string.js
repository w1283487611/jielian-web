/**
 * 智能转换字符串为实际类型
 * @param {string} value - 需要转换的字符串
 * @param {Object} options - 转换选项
 * @param {string} options.type - 指定目标类型（'auto'|'number'|'string'|'boolean'|'json'）
 * @param {boolean} options.strictNumber - 是否严格数字转换（默认true）
 * @param {boolean} options.preserveEmpty - 是否保留空字符串（默认true）
 * @returns {*} 转换后的值
 */
export function smartConvertValue(value, options = {}) {
    const {
      type = 'auto',
      strictNumber = true,
      preserveEmpty = true
    } = options
  
    // 处理空值
    if (value === null || value === undefined) {
      return value
    }
  
    // 如果是空字符串
    if (value === '') {
      return preserveEmpty ? '' : null
    }
  
    // 如果已经是非字符串类型，直接返回
    if (typeof value !== 'string') {
      return value
    }
  
    // 按指定类型转换
    switch (type) {
      case 'number':
        return convertToNumber(value, strictNumber)
      
      case 'boolean':
        return convertToBoolean(value)
      
      case 'json':
        return convertToJson(value)
      
      case 'string':
        return value
      
      case 'auto':
      default:
        return autoConvert(value, strictNumber)
    }
  }
  
  /**
   * 转换为数字
   */
  function convertToNumber(value, strict = true) {
    // 移除可能的千分位逗号
    const cleanValue = value.replace(/,/g, '')
    
    // 如果是科学计数法
    if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(cleanValue)) {
      const num = Number(cleanValue)
      return isNaN(num) ? value : num
    }
    
    // 如果是整数或小数
    if (/^[+-]?\d+(\.\d+)?$/.test(cleanValue)) {
      const num = Number(cleanValue)
      return isNaN(num) ? value : num
    }
    
    // 如果是严格模式，返回原值
    if (strict) {
      return value
    }
    
    // 非严格模式尝试转换
    const num = Number(cleanValue)
    return isNaN(num) ? value : num
  }
  
  /**
   * 转换为布尔值
   */
  function convertToBoolean(value) {
    const lowerValue = value.toLowerCase().trim()
    
    // 真值
    if (['true', '1', 'yes', 'y', '是', 'on', '启用'].includes(lowerValue)) {
      return true
    }
    
    // 假值
    if (['false', '0', 'no', 'n', '否', 'off', '禁用'].includes(lowerValue)) {
      return false
    }
    
    // 无法识别的返回原值
    return value
  }
  
  /**
   * 转换为JSON
   */
  function convertToJson(value) {
    try {
      // 如果是JSON字符串，则解析
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value)
      }
      // 如果是其他可能表示对象的字符串，如 "{a:1}"
      if (/^\{.*\}$/.test(value.trim()) || /^\[.*\]$/.test(value.trim())) {
        // 尝试用eval（注意安全性，仅在可信环境中使用）
        try {
          // eslint-disable-next-line no-eval
          return eval(`(${value})`)
        } catch {
          return value
        }
      }
      return value
    } catch {
      return value
    }
  }
  
  /**
   * 自动类型转换
   */
  function autoConvert(value, strictNumber) {
    // 先尝试转换为数字
    const num = convertToNumber(value, strictNumber)
    if (num !== value) {
      return num
    }
    
    // 再尝试转换为布尔值
    const bool = convertToBoolean(value)
    if (bool !== value) {
      return bool
    }
    
    // 最后尝试转换为JSON
    const json = convertToJson(value)
    if (json !== value) {
      return json
    }
    
    // 都不匹配则返回原字符串
    return value
  }
  
  /**
   * 批量智能转换对象中的字符串值
   * @param {Object} obj - 需要转换的对象
   * @param {Object} fieldConfig - 字段配置 {字段名: 目标类型}
   * @returns {Object} 转换后的对象
   */
  export function smartConvertObject(obj, fieldConfig = {}) {
    if (!obj || typeof obj !== 'object') {
      return obj
    }
    
    const result = Array.isArray(obj) ? [] : {}
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        
        // 如果有字段配置，按配置转换
        if (fieldConfig[key]) {
          if (typeof fieldConfig[key] === 'string') {
            result[key] = smartConvertValue(value, { type: fieldConfig[key] })
          } else if (typeof fieldConfig[key] === 'function') {
            result[key] = fieldConfig[key](value)
          } else if (typeof fieldConfig[key] === 'object') {
            result[key] = smartConvertValue(value, fieldConfig[key])
          }
        } else if (typeof value === 'string') {
          // 没有配置则自动转换
          result[key] = smartConvertValue(value)
        } else if (value && typeof value === 'object') {
          // 递归处理嵌套对象
          result[key] = smartConvertObject(value, fieldConfig)
        } else {
          result[key] = value
        }
      }
    }
    
    return result
  }
  
  /**
   * 检查字符串是否为纯数字
   */
  export function isNumericString(str) {
    if (typeof str !== 'string') return false
    return /^[+-]?\d+(\.\d+)?$/.test(str)
  }
  
  /**
   * 检查字符串是否为布尔字符串
   */
  export function isBooleanString(str) {
    if (typeof str !== 'string') return false
    const lowerStr = str.toLowerCase().trim()
    return ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(lowerStr)
  }
  
  /**
   * 检查字符串是否为JSON字符串
   */
  export function isJsonString(str) {
    if (typeof str !== 'string') return false
    
    try {
      const trimmed = str.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        JSON.parse(trimmed)
        return true
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        JSON.parse(trimmed)
        return true
      }
    } catch {
      return false
    }
    
    return false
  }
  
  /**
   * 获取字符串的实际类型
   */
  export function getStringActualType(str) {
    if (isNumericString(str)) return 'number'
    if (isBooleanString(str)) return 'boolean'
    if (isJsonString(str)) return 'json'
    return 'string'
  }
  
  export default {
    smartConvertValue,
    smartConvertObject,
    isNumericString,
    isBooleanString,
    isJsonString,
    getStringActualType
  }