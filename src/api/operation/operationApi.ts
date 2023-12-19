// 安全措施接口
import request from '../requestForOperation.js';

/**
 * @param code  control_cycle(管控周期)
 * @returns
 */
// 数据字典接口
export const getMapDictionaryAPI = (code: string) => {
    request({
      url: '/businessApi/business/system-dict/key?code=' + code,
      method: 'get',
    }).then(res =>{
      return res.data;
    });
}


