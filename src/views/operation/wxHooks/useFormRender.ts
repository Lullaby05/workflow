import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';

type formInfo = {
  formItems?: object[];
  formData?: any;
  formConfig?: {
    ruleType: string;
    rules: object[];
  };
  process?: object;
  remark?: string;
};

type formRenderConfig = {
  formData?: any;
  formsTemp?: object[];
  formConfigTemp?: {
    ruleType: string;
    rules: object[];
  };
};

interface returnObj extends formRenderConfig {
  editFormRender(): void;
}

/**
 *
 * @param record 不传代表表单为空需要新增；传了代表表单已存在且是从后台获取来的
 * @returns
 */
export function useFormRender(record?: any): returnObj {
  const router = useRouter();
  let formInfo: formInfo = {};

  if (!record) {
    // 不传的话直接从pinia中获取（新增时会去编辑然后回来会拿pinia中的数据）
    formInfo = { ...store.state.design };
  } else {
    // 传了就需要看formId和传过来的是否相同，相同代表编辑的时候表单被获取了可能被修改了，修改后会存到pinia中，以pinia中的为准
    if (record.formId === (store.state.design as any).formId) {
      formInfo = { ...record, ...store.state.design };
    } //否则就是编辑的时候第一次进来，直接获取record的数据作为表单数据
    else {
      formInfo = record;
    }
  }

  const formRenderConfig = reactive<formRenderConfig>({});

  formRenderConfig.formData = formInfo.formData || {};
  formRenderConfig.formConfigTemp = formInfo.formConfig || {
    ruleType: 'SIMPLE',
    rules: [],
  };
  formRenderConfig.formsTemp =
    formInfo.formItems?.map((ele: any) => {
      return { ...ele };
    }) || [];

  const editFormRender = () => {
    if (record && Object.keys(record).length) {
      store.commit('loadForm', record);
    }
    router.push({
      name: 'ControlFormDesign',
      query: {
        formId: !record ? '' : record.formId,
      },
    });
  };

  return {
    ...formRenderConfig,
    editFormRender,
  };
}
