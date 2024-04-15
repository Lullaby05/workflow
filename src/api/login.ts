import Axios from './requestForOperation.js';

// 获取用户信息
export const getUserInfo = () => {
  return Axios({
    url: '/business/login/user-info',
    method: 'POST',
  }).then((res: any) => res.data);
};

// 登录，获取企业列表
export const loginV2 = (data: any) => {
  return Axios({
    url: `/business/login/login-v2?condition=${data.condition}&password=${data.password}`,
    method: 'POST',
  }).then((res: any) => res.data);
};
// 登录，根据手机验证码获取企业列表
export const loginByPhoneV2 = (data: any) => {
  return Axios({
    url: `/business/login/mobile-login-v2?mobile=${data.mobile}&code=${data.code}`,
    method: 'POST',
  }).then((res: any) => res.data);
};
// 获取登陆人的企业列表
export const getTenantList = () => {
  return Axios({
    url: `/business/login/get-enterprise-list`,
    method: 'POST',
  }).then((res: any) => res.data);
};
// 根据企业列表信息获取token
export const getTokenByTenant = (data: any) => {
  return Axios({
    url: `/business/login/get-token`,
    method: 'POST',
    data,
  }).then((res: any) => res.data);
};
