import { AxiosResponse } from 'axios';
import request from './request.js';

/**
 *  多级联动查询
 * @param {string} url 当前查询的url
 * @param {string | number} param 多级联动查询参数，第一个选择框不需要传参
 * @returns
 */
function getMultilevelLink(url: string, param?: string | number) {
  return request({
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
  return request({
    url: url + param,
    method: 'get',
  });
}

export default {
  getMultilevelLink,
  getRemoteOptions,
};
