import request from './requestForOperation.js';

/**
 *  获取排查表单
 * @param {string} taskType 任务类型
 * @param {string | number} ids 排除ID
 * @returns
 */
export const planInfo = (taskTyperl: string, ids?: string) => {
  console.log(ids);
  return request({
    url: '/business/check/plan/info?taskType='+taskTyperl+'&ids='+ids,
    method: 'post',
  }).then((res) => {
      return res.data
  })
};
export interface checkPlanDataType {
  checkAddr?: string;
  checkCycleCode?: string;
  checkEndTime?: string;
  checkPerson?: string;
  checkPersonId?: number;
  checkStartTime?: string;
  checkTableIds?: string[];
  checkTypeCode?: string;
  customCycleCode?: string;
  customNum?: number;
  customTime?: number;
  organizeLevelCode?: string;
  planName?: string;
}

// 排查计划新增
export const checkPlanAdd = (data: checkPlanDataType) => {
  return request({
    url: '/business/check/plan/create',
    method: 'post',
    data,
  }).then((res) => {return res.data});
};
// 排查计划详情中的表单详情
export const checkPlanDetailForm = (taskType: string, ids: string[]) => {
  return request({
    url: `/business/check/plan/info?taskType=${taskType}&ids=${ids}`,
    method: 'post',
  }).then((res) => {return res.data});
};
// 排查计划详情
export const getDailyCheckDetail = (id: string) => {
  return request({
    url: `/business/check/task/detail?id=${id}`,
    method: 'post',
  }).then((res) => {return res.data});
};

interface dailyCheckExecuteType {
  checkContentId?: number;
  formItems?: string;
  isQualified?: boolean;
  taskId?: number;
  taskName?: string;
}
//   执行排查任务
export const dailyCheckExecute = (data: dailyCheckExecuteType) => {
  return request({
    url: '/business/check/task/execute',
    method: 'post',
    data,
  }).then((res) => {return res.data});
};

interface pitfallAddType {
  checkAcceptId?: number;
  checkAcceptImages?: string[];
  checkAcceptName?: string;
  checkAcceptResult?: number;
  checkAcceptSignature?: string;
  checkAcceptTime?: string;
  dangerLevelCode?: string;
  dangerSourceCode?: string;
  dangerStateCode?: string;
  isForward?: number;
  isHiddenDanger?: true;
  rectifyDepartId?: number;
  rectifyDepartName?: string;
  rectifyId?: number;
  rectifyImages?: string[];
  rectifyMeasures?: string;
  rectifyName?: string;
  rectifySituation?: string;
  rectifyTime?: string;
  remark?: string;
  taskId?: number;
  acceptorId?: string;
  acceptorRemark?: string;
  acceptorName?: string;
  id?: string;
}
// 隐患管理新增
export const pitfallAdd = (data: pitfallAddType[]) => {
  return request({
    url: '/business/process/record/create',
    method: 'post',
    data,
  }).then((res) => {return res.data});
};