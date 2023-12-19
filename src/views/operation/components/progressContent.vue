<template>
  <div class="steps-content">
    <a-steps :current="curStep" direction="vertical">
      <a-step
        v-for="item in progress"
        :key="item.nodeId"
        :status="
          item.lastNode && item.result === 'refuse' ? 'error' : undefined
        "
      >
        <template #icon v-if="item.lastNode && item.result === 'refuse'"
          ><icon-close />
        </template>
        <template #icon v-else-if="!specialStatus && item.lastNode"
          >{{ props.currentStep }}
        </template>
        <div v-if="item.lastNode && !item.result">
          <span>{{ item.name }}</span>
        </div>
        <div v-else class="detail-content">
          <div class="detail-time">
            <span>{{ item.finishTime }}</span>
          </div>
          <div class="detail-process">
            <span>{{ item.user.name }}</span>
            <span>{{ item.name }}</span>
          </div>
          <div
            class="detail-description"
            v-if="item.result && processKeyMap[item.processKey]"
          >
            <span
              class="font-weight"
              :style="{
                color: item.result === 'agree' ? '#4c9eff' : '#d9001b',
              }"
              >{{ processKeyMap[item.processKey]
              }}{{ item.result === 'agree' ? '合格' : '不合格' }}</span
            >
          </div>
        </div>
      </a-step>
    </a-steps>
  </div>
</template>
<script lang="ts" setup>
  import { formatDate } from '@/utils/utils';
  import { computed } from 'vue';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { useSafetyCertificationStore } from '@/store';
  import { cloneDeep } from 'lodash';

  const props = defineProps({
    formProcessData: {
      type: Object,
      required: true,
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    certificateStatus: {
      type: String,
      default: '',
    },
  });

  const store = useSafetyCertificationStore();

  const formProgress = cloneDeep(props.formProcessData.progress);

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
  if (condition) {
    formProgress.pop();
  }

  let progress = formProgress.map((ele: any, index: number) => {
    return {
      ...ele,
      startTime: ele.startTime ? formatDate(new Date(ele.startTime)) : '',
      finishTime: ele.finishTime ? formatDate(new Date(ele.finishTime)) : '',
      lastNode: index === formProgress.length - 1,
    };
  });

  const delIndex: number[] = [];

  progress.forEach((ele: any, index: number) => {
    for (let i = index + 1; i < progress.length; i++) {
      if (
        ele.nodeId === progress[i].nodeId &&
        ele.startTime === progress[i].startTime &&
        !ele.result
      ) {
        delIndex.push(i);
      }
    }
  });

  progress = progress.filter((ele: any, index: number) => {
    return !delIndex.includes(index + 1);
  });

  // 正常情况，progress返回的最后一个节点为下一个要处理的节点
  // 特殊情况，作业关闭或作业撤回的时候progress返回的是所有的节点
  const specialStatus = store.needAnalysis
    ? [fireStatusEnum.已撤回, fireStatusEnum.已关闭].includes(
        props.certificateStatus as fireStatusEnum
      )
    : [blindPlateStatusEnum.已撤回, blindPlateStatusEnum.已关闭].includes(
        props.certificateStatus as blindPlateStatusEnum
      );

  // 根据当前状态判断progress中的最后一个节点是不是真正的最后一个节点
  const curStep = computed(() => {
    const step = specialStatus
      ? props.formProcessData.progress.length + 1
      : props.formProcessData.progress.length;
    return step;
  });

  const processKeyMap: any = {
    analyse: '分析',
    review: '审查',
    siteCheck: '核查',
    extraNode: '审核',
  };
</script>
<style lang="less" scoped>
  .steps-content {
    margin-top: 30px;
    margin-left: 60px;

    :deep(.arco-steps-vertical) {
      align-items: flex-start;
      flex-direction: column-reverse;

      .arco-steps-item {
        margin: 0;
        min-height: 90px;
      }

      .overdue-report {
        background-color: #fff;

        .arco-steps-item-node > .arco-steps-icon {
          color: #f53f3f;
          border: 1px solid #f53f3f;
          background-color: #ffffff;
        }
      }

      .arco-steps-item:not(:first-child) .arco-steps-item-tail {
        position: absolute;
        top: 0;
        left: 13.5px;
        box-sizing: border-box;
        width: 1px;
        height: 100%;
        padding: 34px 0 6px;
      }

      .arco-steps-item:not(:first-child) .arco-steps-item-tail::after {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background-color: rgb(var(--primary-6));
      }

      .arco-steps-item:first-child .arco-steps-item-tail::after {
        display: none;
      }
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;

      .detail-time {
        color: var(--color-neutral-6);
        font-size: 16px;
        font-weight: bold;

        .detail-tag {
          margin-left: 10px;
          border-radius: 5px;
        }
      }

      .detail-process {
        color: var(--color-neutral-6);
        font-size: 14px;

        span + span {
          margin-left: 40px;
        }
      }

      .detail-description {
        font-size: 14px;
        display: flex;
        width: 300px;
        flex-wrap: wrap;
        .font-weight {
          font-weight: 600;
        }
      }
    }
  }
</style>
