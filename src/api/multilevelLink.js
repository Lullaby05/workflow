import request from '@/api/request.js';

// 查询县
export function getCounty(param) {
  return request({
    url: 'oa/org/county?param=' + param,
    method: 'get',
  });
}

// 查询省
export function getProvince() {
  return request({
    url: 'oa/org/province',
    method: 'get',
  });
}

// 查询城市
export function getCity(param) {
  return request({
    url: 'oa/org/city?param=' + param,
    method: 'get',
  });
}

export default {
  getCounty,
  getProvince,
  getCity,
};
