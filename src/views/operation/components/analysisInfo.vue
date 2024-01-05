<template>
  <div class="form-render-container">
    <div class="operation-header">
      <div style="text-align: right">
        <Button
          class="jump-info-btn"
          type="primary"
          size="mini"
          >作业信息查看</Button
        >
      </div>
      <formRenderContent
        ref="formRender"
        v-if="formDesign && formContentVisible"
        class="operation-apply-form"
        :design="formDesign"
        :status="status"
      />
    </div>

    <div class="audit-form">
      <auditForm
        v-if="currentProcess"
        :taskId="currentProcess.taskId"
        :needCheckSign="true"
        ref="audtiForm"
        v-model:auditFormData="auditFormData"
        status="edit"
        :text="props.text"
      />
    </div>
    <div class="audit-form-container">
      <div
        class="audit-form-container-item"
        v-if="formProcessData.length"
        v-for="(item, index) in formProcessData"
        :key="index"
      >
        <div class="audit-item-title">
          <a-divider
            direction="vertical"
            :size="6"
          />
          <span class="audit-item-title-text">{{
            '第' + (formProcessData.length - index) + '次分析结果'
          }}</span>
        </div>
        <div class="audit-content">
          <!-- <auditForm
            v-model:auditFormData="item.auditFormData"
            status="detail"
            :text="props.text"
            :needTable="true"
          /> -->
        </div>
      </div>
    </div>
    <div class="operation-apply-form-btn">
      <Button
        v-for="item in buttonList"
        :key="item.key"
        :type="item.type || 'primary'"
        :status="item.status || ''"
        @click="handleButtonClick(item.key)"
      >
        {{ item.text }}
      </Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import formRenderContent from './formRenderContent.vue';
import { useCertificate } from '../composition/useCertificate';
import { useRouter } from 'vue-router';
import { normalOperation } from '@/api/operation/operationApi';
// import auditForm from '../components/auditForm.vue';
import { fireStatusEnum } from '../composition/useCertificateDict';
import { ElMessage as Message } from 'element-plus';
import { Button } from 'vant';

const props = defineProps({
  formProcessData: {
    type: Object,
    required: true,
  },
  activeKey: {
    type: String,
    required: true,
  },
  certificateStatus: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '分析',
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'detail',
  },
});
const router = useRouter();
const userStore = { userId: localStorage.getItem('userId') };

const emits = defineEmits(['initData']);
const { searchFormItem } = useCertificate();
const audtiForm = ref<any>(null);
const formRender = ref<any>(null);
const formProcessData = ref<any[]>([]);

// 获取processKey为安全交底的，并且处理人为登陆人，并且未评审的，如果为空则说明登陆人不是操作人，显示detail页面
const currentProcess = computed<any>(() => {
  // 只找最近的一个processKey为analyse的
  for (let i = props.formProcessData.progress.length - 1; i > 0; i--) {
    const item = props.formProcessData.progress[i];
    if (item.processKey === 'analyse') {
      if (item.user.id == userStore.userId && !item.result) {
        return item;
      }
      if (
        props.formProcessData.progress[i - 1] &&
        props.formProcessData.progress[i - 1].processKey !== 'analyse'
      ) {
        return false;
      }
    }
  }
  return false;
});

const formDesign: any = computed(() => {
  return searchFormItem(props.formProcessData, props.activeKey);
});
const formItemIds: string[] = formDesign.value
  ? formDesign.value.formItems.map((item: any) => item.id)
  : [];
const formContentVisible = computed(() => {
  return formItemIds.some(
    // 有数据或者当前需要处理才显示
    (ele: any) => formDesign.value.formData[ele] || currentProcess.value
  );
});

// 审核相关表单
const auditFormData = ref<any>({
  result: '',
  signature: '',
  imageFile: [],
  uploadFile: [],
  remark: '',
});

// 找到所有的作业分析数据
const tempProgress = props.formProcessData.progress;
let processData: any[] = [];
for (let i = 0; i < tempProgress.length; i++) {
  if (tempProgress[i].processKey === 'analyse' && tempProgress[i].result) {
    processData.push(tempProgress[i]);
  }
}

// 只有待安全交底中并且需要他签名的情况才可以编辑
const status = computed<string>(() => {
  if (
    props.certificateStatus === fireStatusEnum.待分析 &&
    currentProcess.value &&
    props.type === 'edit'
  ) {
    return 'edit';
  }
  return 'detail';
});

const delIndex: number[] = [];
formProcessData.value = processData.map((item: any, index: number) => {
  // 正常情况
  const auditFormData: any[] = [
    {
      result: item.result === 'agree' ? '同意' : '不同意',
      signature: item.signature,
      remark: item.comment.length ? item.comment[0].text : '',
      createTime: item.finishTime,
      round: item.user.name,
    },
  ];
  // 特殊情况会有一个两个人同时签字才能走到下一步，这时候流程节点的nodeId和startTime相同
  const otherData: any[] = [];
  for (let i = index + 1; i < processData.length; i++) {
    if (
      processData[i].nodeId === item.nodeId &&
      processData[i].startTime === item.startTime
    ) {
      delIndex.push(i);
      otherData.push({
        result: processData[i].result === 'agree' ? '同意' : '不同意',
        signature: processData[i].signature,
        remark: processData[i].comment.length
          ? processData[i].comment[0].text
          : '',
        createTime: processData[i].finishTime,
        round: processData[i].user.name,
      });
    }
  }
  return {
    auditFormData: [...auditFormData, ...otherData],
  };
});
if (delIndex.length) {
  formProcessData.value = formProcessData.value.filter(
    (ele: any, i: number) => delIndex.indexOf(i) === -1
  );
}
formProcessData.value.reverse();

// 根据当前的作业证状态判断显示什么按钮
const buttonList = computed<any>(() => {
  switch (props.certificateStatus as fireStatusEnum) {
    case fireStatusEnum.待分析: {
      if (currentProcess.value) {
        return [
          {
            key: 'operationAnalyze',
            text: '提交',
            type: 'primary',
          },
        ];
      }
    }
  }
});

const submitForm = async (formData: any) => {
  const imgAttach = auditFormData.value.imageFile.map((ele: any) => ({
    name: ele.name,
    url: ele.url,
    isImage: true,
  }));
  const fileAttach = auditFormData.value.uploadFile.map((ele: any) => ({
    name: ele.name,
    url: ele.url,
    isImage: false,
  }));
  const params = {
    action: auditFormData.value.result === '1' ? 'agree' : 'refuse',
    comment: {
      text: auditFormData.value.remark,
      attachments: [...imgAttach, ...fileAttach],
    },
    signature: auditFormData.value.signature,
    formData,
    instanceId: props.formProcessData.instanceId,
    // 看当前节点是不是常规节点，需要传过去更新状态
    processKey: currentProcess.value.processKey || '',
    taskId: currentProcess.value.taskId,
    nodeId: currentProcess.value.nodeId,
    updateSign: true,
  };
  await normalOperation(props.id, params);
  Message.success('操作成功');
  emits('initData');
};

// 点击按钮处理
const handleButtonClick = async (key: string) => {
  if (key === 'operationAnalyze') {
    const result = await audtiForm.value.validate();
    if (!result) {
      if (formDesign.value) {
        formRender.value.handleSave(async (formData: any) => {
          const paramsFormData: any = {};
          formItemIds.forEach((item: string) => {
            paramsFormData[item] = formData[item];
          });
          submitForm(paramsFormData);
        });
      } else {
        submitForm({});
      }
    }
  }
};
</script>
<style lang="less" scoped>
.form-render-container {
  display: flex;
  flex-direction: column;
  .process-form {
    & > div {
      padding: 0 !important;
    }

    .el-form-item__label {
      min-width: 120px;
      justify-content: flex-end;
    }
  }
  .jump-info-btn {
    margin: 5px 10px 5px 0;
  }
}

.operation-apply-form-btn {
  text-align: center;
  position: fixed;
  bottom: 10px;
  width: 100%;
  button {
    width: 90%;
    border-radius: 8px;
  }
  button + button {
    margin-left: 12px;
  }
}

:deep(.audit-part .arco-col.arco-form-item-label-col) {
  flex: 0 0 160px;
}

.audit-form-container-item {
  padding-bottom: 20px;
  .audit-item-title {
    padding-bottom: 20px;
    line-height: 28px;
    display: flex;
    align-items: center;
    .arco-divider-vertical {
      margin-right: 4px;
      border-left: 1px solid #409eff;
    }
    .audit-item-title-text {
      font-weight: bold;
      color: #999999;
    }
  }
}

:deep(.process-form) {
  .el-form-item__label {
    width: 160px !important;
  }
}

.audit-form-container {
  padding: 0 50px 0 30px;
  .audit-content {
    width: calc(100% - 125px);
    display: block;
    margin-left: auto;
  }
}
</style>
