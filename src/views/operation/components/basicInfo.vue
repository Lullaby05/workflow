<template>
  <div class="container">
    <div
      class="header"
      v-if="userId == props.applyUserId"
    >
      <Button
        :type="item.status"
        size="mini"
        v-for="(item, index) in buttonList"
        :key="index"
        @click="clickExperimentalOperation(item.key)"
        >{{ item.text }}</Button
      >
    </div>
    <div class="preview-container">
      <previewCertificate
        v-if="formProcessData"
        :form-process-data="formProcessData"
        status="preview"
        :id="props.id"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import previewCertificate from './previewCertificate.vue';
import { computed, onBeforeMount, ref } from 'vue';
import { Button, showConfirmDialog, showToast } from 'vant';
import {
  blindPlateStatusEnum,
  fireStatusEnum,
  operationTypeEnum,
} from '../composition/useCertificateDict';
import { experimentalOperation } from '@/api/operation/operationApi';
import { inject } from 'vue';

const props = defineProps({
  formProcessData: {
    type: Object,
    required: true,
  },
  originalProgress: {
    type: Array,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  applyUserId: {
    type: String,
    required: true,
  },
  certType: {
    type: String,
    required: true,
  },
  certificateStatus: {
    type: String,
    default: '',
  },
});

const formProcessData = ref<any>({});

const userId = localStorage.getItem('userId');

const wx: any = inject('wx');

const needAnalysis = [
  operationTypeEnum.CONFINEDSPACE,
  operationTypeEnum.FIRE,
  operationTypeEnum.TEMPELECTRICITY,
].includes(props.certType as operationTypeEnum);

let lastProgress: any = {};
// 如果最后一个节点没有processKey，则获取为倒数第二个节点
const tempLast =
  props.formProcessData.progress[props.formProcessData.progress.length - 1];
if (tempLast.processKey === undefined) {
  const lastIndex = props.formProcessData.progress.findLastIndex(
    (ele: any) => ele.processKey
  );
  lastProgress = props.formProcessData.progress[lastIndex];
} else if (tempLast.processKey === 'apply') {
  const lastIndex = props.formProcessData.progress.findLastIndex(
    (ele: any) => ele.result
  );
  lastProgress = props.formProcessData.progress[lastIndex];
} else {
  lastProgress = tempLast;
}

const currentStep = ref<number>(0);
currentStep.value =
  props.originalProgress.findIndex(
    (ele: any) => ele.id === lastProgress.nodeId
  ) + 1;

// 根据当前的作业证状态判断显示什么按钮
const buttonList = computed<any>(() => {
  if (props.applyUserId != userId) return [];
  if (needAnalysis) {
    switch (props.certificateStatus as fireStatusEnum) {
      case fireStatusEnum.待分析: {
        return [
          {
            key: 'revocation',
            text: '撤回申请',
            status: 'danger',
          },
        ];
      }
      case fireStatusEnum.分析不合格:
      case fireStatusEnum.书面审核不通过:
      case fireStatusEnum.安全交底不通过:
      case fireStatusEnum.现场核查不通过:
      case fireStatusEnum.已关闭:
      case fireStatusEnum.已撤回: {
        return [];
      }
      default: {
        return [
          {
            key: 'cancel',
            text: '取消申请',
            status: 'danger',
          },
        ];
      }
    }
  } else {
    switch (props.certificateStatus as blindPlateStatusEnum) {
      case blindPlateStatusEnum.书面审核中: {
        return [
          {
            key: 'revocation',
            text: '撤回申请',
            status: 'danger',
          },
        ];
      }
      case blindPlateStatusEnum.书面审核不通过:
      case blindPlateStatusEnum.安全交底不通过:
      case blindPlateStatusEnum.现场核查不通过:
      case blindPlateStatusEnum.已关闭:
      case blindPlateStatusEnum.已撤回: {
        return [];
      }
      default: {
        return [
          {
            key: 'cancel',
            text: '取消申请',
            status: 'danger',
          },
        ];
      }
    }
  }
});

// 特殊操作 取消、撤回
const clickExperimentalOperation = async (type: string) => {
  const typeObj: any = {
    cancel: {
      operationType: 'cancel',
      title: '取消申请',
      content: `作业处于${lastProgress.name}环节中，是否确认取消申请？`,
    },
    revocation: {
      operationType: 'revocation',
      title: '撤回申请',
      content: '是否确认撤回申请？',
    },
  };
  showConfirmDialog({
    title: '',
    message: typeObj[type].content,
  }).then(async () => {
    await experimentalOperation({
      certId: props.id,
      userId: userId,
      beforeTaskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 2
        ].taskId,
      taskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 1
        ].taskId,
      operationType: typeObj[type].operationType,
    });
    showToast({
      type: 'success',
      message: `${typeObj[type].title}成功`,
      onClose: () => {
        wx.miniProgram.navigateBack();
      },
    });
  });
};

onBeforeMount(async () => {
  formProcessData.value = props.formProcessData;
});
</script>
<style lang="less" scoped>
.header {
  text-align: right;
  padding: 5px 0;
}
.preview-container {
  // padding: 0px 20px 20px 20px;
  display: flex;
  flex-direction: column;
}
.process {
  width: 100%;
  border-radius: 10px;
  background-color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
