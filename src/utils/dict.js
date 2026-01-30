import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'
import { smartConvertValue } from '@/utils/string'

function convertValue(value) {
  // 如果是空字符串，直接返回
  if (value === '') {
    return value;
  }
  // 如果去除空格后是空字符串，也返回原值（但一般不会）
  if (value.trim() === '') {
    return value;
  }
  // 如果转换为数字后不是 NaN，并且转换后的数字与原始字符串在去掉首尾空格后相等，则返回数字
  const num = Number(value);
  if (!isNaN(num) && num.toString() === value.trim()) {
    return num;
  }
  return value;
}
/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({})
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = []
      const dicts = useDictStore().getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = resp.data.map(p => ({ 
              label: p.dictLabel, 
              value: smartConvertValue(p.dictValue), 
              elTagType: p.listClass, 
              elTagClass: p.cssClass 
            }))
          useDictStore().setDict(dictType, res.value[dictType])
        })
      }
    })
    return toRefs(res.value)
  })()
}