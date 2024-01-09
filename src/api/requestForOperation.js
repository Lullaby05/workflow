import axios from 'axios';
import { ElMessage } from 'element-plus';
import wx from 'weixin-js-sdk';
import { refreshToken } from './operation/operationApi';

const globalProps = window.$vueApp.config.globalProperties;
globalProps.$axios = axios;
// globalProps.BASE_URL =
//   `http://${
//     process.env.NODE_ENV === 'development' ? '172.16.16.9' : '172.16.16.9'
//   }:32200` + '/businessApi';
console.log('注入请求地址');
const service = axios.create({
  headers: {
    Authorization: 'Bearer testSec_1_1',
  },
  baseURL: '/outer',
  timeout: 50000,
});
let lastOptions = null;

service.defaults.withCredentials = true; // 让ajax携带cookie
service.interceptors.request.use(
  // 每次请求都自动携带Cookie
  (config) => {
    const baseToken = localStorage.getItem('wflow-token');
    let token = baseToken ? `Bearer ${baseToken}` : 'Bearer testSec_1_1';
    wx.miniProgram.getEnv(function (res) {
      if (res.miniprogram && !baseToken) {
        token = '';
      }
    });
    config.headers.wflowToken = token;
    config.headers = Object.assign(config.headers, {
      Authorization: token,
    });
    lastOptions = config;
    return config;
  },
  // eslint-disable-next-line handle-callback-err
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (rsp) => {
    return new Promise((resolve) => {
      if (rsp.data.code === 401) {
        // wx.miniProgram.getEnv(function (res) {
        // if (res.miniprogram) {
        refreshTokenFn(lastOptions, resolve);
        return;
        // }
        // });
      }
      resolve(rsp);
      // return rsp;
    });
  },
  // 拦截异常的响应
  (err) => {
    //throw 'request error'
    if (
      err.response.status === 500 &&
      err.response.data.message.indexOf('Token')
    ) {
      const err = '未登录或登录状态已过期，请点击头像切换人员登录';
      ElMessage({ message: err, type: 'error' });
      return new Error(err);
    }
    return Promise.reject(err);
  }
);

let requestArr = []; //请求队列，是否正在刷新token
let isRefreshing = false;
async function refreshTokenFn(options, resolve) {
  requestArr.push(() => {
    resolve(service(options));
  }); //缓存请求到队列中
  if (!isRefreshing) {
    isRefreshing = true;
    const token = localStorage.getItem('refreshToken');
    refreshToken(token)
      .then((res) => {
        switch (res.data.code) {
          case 0:
            localStorage.setItem('wflow-token', res.data.data.accessToken);
            localStorage.setItem('refreshToken', res.data.data.refreshToken);
            // 重新请求队列
            requestArr.map((MT) => {
              MT();
            });
            requestArr = []; //清空队列
            break;
          default:
            ElMessage({
              message: '登录过期，请重新登录',
              duration: 1500,
              onClose: () => {
                wx.miniProgram.redirectTo({
                  url: '/pages/login/index',
                });
              },
            });
        }
      })
      .finally(() => {
        //解除正在刷新
        isRefreshing = false;
      });
  }
}

export function syncRequest(config) {
  let ajax = new XMLHttpRequest();
  ajax.withCredentials = true;
  //ajax.responseType = 'json'
  ajax.open(config.method, globalProps.BASE_URL + config.url, false);
  ajax.onload = function (e) {
    if (ajax.readyState === 4) {
      if (ajax.status === 200 && config.success) {
        config.success(ajax.responseText);
      } else if (config.fail) {
        config.fail(ajax.responseText);
      }
    }
  };
  ajax.onerror = function (e) {
    if (config.fail) {
      config.fail(ajax.responseText);
    }
  };
  if (config.data) {
    if (config.type === 'json') {
      ajax.setRequestHeader('Content-type', 'application/json');
      ajax.send(JSON.stringify(config.data));
    } else {
      ajax.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded'
      );
      let form = new FormData();
      for (const key in config.data) {
        form.set(key, config.data[key]);
      }
      ajax.send(form);
    }
  } else {
    ajax.send(null);
  }
}

export default service;
