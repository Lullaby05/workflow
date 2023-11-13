import moment from 'moment'
import { showFailToast } from 'vant'

const globalProps = window.$vueApp.config.globalProperties
//api后端接口地址
console.log('加载注入项')
//文件资源前缀，用来拼接URL
globalProps.RES_FILE_PRE = globalProps.BASE_URL

/**
 * 解析资源地址
 * @param url 资源url
 * @returns {string}
 */
globalProps.$getRes = function (url) {
  const reg = /^(http:|https:).*/gi
  return reg.test(url) ? url : globalProps.BASE_URL + url
}

/**
 * 判空函数，对象或字符串
 * @param obj
 * @returns {boolean}
 */
globalProps.$isNotEmpty = function (obj) {
  return obj !== undefined && obj !== null && obj !== '' && obj !== 'null'
}

//判断是否设备为移动端
globalProps.$isMobile = function () {
  return window.screen.width < 450
}

//弹错误信息
globalProps.$showError = function (err) {
  if (globalProps.$isMobile()) {
    showFailToast(err)
  } else {
    globalProps.$message.error(err)
  }
}

/**
 * 获取本地资源
 * @param url 资源地址
 * @returns {string}
 */
globalProps.$getLocalRes = function (url) {
  return new URL(`../assets/image/${url}`, import.meta.url).href
}

/**
 * 从对象获取一个key的值，如果咩有就返回默认值
 * @param obj 对象
 * @param key key字段
 * @param df 默认值
 * @returns {*}
 */
globalProps.$getDefalut = function (obj, key, df) {
  return obj === undefined || key === undefined || !this.$isNotEmpty(obj[key])
    ? df
    : obj[key]
}

/**
 * 对对象进行序列化深拷贝
 * @param obj
 * @returns {any}
 */
globalProps.$deepCopy = function (obj) {
  return JSON.parse(JSON.stringify(obj || '{}'))
}

/**
 * axios API 的请求错误结果提醒
 * @param err 错误信息
 * @param def 默认信息
 */
globalProps.$err = (err, def) => {
  try {
    globalProps.$message.error(
      err.response.data.message || err.response.data
    )
  } catch (e) {
    globalProps.$message.error(def)
  }
}

/**
 * axios API 的请求成功结果提醒
 * @param rsp 错误信息
 * @param def 默认信息
 */
globalProps.$ok = (rsp, def) => {
  return globalProps.$message.success(
    rsp.data ? rsp.data : def
  )
}

/**
 * 时间段转换时长文字描述
 * @param s 开始时间
 * @param e 结束时间
 * @returns {string}
 */
globalProps.$timeCoverStr = function (s, e) {
  if (s === e) {
    return '0'
  }
  let start = moment(s)
  let end = moment(e)
  let years = end.diff(s, 'years')
  let months = end.diff(s, 'months')
  let days = end.diff(s, 'days')
  let hours = end.diff(s, 'hours')
  let minutes = end.diff(s, 'minutes')
  let second = end.diff(s, 'seconds')
  second = second % 60
  minutes = minutes % 60
  hours = hours % 24
  months = months % 12
  //因为每月天不固定，所以天要特殊动态处理
  if (start.date() < end.date()) {
    days = end.date() - start.date()
    if (minutes > 0 || hours > 0) {
      days--
    }
  }
  //处理超过俩月且天超过31
  if (days > 31 && end.month() - start.month() >= 2) {
    //将日期推至上月求差
    days = end.diff(start.add(end.month() - start.month() - 1, 'month'), 'days')
  }
  return `${years > 0 ? years + '年 ' : ''}${months > 0 ? months + '个月 ' : ''}
                ${days > 0 ? days + '天 ' : ''}${
    hours > 0 ? hours + '小时 ' : ''
  }
                ${minutes > 0 ? minutes + '分钟 ' : ''}${
    second > 0 ? second + '秒' : ''
  }`
}

/**
 * 移除一个数组值
 * @param value 需要移除得值
 * @returns {number}
 */
Array.prototype.remove = function (value) {
  let index = this.indexOf(value)
  if (index > -1) {
    this.splice(index, 1)
  }
  return index
}

/**
 * 根据key 移除数组里面一个指定值的对象，匹配唯一key
 * @param key key
 * @param val key对应的值
 * @returns {number}
 */
Array.prototype.removeByKey = function (key, val) {
  let index = this.findIndex((value) => value[key] === val)
  if (index > -1) {
    this.splice(index, 1)
  }
  return index
}

//对象数组转map
Array.prototype.toMap = function (key) {
  let map = new Map()
  this.forEach((v) => map.set(v[key], v))
  return map
}
