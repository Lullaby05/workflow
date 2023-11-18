import request from './requestForOperation.js';

// 根据作业类型获取流程节点的枚举
export const getProcessByType = (certType: string) => {
  return request({
    url: '/business/operation/get-process-enum?certType=' + certType,
    method: 'post',
  });
};

// 获取表单valueKey列表
export const getValueKeyEnum = (certType: string) => {
  return request({
    url: '/business/operation/get-value-key?certType=' + certType,
    method: 'post',
  });
};

// 校验表单的valueKey是否填写完毕
export const checkValueKey = (data: any) => {
  return request({
    url: '/business/operation/analysis',
    method: 'post',
    data,
  });
};

export const getProcessKeyEnum = (certType: string) => {
  return request({
    url: '/business/operation/get-process-enum?certType=' + certType,
    method: 'post',
  });
};
