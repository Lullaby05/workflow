import axios from 'axios'
import { ElMessage } from 'element-plus'

const globalProps = window.$vueApp.config.globalProperties
globalProps.$axios = axios
globalProps.BASE_URL = `http://${process.env.NODE_ENV === 'development' ? "localhost" : "172.16.16.9"}:10000`+'/businessApi';
console.log("注入请求地址")
const service = axios.create({
  	headers:{
		'Authorization': 'Bearer testSec_1_1'
	},
  baseURL: globalProps.BASE_URL,
  timeout: 50000,
})

service.defaults.withCredentials = true // 让ajax携带cookie
service.interceptors.request.use(
  // 每次请求都自动携带Cookie
  (config) => {
    config.headers.wflowToken = localStorage.getItem('wflow-token')
    return config
  },
  // eslint-disable-next-line handle-callback-err
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (rsp) => {
    return rsp
  },
  // 拦截异常的响应
  (err) => {
    //throw 'request error'
    if (err.response.status === 500
      && err.response.data.message.indexOf('Token')){
      const err = '未登录或登录状态已过期，请点击头像切换人员登录'
      ElMessage({ message: err, type: 'error' })
      return new Error(err)
    }
    return Promise.reject(err)
  }
)

export function syncRequest(config) {
  let ajax = new XMLHttpRequest()
  ajax.withCredentials = true
  //ajax.responseType = 'json'
  ajax.open(config.method, globalProps.BASE_URL + config.url, false)
  ajax.onload = function (e) {
    if (ajax.readyState === 4) {
      if (ajax.status === 200 && config.success) {
        config.success(ajax.responseText)
      } else if (config.fail) {
        config.fail(ajax.responseText)
      }
    }
  }
  ajax.onerror = function (e) {
    if (config.fail) {
      config.fail(ajax.responseText)
    }
  }
  if (config.data) {
    if (config.type === 'json') {
      ajax.setRequestHeader('Content-type', 'application/json')
      ajax.send(JSON.stringify(config.data))
    } else {
      ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      let form = new FormData()
      for (const key in config.data) {
        form.set(key, config.data[key])
      }
      ajax.send(form)
    }
  } else {
    ajax.send(null)
  }
}

export default service
