// 安全措施接口
import Axios from '../requestForOperation.js';

interface pageType {
  pageNo: number;
  pageSize: number;
}

interface safetyMesureListType extends pageType {
  operationType?: string;
  securityMeasure?: string;
}
// 作业安全措施列表
export const getSafetyMeasureList = (data: safetyMesureListType) => {
  return Axios({
    url: '/business/work-security-measure/get-page',
    method: 'post',
    data,
  }).then(res => res.data);
};
interface safetyMeasureType {
  id?: string;
  operationType?: string;
  securityMeasure?: string;
}
// 作业安全措施新增
export const safetyMeasureAdd = (data: safetyMeasureType) => {
  return Axios({
    url: '/business/work-security-measure/creat',
    method: 'post',
    data,
  }).then(res => res.data);
};
// 作业安全措施编辑
export const safetyMeasureEdit = (data: safetyMeasureType) => {
  return Axios({
    url: '/business/work-security-measure/update',
    method: 'post',
    data,
  }).then(res => res.data);
};
// 作业安全措施删除
export const safetyMeasureDel = (id: string) => {
  return Axios({
    url: '/business/work-security-measure/delete/' + id,
    method: 'post',
  }).then(res => res.data);
};

// 获取作业安全措施（简单），用于新增作业的时候显示安全措施
export const getSafetyMeasureSmiple = (operationType: string) => {
  return Axios({
    url:
      '/business/work-security-measure/get-list-simple?operationType=' +
      operationType,
    method: 'post',
  }).then(res => res.data);
};

export const getUserList = () => {
  return Axios({
    url: '/business/workflow/get-user-list',
    method: 'post',
  }).then(res => res.data);
}
