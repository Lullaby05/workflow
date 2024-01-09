// 安全措施接口
import Axios from '../requestForOperation.js';

interface pageType {
  pageNo: number;
  pageSize: number;
}

interface safetyMesureListType extends pageType {
  certificateId?: string;
  applyCompany?: string;
  workManager?: string;
  wordCompany?: string;
  certificateStatusCode?: string;
}

// 安全作业证列表
export const getCertificateList = (
  operationType: string,
  data: safetyMesureListType
) => {
  return Axios({
    url: `/business/operation/get-page/${operationType}`,
    method: 'post',
    data,
  });
};

// 动火安全作业证列表
export const getfireCertificateList = (data: safetyMesureListType) => {
  return Axios({
    url: '/business/fireWorkCertificate/table/page',
    method: 'post',
    data,
  });
};

// 获取作业证状态枚举
export const getOperationTypeEnum = (certType: string) => {
  return Axios({
    url: '/business/operation/get-status-enum?certType=' + certType,
    method: 'post',
  }).then(res => res.data);
};

// 获取作业证必须有的流程节点
export const getProcessKeyEnum = (certType: string) => {
  return Axios({
    url:
      '/business/operation/get-process-enum?certType=' + certType,
    method: 'post',
  }).then(res => res.data);
};

// 作业证新增
export const addCertificate = (certType: string, defId: string, data: any) => {
  return Axios({
    url: `/business/operation/create/${certType}/${defId}`,
    method: 'post',
    data,
  });
};

// 获取最新的作业证编号
export const getNewCertificateCode = (certType: string) => {
  return Axios({
    url: `/business/operation/gain-cert-num?certType=${certType}`,
    method: 'post',
  }).then(res => res.data);
};

//! 获取表单模型（测试用）
export const getFormModel = (certType: string) => {
  return Axios({
    url: `/business/operation/get-form-model/${certType}`,
    method: 'post',
  }).then(res => res.data);
};

// 
export const getMapDictionaryAPI = (code: string) => {
  return Axios({
    url: `/business/system-dict/key?code=${code}`,
    method: 'get',
  }).then((res: any) => res.data.data)
}

// 获取所有部门的下拉
export function getDeptsList() {
  return Axios({
    url: '/business/workflow/dept-list',
    method: 'post',
  }).then(res => res.data);
}

/**
 *
 * @param id 作业证id
 * @param userId 用户id
 * @param data operationType = revocation-撤回 | cancel-取消 | close-关闭 | pause-暂停 | recover-恢复
 * @returns
 */
export const experimentalOperation = (data: any) => {
  return Axios({
    url: `/business/operation/operation-special`,
    method: 'post',
    data,
  });
};

// 正常流转，审核通过或审核不通过
export const normalOperation = (id: string, data: any) => {
  return Axios({
    url: `/business/operation/operation/${id}`,
    method: 'post',
    data,
  });
};

// 获取作业详情信息
export const getCertificateBaseDetail = (id: string) => {
  return Axios({
    url: `/business/operation/base-detail/${id}`,
    method: "POST",
  });
};

// 获取作业详情
export const getCertificateDetail = (id: string) => {
  return Axios({
    url: `/business/operation/detail/${id}`,
    method: 'post',
  }).then(res => res.data);
};

// 动火级别下拉
export const getFireWorkLevelEnum = () => {
  return Axios({
    url: '/business/fireWorkCertificate/get-fire-work-level-enum',
    method: 'post',
  }).then(res => res.data);
};

// 获取作业证打印
export const getCertificatePrint = (id: string) => {
  return Axios({
    url: `/business/operation/customPrint/${id}`,
    method: 'post',
  }).then(res => res.data);
};

// 刷新token
export const refreshToken = (refreshToken: string) => {
  return Axios({
    url: `/business/login/refresh?refreshToken=${refreshToken}`,
    method: "POST",
  }).then(res => res.data);
};
