<template>
  <div class="container">
    <div v-if="type === 'add'">
      <span
        style="color: #d9001b; line-height: 20px; margin-left: 5px"
        v-if="!hasStorage"
        >系统将自动为您保存填写的信息</span
      >
      <span
        style="color: #d9001b; line-height: 20px; margin-left: 5px"
        v-else
        >检测到您有数据未提交，已为您自动填充表单，若不需要填充表单内容，点击<span
          style="text-decoration: underline; color: #409eff"
          @click="clearStorageFormData"
          >一键清空</span
        >缓存表单</span
      >
    </div>
    <div class="step">
      <el-steps
        :active="flag"
        finish-status="success"
        align-center
      >
        <el-step
          v-for="(item, index) in steps"
          :key="index"
          :title="item.title"
          style="font-size: 12px"
        />
      </el-steps>
    </div>
    <div
      class="add-form-render-container"
      v-loading="!design"
    >
      <formRenderContent
        ref="addFormRender"
        v-if="design && steps.length !== flag"
        class="form-render-content"
        :design="design"
        status="edit"
        :key="flag"
        @changeFormData="changeFormData"
      />
      <div v-if="steps.length - 1 === flag">
        <previewCertificate
          :key="flag"
          :form-process-data="formProcessData"
          status="preview"
          :formId="formId"
          :id="previewId"
        />
      </div>
      <div class="form-render-btns">
        <Button
          type="primary"
          v-if="flag == 0"
          @click="next()"
          >下一步</Button
        >
        <Button
          type="default"
          v-if="flag > 0"
          @click="back()"
          >上一步</Button
        >
        <Button
          type="primary"
          v-if="flag > 0 && flag < 3"
          @click="next()"
          >下一步</Button
        >
        <Button
          type="primary"
          v-if="flag == 3"
          @click="submit()"
          >提交</Button
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import formRenderContent from '../components/formRenderContent.vue';
import { inject, onBeforeMount, onUnmounted, ref } from 'vue';
import { useCertificate } from '../composition/useCertificate';
import previewCertificate from '@/views/operation/components/previewCertificate.vue';
import { cloneDeep } from 'lodash';
import { Button, showToast, showConfirmDialog } from 'vant';
import {
  addCertificate,
  getCertificateDetail,
  getFormModel,
  getNewCertificateCode,
  normalOperation,
} from '@/api/operation/operationApi';
import { ElSteps, ElStep } from 'element-plus';
//@ts-ignore
import { getUserDepts } from '@/api/org';
import { operationTypeEnum } from '../composition/useCertificateDict';
import { useSafetyCertificationStore } from '@/storeWX';
import { computed } from 'vue';
const wx: any = inject('wx');
const route = useRoute();
const {
  id = '',
  type = 'add',
  token,
  refreshToken,
  userId,
  certType,
} = route.query;
const dept = ref<any>({});
const formItemsAll = ref<any>([]);

const steps = [
  { title: '基础信息' },
  { title: '相关人员/单位' },
  { title: '安全措施确认' },
  { title: '预览提交' },
];

const certObj = {
  [operationTypeEnum.BLINDPLATE]: { title: '盲板抽堵' },
  [operationTypeEnum.CONFINEDSPACE]: { title: '受限空间' },
  [operationTypeEnum.GROUND]: { title: '动土' },
  [operationTypeEnum.HIGHALTITUDE]: { title: '高处' },
  [operationTypeEnum.FIRE]: { title: '动火' },
  [operationTypeEnum.HOIST]: { title: '吊装' },
  [operationTypeEnum.BROKENROAD]: { title: '断路' },
  [operationTypeEnum.TEMPELECTRICITY]: { title: '临时用电' },
};

document.title = `${certObj[certType as keyof typeof certObj].title}作业证申请`;

localStorage.setItem('userId', userId as string);
localStorage.setItem('wflow-token', token as string);
localStorage.setItem('refreshToken', refreshToken as string);

onUnmounted(() => {
  localStorage.removeItem('userId');
  localStorage.removeItem('wflow-token');
  localStorage.removeItem('refreshToken');
});

const {
  flatObject,
  searchFormItemForAdd,
  searchFormItem,
  generateValueKeyMap,
  formItemStep,
} = useCertificate();
const design = ref<any>();
const addFormRender = ref<any>();
let defaultData: any = {}; // 保存默认数据，新增的时候只需要发formData
let valueKeyMap: any = ref({}); // valueKey对应的真实formItemId
let saveType = '';
const formId = ref<string>('');
const previewId = ref<string>('1');

const store = useSafetyCertificationStore();
store.setCurrentOperationType(certType as string);

const storageFormData = computed(() => {
  // 新增的时候才会使用缓存，一键复制和修改的时候不需要缓存
  return localStorage.getItem(`formData_${certType}_${userId}`) &&
    type === 'add'
    ? JSON.parse(
        localStorage.getItem(`formData_${certType}_${userId}`) as string
      )
    : null;
});

const preservedKeys = computed(() => {
  return [valueKeyMap.value['applyDeptId'], valueKeyMap.value['certNum']];
});

// 判断对象里的数据是否有值
const judgeHasData = (obj: any) => {
  return Object.keys(obj).some((key) => {
    if (preservedKeys.value.includes(key)) return false;
    if (Array.isArray(obj[key])) {
      return (
        obj[key].length && obj[key].some((item: any) => judgeHasData(item))
      );
    }
    return obj[key];
  });
};

// 是否有缓存
const hasStorage = computed(() => {
  // 先看缓存里是否有值
  if (!storageFormData.value) return false;
  // 看缓存里除了默认字段其他属性是否有值
  // 有任何一个值没有都说明没有缓存
  return judgeHasData(storageFormData.value.formData);
});

const clearStorageFormData = () => {
  // 一键清空的时候缓存清掉、数据清掉（除了默认字段）、步骤回到0
  showConfirmDialog({
    title: '',
    message: '一键清空后，表单内容不可恢复，是否继续清空表单内容？',
  }).then(() => {
    localStorage.removeItem(`formData_${certType}_${userId}`);
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    const formData = Object.keys(design.value.formData).reduce(
      (accumulator: any, key) => {
        if (preservedKeys.value.includes(key)) {
          accumulator[key] = design.value.formData[key];
        }
        return accumulator;
      },
      {}
    );
    design.value.formData = formData;
    flag.value = 0;
    // 刷新
    hasStorage.value;
    location.reload();
  });
};

const changeFormData = (val: any) => {
  if (type === 'add') {
    const isHasValue = judgeHasData(val);
    // 如果除了默认的两个值以外还有值则保存到localStorage中
    if (isHasValue) {
      localStorage.setItem(
        `formData_${certType}_${userId}`,
        JSON.stringify({ currentStep: flag.value, formData: val })
      );
    }
  }
};

const flag = ref<any>(
  type === 'add' && storageFormData.value
    ? storageFormData.value.currentStep || 0
    : 0
); // 0:基础信息， 1：相关人员， 2：安全措施附件， 3：预览提交

onBeforeMount(async () => {
  if (type === 'edit') {
    // 编辑，获取所有数据
    saveType = 'edit';
    const res = await getCertificateDetail(id as string);
    previewId.value = id as string;
    const data = res.data.processProgress;
    dept.value = await getUserDepts(userId);
    design.value = searchFormItem(data, 'apply');
    formItemsAll.value = design.value.formItems;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    valueKeyMap.value = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap.value['applyDeptId']]: dept.value.data[0].name,
    };
  } else if (type === 'reApply') {
    // 重新生成
    const { data } = await getFormModel(certType as string);
    defaultData = cloneDeep(data);
    const res = await getCertificateDetail(id as string);
    previewId.value = id as string;
    const newestCode = (await getNewCertificateCode(certType as string)).data;
    saveType = 'reApply';
    dept.value = await getUserDepts(userId);
    data.progress = flatObject(data.process);
    data.formData = res.data.processProgress.formData;
    design.value = searchFormItemForAdd(data, 'apply');
    if (!design.value) {
      return;
    }
    formItemsAll.value = design.value.formItems;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    valueKeyMap.value = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap.value['certNum']]: newestCode,
      [valueKeyMap.value['applyDeptId']]: dept.value.data[0].name,
    };
  } else if (type === 'add') {
    // 新增，获取默认数据
    saveType = 'add';
    const { data } = await getFormModel(certType as string);
    formId.value = data.formId;
    defaultData = cloneDeep(data);
    const newestCode = (await getNewCertificateCode(certType as string)).data;
    dept.value = await getUserDepts(userId);
    data.progress = flatObject(data.process);
    design.value = searchFormItemForAdd(data, 'apply');
    formItemsAll.value = design.value.formItems;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    if (!design.value) {
      return;
    }
    valueKeyMap.value = generateValueKeyMap(design.value.formItems);
    const cache = storageFormData.value && storageFormData.value.formData;
    design.value.formData = {
      ...cache,
      [valueKeyMap.value['certNum']]: newestCode,
      [valueKeyMap.value['applyDeptId']]: dept.value.data[0].name,
    };
  }
});

const handleAddCertification = () => {
  addFormRender!.value.handleSave(async (formData: any) => {
    // 调接口新增作业证
    const formParamData = {
      ...formData,
      [valueKeyMap.value['applyDeptId']]: dept.value.data[0].id,
    };
    if (saveType === 'reApply' || saveType === 'add') {
      const params = {
        ...defaultData,
        formData: formParamData,
        deptId: '1486186',
        processUsers: {},
      };
      await addCertificate(
        certType as string,
        defaultData.processDefId,
        params
      );
      showToast({
        message: '新增成功',
        type: 'success',
        onClose: () => {
          if (saveType === 'add') {
            localStorage.removeItem(`formData_${certType}_${userId}`);
          }
          wx.miniProgram.navigateBack();
        },
      });
    } else {
      // 编辑作业证，不改变原有流程
      const params = {
        action: 'agree',
        formData: formParamData,
        instanceId: design.value.instanceId,
        processKey: 'apply',
        taskId: design.value.progress[design.value.progress.length - 1].taskId,
        userId: userId,
        nodeId: design.value.progress[design.value.progress.length - 1].nodeId,
      };
      await normalOperation(id as string, params);
      showToast({
        message: '编辑成功',
        type: 'success',
        onClose: () => {
          wx.miniProgram.navigateBack();
        },
      });
    }
  });
};

const formProcessData = ref<any>({});

const next = () => {
  addFormRender!.value.handleSave(async (formData: any) => {
    flag.value = flag.value + 1;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    if (flag.value === steps.length - 1) {
      formProcessData.value = {
        ...design.value,
        formItems: formItemsAll,
      };
    }
  });
};
const back = () => {
  flag.value = flag.value - 1;
  design.value.formItems = formItemStep(formItemsAll.value, flag.value);
};
const submit = () => {
  handleAddCertification();
};
</script>
<style lang="less" scoped>
.header {
  font-size: 18px;
  margin-bottom: 30px;

  .title {
    margin-left: 8px;
  }
}
:deep(.form-render-container .process-form) {
  & > div {
    padding: 0 !important;
  }
}

:deep(.step) {
  margin: 0 0 10px 0 !important;
}

.add-form-render-container {
  // padding: 0px 20px 20px 20px;
  display: flex;
  flex-direction: column;

  .form-render-content {
    height: 100%;
  }
}

.form-render-btns {
  margin-top: 16px;
  text-align: center;
  display: flex;
  margin-bottom: 5px;

  button {
    flex: 1;
  }

  button + button {
    margin-left: 12px;
  }
}

.step {
  padding: 10px;
  background: #fff;
  margin: 10px;
}

:deep(.el-step__icon) {
  font-size: 0px;
  width: 12px;
  height: 12px;
}

:deep(.el-step__title) {
  font-size: 12px;
}

:deep(.el-step) {
  .is-success {
    border-color: #1f94ea;
    .el-step__icon {
      background: #1f94ea;
    }
  }
  .is-process {
    border-color: #f59a23;
    .el-step__icon {
      background: #f59a23;
    }
  }
}
:deep(.el-step__main) {
  .is-success {
    color: #1f94ea;
  }
  .is-process {
    color: #f59a23;
  }
}
</style>

<style>
:root {
  font-size: 12px;
}
</style>
