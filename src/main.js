import { createApp } from 'vue';
import router from './router';
// import storeWX from './storeWX';
import { createPinia } from 'pinia'
import store from './store';
import App from './App.vue';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElIcons from '@element-plus/icons-vue';

import 'vant/lib/index.css';

import '@/assets/global.css';
import '@/assets/iconfont/iconfont.css';

import Ellipsis from './components/common/Ellipsis.vue';
import WDialog from './components/common/WDialog.vue';
import Tip from './components/common/Tip.vue';
import Avatar from './components/common/Avatar.vue';
import Icon from './components/common/Icon.vue';
import VueAMap, { initAMapApiLoader } from '@vuemap/vue-amap';
import '@vuemap/vue-amap/dist/style.css';
import wxsdk from './wxsdk';

/*高德地图组件初始化*/
initAMapApiLoader({
  key: 'ebb9f6fb9beaec43fddcb22ab7406386',
  plugin: [
    'AMap.Autocomplete',
    /*  'AMap.ElasticMarker',
      'AMap.PlaceSearch',
      "AMap.MapType",*/
    'AMap.Geocoder',
    'AMap.Geolocation',
  ],
});
const pinia = createPinia()
const app = createApp(App)
  .use(router)
  .use(store)
  .use(pinia)
  .use(VueAMap)
  .use(ElementPlus)
  .use(wxsdk)
  .component('Ellipsis', Ellipsis)
  .component('WDialog', WDialog)
  .component('Tip', Tip)
  .component('Avatar', Avatar)
  .component('Icon', Icon);

window.$vueApp = app;
window.$vCtx = app.config.globalProperties;
import('./utils/Injection');

//全局注册图标
for (const [key, component] of Object.entries(ElIcons)) {
  app.component(`el-icon-${key.toLowerCase()}`, component);
}

app.config.globalProperties.routerAppend = (path, pathToAppend) => {
  return path + (path.endsWith('/') ? '' : '/') + pathToAppend;
};

app.mount('#app');
