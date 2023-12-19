import { getMapDictionaryAPI } from '@/api/operation/operationApi';

export enum operationTypeEnum {
  BLINDPLATE = '1',
  CONFINEDSPACE = '2',
  GROUND = '3',
  HIGHALTITUDE = '4',
  FIRE = '5',
  HOIST = '6',
  BROKENROAD = '7',
  TEMPELECTRICITY = '8',
}

export enum fireStatusEnum {
  '待分析' = '1000',
  '分析不合格' = '1001',
  '已撤回' = '1002',
  '书面审核中' = '2000',
  '书面审核不通过' = '2001',
  '现场核查中' = '3000',
  '现场核查不通过' = '3001',
  '安全交底中' = '4000',
  '安全交底不通过' = '4001',
  '已安全交底' = '4002',
  '作业中' = '5000',
  '作业暂停' = '5001',
  '已关闭' = '6000',
}

export enum blindPlateStatusEnum {
  '书面审核中' = '1000',
  '书面审核不通过' = '1001',
  '已撤回' = '1002',
  '现场核查中' = '2000',
  '现场核查不通过' = '2001',
  '安全交底中' = '3000',
  '安全交底不通过' = '3001',
  '已安全交底' = '3002',
  '作业中' = '4000',
  '作业暂停' = '4001',
  '已关闭' = '5000',
}

export const operationTypeDict = [
  { dictKey: '盲板抽堵安全作业', dictValue: operationTypeEnum.BLINDPLATE },
  { dictKey: '受限空间安全作业', dictValue: operationTypeEnum.CONFINEDSPACE },
  { dictKey: '动土安全作业', dictValue: operationTypeEnum.GROUND },
  { dictKey: '高处安全作业', dictValue: operationTypeEnum.HIGHALTITUDE },
  { dictKey: '动火安全作业', dictValue: operationTypeEnum.FIRE },
  { dictKey: '吊装安全作业', dictValue: operationTypeEnum.HOIST },
  { dictKey: '断路安全作业', dictValue: operationTypeEnum.BROKENROAD },
  { dictKey: '临时用电安全作业', dictValue: operationTypeEnum.TEMPELECTRICITY },
];

export const changeMapToDict = (map: any) => {
  return Object.keys(map).map((key) => ({
    dictKey: map[key],
    dictValue: key,
  }));
};

/**
 * 根据字符串获取字典
 * @param dicts 字典字符串，用逗号分隔
 */
export const useCertificateDict = async (dicts: string) => {
  const dictArr = dicts.split(',');
  let result = {};
  for (let i = 0; i < dictArr.length; i++) {
    const { data } = await getMapDictionaryAPI(dictArr[i]);
    result = { ...result, ...data };
  }

  return result;
};
