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
  });
};