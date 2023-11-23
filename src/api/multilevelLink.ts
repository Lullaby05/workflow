import { AxiosResponse } from 'axios';
import request from './request.js';
import requestOpeartion from './requestForOperation.js';

/**
 *  多级联动查询
 * @param {string} url 当前查询的url
 * @param {string | number} param 多级联动查询参数，第一个选择框不需要传参
 * @returns
 */
function getMultilevelLink(url: string, param?: string | number) {
  return requestOpeartion({
    url: url + param,
    method: 'get',
  });
}

/**
 * 获取动态下拉列表
 * @param url 当前下拉框的url
 * @param param 查询参数，可不传
 * @returns
 */
function getRemoteOptions(
  url,
  param = ''
): (url: string, param?: string | number) => Promise<AxiosResponse<any, any>> {
  return requestOpeartion({
    url: url + param,
    method: 'get',
  });
}

// 获取所有多级联动的下拉
function getAllLevelLinkOptions() {
  return requestOpeartion({
    url: '/business/operation/multiple-configuration',
    method: 'post',
  });
}

// 获取所有根据接口获取下拉列表的下拉
function getAllDropDownOptions() {
  return requestOpeartion({
    url: '/business/operation/select-configuration',
    method: 'post',
  });
}

// 获取作业安全措施（简单），用于新增作业的时候显示安全措施
const getSafetyMeasureSmiple = (operationType: string) => {
  return requestOpeartion({
    url:
      '/business/work-security-measure/get-list-simple?operationType=' +
      operationType,
    method: 'post',
  });
};

export default {
  getMultilevelLink,
  getRemoteOptions,
  getAllLevelLinkOptions,
  getAllDropDownOptions,
  getSafetyMeasureSmiple,
};
