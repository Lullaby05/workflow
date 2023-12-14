import wx from 'weixin-js-sdk';

const plugin = {
  install(Vue) {
    Vue.provide('wx', wx);
    Vue.config.globalProperties.$wechat = wx;
    Vue.config.globalProperties.wechat = wx;
  },
};

export default plugin;
export const install = plugin.install;
