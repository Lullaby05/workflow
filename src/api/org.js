import request from '@/api/request.js';
import Axios from '@/api/requestForOperation.js';

// 查询组织架构树
export function getOrgTree(param) {
  return request({
    url: 'uaa/org/tree',
    method: 'get',
    params: param,
  });
}

export function getUserSign() {
  return request({
    url: 'uaa/org/user/sign',
    method: 'get',
  });
}

// 查询系统角色
export function getRole() {
  return request({
    url: 'uaa/org/role',
    method: 'get',
  });
}

// 搜索人员
export function getUserByName(param) {
  return request({
    url: 'uaa/org/tree/user/search',
    method: 'get',
    params: param,
  });
}

// 搜索人员
export function getUserDepts(userId) {
  return request({
    url: `uaa/org/user/${userId}/dept`,
    method: 'get',
  });
}

// 获取审批代理人
export function getUserAgent() {
  return request({
    url: `uaa/org/user/agent`,
    method: 'get',
  });
}

// 获取审批代理人
export function setUserAgent(params) {
  return request({
    url: `uaa/org/user/agent`,
    method: 'put',
    data: params,
  });
}

// 获取审批代理人
export function cancelUserAgent() {
  return request({
    url: `uaa/org/user/agent`,
    method: 'delete',
  });
}

// 判断选择的员工是否绑定了用户
export const judgeBindingUser = (id) => {
  return Axios({
    url: `/business/employee/validate-employee-bind-user?id=${id}`,
    method: 'POST',
  }).then((res) => res.data);
};

// 判断选择的员工是否有对应模块或功能的权限
export const judgeUserHasPermission = (data) => {
  return Axios({
    url: `/business/tenant/user/menu/validate-menu`,
    method: 'POST',
    data,
  }).then((res) => res.data);
};

export default {
  getUserSign,
  getOrgTree,
  getUserByName,
  getRole,
  getUserDepts,
  getUserAgent,
  setUserAgent,
  cancelUserAgent,
};
