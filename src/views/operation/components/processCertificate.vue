<!-- 作业证管理所有页面的进程管理 -->
<template>
  <div class="process-certificate-tabs">
    <a-steps label-placement="vertical" :current="curStep">
      <a-step
        v-for="(item, index) in process"
        :key="item.value"
        :status="
          index + 1 === curStep && (specialStatus || condition)
            ? 'error'
            : undefined
        "
      >
        <template
          #icon
          v-if="index + 1 === curStep && (specialStatus || condition)"
          ><icon-close />
        </template>
        {{ item.description }}
      </a-step>
    </a-steps>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { useSafetyCertificationStore } from '@/store';
  import { cloneDeep } from 'lodash';

  const props = defineProps({
    processList: {
      type: Array<{ value: number; description: string }>,
      default: () => [
        { value: 1, description: '作业申请' },
        { value: 2, description: '作业分析' },
        { value: 3, description: '书面审查' },
        { value: 4, description: '现场核查' },
        { value: 5, description: '安全交底' },
        { value: 6, description: '作业实施' },
        { value: 7, description: '作业验收' },
      ],
    },
    dataProcess: {
      type: Object,
      default: () => ({}),
    },
    certificateStatus: {
      type: String,
      default: '',
    },
  });

  const process = props.processList.map((ele: any, index: number) => {
    return {
      index: index + 1,
      description: ele.name,
      value: ele.id,
      processKey: ele.props.processKey || '',
    };
  });

  const allProcess = cloneDeep(props.dataProcess.progress);

  const safeDisclosure = process.findIndex(
    (item: any) => item.processKey === 'safeDisclosure'
  );
  const store = useSafetyCertificationStore();
  if (store.currentOperationType !== operationTypeEnum.BLINDPLATE) {
    process.splice(safeDisclosure + 1, 0, {
      index: 0,
      description: '作业实施',
      value: 'node_' + Math.random().toString().substring(2, 14),
      processKey: 'operationStart',
    });
  }

  let lastStep: any = {};

  let condition: boolean = false;
  if (store.needAnalysis) {
    condition = [
      fireStatusEnum.书面审核不通过,
      fireStatusEnum.分析不合格,
      fireStatusEnum.现场核查不通过,
    ].includes(props.certificateStatus as fireStatusEnum);
  } else {
    condition = [
      blindPlateStatusEnum.书面审核不通过,
      blindPlateStatusEnum.现场核查不通过,
    ].includes(props.certificateStatus as blindPlateStatusEnum);
  }
  // 如果是不通过的情况，取倒数第二个节点为最后一个节点
  const tempLast = condition
    ? allProcess[allProcess.length - 2]
    : allProcess[allProcess.length - 1];

  // operationType取值 cancel-作业取消、revocation-作业撤销、close-作业关闭、pause-作业暂停、recover-作业恢复
  let specialStatus: boolean = false; // 判断当前节点是不是特殊节点，作业暂停、作业恢复等（operationType为cancal、revocation、close）
  if (['cancel', 'revocation', 'close'].includes(tempLast.operationType)) {
    // 如果最后一个节点没有processKey，则获取为最后一个节点的processKey不是undefined的节点
    const index = allProcess.findLastIndex(
      (item: any) => item.processKey !== undefined
    );
    specialStatus = true;
    lastStep = allProcess[index];
  } else {
    lastStep = tempLast;
  }

  const step = process.findIndex((item: any) => item.value === lastStep.nodeId);

  // 当前步骤、最后一步为作业验收的时候，直接通过
  // 作业中的时候作业实施为目标节点
  const curStep = computed(() => {
    const specialCondition = store.needAnalysis
      ? [fireStatusEnum.作业中, fireStatusEnum.作业暂停].includes(
          props.certificateStatus as fireStatusEnum
        ) || ['pause', 'recover'].includes(tempLast.operationType)
      : [blindPlateStatusEnum.作业中, blindPlateStatusEnum.作业暂停].includes(
          props.certificateStatus as blindPlateStatusEnum
        ) || ['pause', 'recover'].includes(tempLast.operationType);
    if (specialStatus) {
      if (store.currentOperationType === operationTypeEnum.BLINDPLATE) {
        return step + 1;
      }
      return step + 2;
    }
    if (specialCondition) {
      return (
        process.findIndex((item: any) => item.processKey === 'operationStart') +
        1
      );
    }
    return lastStep.processKey === 'acceptance' && lastStep.result
      ? step + 2
      : step + 1;
  });
</script>
<style lang="less" scoped>
  .process-certificate-tabs :deep(.arco-steps) {
    .arco-steps-item-title {
      font-size: 14px;
      font-weight: bold;
      color: #999999;
    }
    .arco-steps-icon {
      background-color: #ffffff;
      border: 2px solid #999999;
      color: #999999;
      line-height: 23px;
    }
    .arco-steps-item-active .arco-steps-icon {
      background-color: #409eff;
      border: none;
      color: #ffffff;
    }
    .arco-steps-item-finish {
      .arco-steps-icon {
        border: 2px solid #409eff;
        color: #409eff;
      }
      .arco-steps-item-tail::after {
        background-color: #409eff;
      }
    }

    .arco-steps-item-error.arco-steps-item-active .arco-steps-icon {
      background-color: #d9001b;
      border: none;
      color: #ffffff;
    }
    .arco-steps-item-error {
      .arco-steps-icon {
        border: 2px solid #d9001b;
        color: #d9001b;
      }
      .arco-steps-item-title {
        color: #d9001b;
      }
    }
  }
</style>
