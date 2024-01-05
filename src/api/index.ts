import Axios from './requestForOperation.js';

export const UploadPath = '/outer/business/upload/uploadFile';

/**
 * @param code  control_cycle(管控周期)
 * @returns
 */
// 数据字典接口
export function getMapDictionaryAPI(code: string) {
  return Axios({
    url: '/businessApi/business/system-dict/key?code=' + code,
    method: 'get',
  });
}

/**
 *
 * @param code  COMPANY_TYPE(企业类型)，EDUCATION(学历), DEPT_TYPE(部门类型), EMERGENCY_SUPPLIES(物资类型)，EMANAGEMENT_TYPE（应急预案类型）
 * @returns
 */
// 获取枚举列表
export function getEnumListAPI(code: string) {
  return Axios({
    url: '/businessApi/business/system-dict/get_enum_list?code=' + code,
    method: 'post',
  });
}

/**
 *
 * @param code  EMERGENCY_SUPPLIES(物资类型)
 * @returns [...children:[...]]
 */
// 获取物资类型字典列表
export function getSystemDicAPI(code: string) {
  return Axios({
    url: '/businessApi/business/system-dict/tree/keys?code=' + code,
    method: 'get',
  });
}

type pitfallDicCodeType =
  | 'hid_danger_source' //  隐患数据来源
  | 'hid_danger_level' //  隐患等级
  | 'hid_danger_state' // 隐患状态
  | 'check_plan_state' // 排查计划状态
  | 'check_plan_type' // 排查计划类型
  | 'organize_level' // 组织层级
  | 'check_cycle' // 排查周期
  | 'custom_cycle'; // 自定义周期

export interface dictResponseType {
  id: string;
  dictKey: string | number;
  dictValue: string | number;
  remark?: string;
}

/**
 * 隐患管理所有字典
 * @param code
 * @returns 返回的不仅有键值对还有id等其他内容
 */
export function getPitfallDicApi(code: pitfallDicCodeType) {
  return Axios({
    url: '/businessApi/business/system-dict/keys?code=' + code,
    method: 'get',
  });
}

export function getUserList() {
  return Axios({
    url: '/businessApi/business/workflow/get-user-list',
    method: 'post',
  });
}
