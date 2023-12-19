<template>
  <div class="pause-container">
    <div class="pause-container-item">
      <div class="pause-item" v-for="(item, index) in pauseData">
        <div class="pause-item-title">
          <a-divider direction="vertical" :size="6" />
          <span class="pause-item-title-text">{{
            '第' + (pauseData.length - index) + '次暂停信息'
          }}</span>
        </div>
        <div class="pause-item-content">
          <span>作业暂停人: {{ item.pauseInfo.pausePerson }}</span>
          <span>作业暂停时间: {{ item.pauseInfo.pauseTime }}</span>
          <span>作业暂停原因: {{ item.pauseInfo.pauseReason }}</span>
        </div>
        <div class="pause-item-content" v-if="item.recoverInfo">
          <span>作业恢复人: {{ item.recoverInfo.recoverPerson }}</span>
          <span>作业恢复时间: {{ item.recoverInfo.recoverTime }}</span>
        </div>
      </div>
    </div>
    <div class="pause-btn" v-if="btnVisible">
      <a-button type="primary" @click="recoverOperation">恢复作业</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { experimentalOperation } from '@/api/operation/operationApi';
  import { useSafetyCertificationStore, useUserStore } from '@/store';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { computed } from 'vue';

  const props = defineProps({
    formProcessData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    id: {
      type: String,
      required: true,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    guardianUserId: {
      type: String,
      default: '',
    },
    certificateStatus: {
      type: String,
      default: '',
    },
  });

  const emits = defineEmits(['initData']);
  const userStore = useUserStore();

  const store = useSafetyCertificationStore();

  const btnVisible: boolean =
    props.guardianUserId == userStore.userId && store.needAnalysis
      ? props.certificateStatus === fireStatusEnum.作业暂停
      : props.certificateStatus === blindPlateStatusEnum.作业暂停;

  const recoverOperation = async () => {
    Modal.open({
      title: '恢复作业',
      content: '是否确认恢复作业？',
      titleAlign: 'start',
      onOk: async () => {
        await experimentalOperation({
          certId: props.id,
          userId: userStore.userId,
          beforeTaskId:
            props.formProcessData.progress[
              props.formProcessData.progress.length - 2
            ].taskId,
          operationType: 'recover',
        });
        Message.success('恢复作业成功');
        emits('initData');
      },
      onCancel: () => {},
    });
  };

  const pauseData: any[] = [];
  const progress: any[] = props.formProcessData.progress;
  // 收集所有的暂停和恢复信息
  // 把所有的暂停和恢复信息格式化，暂停和恢复信息是相邻的，如果暂停相邻没有恢复则恢复为空
  for (let i = 0; i < progress.length; ) {
    if (progress[i].operationType === 'pause') {
      let info: any = {};
      info.pauseInfo = {
        pausePerson: progress[i].user.name,
        pauseTime: progress[i].finishTime,
        pauseReason: progress[i].comment.length
          ? progress[i].comment[0].text || '无'
          : '无',
      };
      if (progress[i + 1].operationType === 'recover') {
        info.recoverInfo = {
          recoverPerson: progress[i + 1].user.name,
          recoverTime: progress[i + 1].finishTime,
        };
        i++;
      }
      pauseData.push(info);
    }
    i++;
  }
  // 暂停原因要先显示最后一次
  pauseData.reverse();
</script>
<style lang="less" scoped>
  .pause-container {
    display: flex;
    .pause-item {
      font-size: 14px;
      .pause-item-title {
        padding-bottom: 20px;
        line-height: 28px;
        display: flex;
        align-items: center;
        .arco-divider-vertical {
          margin-right: 4px;
          border-left: 1px solid #409eff;
        }
        .pause-item-title-text {
          font-weight: bold;
          color: #999999;
        }
      }
      .pause-item-content {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        line-height: 28px;
        width: 80%;
        margin-left: 100px;
      }
    }
    .pause-container-item {
      flex: 0 0 90%;
    }
    .pause-item + .pause-item {
      margin-top: 40px;
    }
  }
</style>
