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

    <div
      class="audit-form"
      v-if="currentProcess && type === 'edit'"
    >
      <div class="audit-form-title">{{ `${props.title}意见` }}</div>
      <div class="audit-form-content">
        <auditForm
          :taskId="currentProcess.taskId"
          ref="auditFormRef"
          v-model:auditFormData="auditFormData"
          status="edit"
          :text="`${props.text.slice(-2)}结果`"
          :resultText="{ pass: '通过', fail: '不通过' }"
        />
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
    </div>
    <div
      class="audit-form-container"
      v-if="formProcessData.length"
    >
      <div class="audit-form-container-title">{{ `${props.title}情况` }}</div>
      <div class="audit-content">
        <detailInfo
          :tableData="currentData[0].tableData"
          :text="`${props.text.slice(-2)}结果`"
          @jumpToEditApply="jumpToEditApply"
        />
      </div>
    </div>
    <div
      class="audit-form-container-item"
      v-for="(item, index) in historyData"
      :key="index"
    >
      <div class="audit-item-title">
        <a-divider
          direction="vertical"
          :size="6"
        />
        <span class="audit-item-title-text">{{
          '第' + (historyData.length - index) + `次${props.text.slice(-2)}结果`
        }}</span>
      </div>
      <div class="audit-content">
        <detailInfo
          :tableData="item.tableData"
          :text="`${props.text.slice(-2)}结果`"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import formRenderContent from './formRenderContent.vue';
import { useCertificate } from '../composition/useCertificate';
import { normalOperation } from '@/api/operation/operationApi';
import auditForm from './auditForm.vue';
import {
  blindPlateStatusEnum,
  fireStatusEnum,
  operationTypeEnum,
} from '../composition/useCertificateDict';
import { showToast } from 'vant';
import { Button } from 'vant';
import detailInfo from './detailInfo.vue';
import { inject } from 'vue';

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
    default: '审查结果',
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'detail',
  },
  applyUserId: {
    type: String,
    required: true,
  },
  certType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});
const userStore = { userId: localStorage.getItem('userId') };
const wx: any = inject('wx');

const { searchFormItem } = useCertificate();
const auditFormRef = ref<any>(null);
const formRender = ref<any>(null);
const formProcessData = ref<any[]>([]);

const needAnalysis = [
  operationTypeEnum.CONFINEDSPACE,
  operationTypeEnum.FIRE,
  operationTypeEnum.TEMPELECTRICITY,
].includes(props.certType as operationTypeEnum);

// 获取processKey为安全交底的，并且处理人为登陆人，并且未评审的，如果为空则说明登陆人不是操作人，显示detail页面
const currentProcess = computed<any>(() => {
  // 只找最近的一个processKey为''的
  for (let i = props.formProcessData.progress.length - 1; i > 0; i--) {
    const item = props.formProcessData.progress[i];
    if (item.processKey === '') {
      if (item.user.id == userStore.userId && !item.result) {
        return item;
      }
      if (
        props.formProcessData.progress[i - 1] &&
        props.formProcessData.progress[i - 1].processKey !== ''
      ) {
        return false;
      }
    }
  }
  return false;
});

// 获取节点对应的表单，如果没有的话会是undefined
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
  remark: '',
});

// 找到所有的一条额外节点的数据
const tempProgress = props.formProcessData.progress;
const processData: any[] = [];
for (let i = 0; i < tempProgress.length; i++) {
  if (tempProgress[i].processKey === '') {
    processData.push(tempProgress[i]);
  }
}

// 只有待安全交底中并且需要他签名的情况才可以编辑
const status = computed<string>(() => {
  if (currentProcess.value && !currentProcess.value.result) {
    return 'edit';
  }
  return 'detail';
});

const delIndex: number[] = [];
formProcessData.value = processData.map((item: any, index: number) => {
  // 正常情况
  const tableData: any[] = [
    {
      result: item.result ? (item.result === 'agree' ? '通过' : '不通过') : '',
      resultCode: item.result ? (item.result === 'agree' ? 1 : 0) : '',
      signature: item.signature,
      remark: item.comment.length ? item.comment[0].text : '',
      createTime: item.finishTime,
      round: item.user.name,
    },
  ];
  // 特殊情况会有一个两个人同时签字才能走到下一步，这时候流程节点的nodeId和startTime相同
  const otherData = [];
  for (let i = index + 1; i < processData.length; i++) {
    if (
      processData[i].nodeId === item.nodeId &&
      processData[i].startTime === item.startTime
    ) {
      delIndex.push(i);
      otherData.push({
        result: item.result
          ? item.result === 'agree'
            ? '通过'
            : '不通过'
          : '',
        resultCode: item.result ? (item.result === 'agree' ? 1 : 0) : '',
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
    tableData: [...tableData, ...otherData],
  };
});
if (delIndex.length) {
  formProcessData.value = formProcessData.value.filter(
    (ele: any, i: number) => delIndex.indexOf(i) === -1
  );
}
formProcessData.value.reverse();

//历史数据
const historyData = computed<any[]>(() => {
  return formProcessData.value.filter((item: any, index: number) => index > 0);
});
// 当前数据
const currentData = computed<any[]>(() => {
  const data = [formProcessData.value[0]];
  data[0].tableData = data[0].tableData.map((item: any) => {
    return {
      ...item,
      needEditApply:
        item.resultCode === 0 && props.applyUserId === userStore.userId,
    };
  });
  return data;
});

// 根据当前的作业证状态判断显示什么按钮
const buttonList = computed<any>(() => {
  if (currentProcess.value && !currentProcess.value.result) {
    return [
      {
        key: 'operationAnalyze',
        text: '确定',
        type: 'primary',
      },
    ];
  }
});

const submitForm = async (formData: any) => {
  const params = {
    action: auditFormData.value.result === '1' ? 'agree' : 'refuse',
    comment: {
      text: auditFormData.value.remark,
    },
    signature: auditFormData.value.signature,
    instanceId: props.formProcessData.instanceId,
    formData,
    // 看当前节点是不是常规节点，需要传过去更新状态
    processKey: currentProcess.value.processKey || '',
    taskId: currentProcess.value.taskId,
    nodeId: currentProcess.value.nodeId,
    updateSign: true,
  };
  await normalOperation(props.id, params);
  showToast({
    type: 'success',
    message: '操作成功',
    onClose: () => {
      wx.miniProgram.navigateBack();
    },
  });
};

// 点击按钮处理
const handleButtonClick = async (key: string) => {
  if (key === 'operationAnalyze') {
    const result = await auditFormRef.value.validate();
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
const jumpToEditApply = () => {};
</script>
<style lang="less">
body {
  background-color: #f2f2f2;
}
</style>
<style lang="less" scoped>
.form-render-container {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #545456;

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

.audit-form {
  .audit-form-title {
    padding: 10px 5px 8px 5px;
  }
  .audit-form-content {
    background-color: #ffffff;
    .operation-apply-form-btn {
      text-align: center;
      margin-top: 10px;
      padding-bottom: 20px;
      width: 100%;
      button {
        width: 90%;
        border-radius: 8px;
      }
      button + button {
        margin-left: 12px;
      }
    }
  }
}

:deep(.audit-part .arco-col.arco-form-item-label-col) {
  flex: 0 0 160px;
}

.audit-form-container-item {
  .audit-item-title {
    padding: 10px 5px 8px 5px;
    display: flex;
    align-items: center;
    .arco-divider-vertical {
      margin-right: 4px;
      border-left: 1px solid #409eff;
    }
  }
}

:deep(.process-form) {
  .el-form-item__label {
    width: 160px !important;
  }
}

.audit-form-container-title {
  padding: 10px 5px 8px 5px;
}
.audit-content {
  background-color: #ffffff;
  display: block;
  margin-left: auto;
}
</style>
