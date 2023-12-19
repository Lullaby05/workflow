<template>
  <div class="form-render-container">
    <formRenderContent
      class="operation-apply-form"
      v-if="formDesign"
      :design="formDesign"
      :status="status"
    />
    <div class="operation-apply-form-btn">
      <a-button
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
  import { computed } from 'vue';
  import formRenderContent from './formRenderContent.vue';
  import { useCertificate } from '../composition/useCertificate';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store';
  import { experimentalOperation } from '@/api/operation/operationApi';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { useSafetyCertificationStore } from '@/store';

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
    currentStep: {
      type: Number,
      default: 1,
    },
    id: {
      type: String,
      required: true,
    },
    applyUserId: {
      type: String,
      required: true,
    },
  });
  const router = useRouter();
  const userStore = useUserStore();

  const { searchFormItem } = useCertificate();

  const formDesign: any = computed(() => {
    return searchFormItem(props.formProcessData, props.activeKey);
  });

  // 基本信息默认状态为detail
  const status = 'detail';

  const lastProgress =
    props.formProcessData.progress[props.formProcessData.progress.length - 1];

  const store = useSafetyCertificationStore();

  // 根据当前的作业证状态判断显示什么按钮
  const buttonList = computed<any>(() => {
    if (props.applyUserId != userStore.userId) return [];
    if (store.needAnalysis) {
      switch (props.certificateStatus as fireStatusEnum) {
        case fireStatusEnum.分析不合格:
        case fireStatusEnum.书面审核不通过:
        case fireStatusEnum.安全交底不通过:
        case fireStatusEnum.现场核查不通过: {
          return [
            {
              key: 'editOperation',
              text: '修改申请',
              type: 'primary',
            },
          ];
        }
        case fireStatusEnum.待分析: {
          return [
            {
              key: 'revocation',
              text: '撤回申请',
              status: 'danger',
            },
          ];
        }
        case fireStatusEnum.已关闭:
        case fireStatusEnum.已撤回: {
          return [
            {
              key: 'reApply',
              text: '重新申请',
              type: 'primary',
            },
          ];
        }
        default: {
          if (lastProgress.processKey === 'apply') {
            return [
              {
                key: 'editOperation',
                text: '修改申请',
                type: 'primary',
              },
            ];
          }
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
        case blindPlateStatusEnum.书面审核不通过:
        case blindPlateStatusEnum.安全交底不通过:
        case blindPlateStatusEnum.现场核查不通过: {
          return [
            {
              key: 'editOperation',
              text: '修改申请',
              type: 'primary',
            },
          ];
        }
        case blindPlateStatusEnum.书面审核中: {
          return [
            {
              key: 'revocation',
              text: '撤回申请',
              status: 'danger',
            },
          ];
        }
        case blindPlateStatusEnum.已关闭:
        case blindPlateStatusEnum.已撤回: {
          return [
            {
              key: 'reApply',
              text: '重新申请',
              type: 'primary',
            },
          ];
        }
        default: {
          if (lastProgress.processKey === 'apply') {
            return [
              {
                key: 'editOperation',
                text: '修改申请',
                type: 'primary',
              },
            ];
          }
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

  // 点击按钮处理
  const handleButtonClick = (key: string) => {
    switch (key) {
      case 'editOperation':
        toEditPage();
        break;
      case 'revocation':
        clickExperimentalOperation('revocation');
        break;
      case 'cancel':
        clickExperimentalOperation('cancel');
        break;
      case 'reApply':
        reApplyOperation();
        break;
    }
  };

  const routerNameAdd: any = {
    [operationTypeEnum.BLINDPLATE]: 'BlindPlateCertificateAdd',
    [operationTypeEnum.CONFINEDSPACE]: 'ConfinedSpaceCertificateAdd',
    [operationTypeEnum.GROUND]: 'GroundCertificateAdd',
    [operationTypeEnum.HIGHALTITUDE]: 'HighAltitudeCertificateAdd',
    [operationTypeEnum.FIRE]: 'FireCertificateAdd',
    [operationTypeEnum.HOIST]: 'HoistCertificateAdd',
    [operationTypeEnum.BROKENROAD]: 'BrokenRoadCertificateAdd',
    [operationTypeEnum.TEMPELECTRICITY]: 'TempElectricityCertificateAdd',
  };

  // 这里的id需要替换为真实id
  const toEditPage = () => {
    router.push({
      name: routerNameAdd[store.currentOperationType as operationTypeEnum],
      query: {
        id: props.id,
        type: 'edit',
      },
    });
  };

  // 特殊操作 取消、撤回
  const clickExperimentalOperation = async (type: string) => {
    const typeObj: any = {
      cancel: {
        operationType: 'cancel',
        title: '取消申请',
        content: '是否确认取消作业申请？',
      },
      revocation: {
        operationType: 'revocation',
        title: '撤回申请',
        content: '是否确认撤回作业申请？',
      },
    };
    Modal.open({
      title: typeObj[type].title,
      content: typeObj[type].content,
      titleAlign: 'start',
      onOk: async () => {
        await experimentalOperation({
          certId: props.id,
          userId: userStore.userId,
          beforeTaskId:
            props.formProcessData.progress[props.currentStep - 2].taskId,
          taskId: props.formProcessData.progress[props.currentStep - 1].taskId,
          operationType: typeObj[type].operationType,
        });
        Message.success(`${typeObj[type].title}成功`);
        router.back();
      },
    });
  };

  // 重新申请的逻辑是将现在的数据放到表单中，重新获取最新的编号并提交
  const reApplyOperation = () => {
    router.push({
      name: routerNameAdd[store.currentOperationType as operationTypeEnum],
      query: {
        id: props.id,
        type: 'reApply',
      },
    });
  };
</script>
<style lang="less" scoped>
  .form-render-container {
    display: flex;
    flex-direction: row;
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

    button + button {
      margin-left: 12px;
    }
  }
</style>
