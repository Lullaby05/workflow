<template>
  <div class="form-render-container">
    <auditForm
      v-if="detailProcessData.finishTime || currentProcess"
      ref="audtiForm"
      v-model:auditFormData="auditFormData"
      :status="status"
      :text="props.text"
      :taskId="currentProcess.taskId"
      :needCheckSign="true"
      :needResult="false"
    />
    <div class="operation-apply-form-btn">
      <a-button
        v-if="status === 'edit'"
        v-for="item in buttonList"
        :key="item.key"
        :type="item.type || 'primary'"
        :status="item.status || ''"
        @click="handleButtonClick(item.key)"
      >
        {{ item.text }}
      </a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useSafetyCertificationStore, useUserStore } from '@/store';
  import { normalOperation } from '@/api/operation/operationApi';
  import auditForm from '../components/auditForm.vue';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { Message } from '@arco-design/web-vue';

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
      default: '验收',
    },
    id: {
      type: String,
      required: true,
    },
    closeDesc: {
      type: String,
      default: '',
    },
  });
  const router = useRouter();
  const userStore = useUserStore();
  const audtiForm = ref<any>(null);

  // 审核相关表单
  const auditFormData = ref<any>({
    result: '1',
    signature: '',
    imageFile: [],
    uploadFile: [],
    remark: '',
  });

  const emits = defineEmits(['initData']);

  // 没有被审批过的作业验收节点为当前人的最新节点，若为空则说明不是审批人
  const currentProcess = computed<any>(() => {
    let result: any = false;
    props.formProcessData.progress.forEach((item: any) => {
      if (
        item.processKey === 'acceptance' &&
        item.user.id == userStore.userId &&
        !item.result
      ) {
        result = item;
      }
    });
    return result;
  });

  const lastIndex = props.formProcessData.progress.findLastIndex(
    (item: any) => {
      return (
        item.processKey === 'acceptance' ||
        item.operationType === 'close' ||
        item.operationType === 'cancel'
      );
    }
  );
  const detailProcessData: any = props.formProcessData.progress[lastIndex];

  const store = useSafetyCertificationStore();

  // 只有作业中阶段可以编辑
  const status = computed<string>(() => {
    let condition: boolean = false;
    if (store.needAnalysis) {
      condition = props.certificateStatus === fireStatusEnum.作业中;
    } else {
      condition = props.certificateStatus === blindPlateStatusEnum.作业中;
    }
    if (condition && currentProcess.value) {
      return 'edit';
    } else {
      return 'detail';
    }
  });

  if (status.value === 'detail') {
    auditFormData.value = {
      signature: detailProcessData.signature,
      closeReason: props.closeDesc,
      closePerson: detailProcessData.user.name,
      closeTime: detailProcessData.finishTime,
    };
  }

  // 根据当前的作业证状态判断显示什么按钮
  const buttonList = computed<any>(() => {
    if (store.needAnalysis) {
      switch (props.certificateStatus as fireStatusEnum) {
        case fireStatusEnum.作业中: {
          return [
            {
              key: 'operationAnalyze',
              text: '确定',
              type: 'primary',
            },
          ];
        }
      }
    } else {
      switch (props.certificateStatus as blindPlateStatusEnum) {
        case blindPlateStatusEnum.作业中: {
          return [
            {
              key: 'operationAnalyze',
              text: '确定',
              type: 'primary',
            },
          ];
        }
      }
    }
  });

  // 点击按钮处理
  const handleButtonClick = async (key: string) => {
    if (key === 'operationAnalyze') {
      const result = await audtiForm.value.validate();
      if (!result) {
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
          formData: {},
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
        padding: 0 10px;
      }

      .el-form-item__label {
        min-width: 120px;
        justify-content: flex-end;
      }
    }
  }

  .operation-apply-form {
    flex-basis: 90%;
    padding-right: 20px;
  }

  .operation-apply-form-btn {
    flex: 1;
    text-align: center;
    button + button {
      margin-left: 12px;
    }
  }

  :deep(.audit-part .arco-col.arco-form-item-label-col) {
    flex: 0 0 160px;
  }
</style>
