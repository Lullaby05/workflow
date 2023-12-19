<template>
  <div class="preview-certificate" v-loading="loading">
    <div class="btn-group">
      <div v-if="props.status === 'preview'">
        <a-button
          v-if="pauseVisible"
          type="primary"
          @click="pauseModalVisible = true"
          >暂停作业</a-button
        >
        <a-button
          v-if="closeVisible"
          status="danger"
          @click="closeModalVisible = true"
          >关闭作业</a-button
        >
        <a-button
          v-if="startVisible"
          type="primary"
          @click="startModalVisible = true"
        >
          开始作业
        </a-button>
      </div>
      <div v-if="status === 'print'">
        <a-button @click="router.back()">返回</a-button>
        <a-button type="primary" v-print="printObj">打印</a-button>
      </div>
    </div>
    <div class="preview-content">
      <div class="preview-header">
        <div class="preview-content" v-loading="!printTemplate.length">
          <div v-html="printTemplate" id="printDom"></div>
        </div>
      </div>
    </div>
  </div>
  <a-modal
    title="作业暂停"
    :visible="pauseModalVisible"
    @cancel="closeModal"
    @ok="pauseOperation"
    title-align="start"
  >
    <a-form :model="formData">
      <a-form-item label="暂停原因" field="pauseReason">
        <a-textarea
          v-model="formData.pauseReason"
          :max-length="300"
          :auto-size="{
            minRows: 6,
            maxRows: 6,
          }"
          show-word-limit
          placeholder="请输入暂停原因"
        ></a-textarea>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal
    title="作业关闭"
    :visible="closeModalVisible"
    @cancel="closeModal"
    @ok="closeOperation"
    title-align="start"
  >
    <a-form ref="closeForm" :model="formData" :rules="formRule">
      <a-form-item label="关闭原因" field="closeReason">
        <a-textarea
          v-model="formData.closeReason"
          :max-length="300"
          :auto-size="{
            minRows: 6,
            maxRows: 6,
          }"
          show-word-limit
          placeholder="请输入关闭原因"
        ></a-textarea>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal
    title="开始作业"
    :visible="startModalVisible"
    @cancel="closeModal"
    @ok="startOperation"
    title-align="start"
  >
    <a-form ref="closeForm" :model="formData">
      <a-form-item label="开始时间" field="StartTime">
        <a-date-picker
          :allow-clear="false"
          v-model="formData.StartTime"
          placeholder="请选择开始时间"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
  import {
    experimentalOperation,
    getCertificatePrint,
    normalOperation,
  } from '@/api/operation/operationApi';
  import { computed, nextTick, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useSafetyCertificationStore, useUserStore } from '@/store';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
  } from '../composition/useCertificateDict';
  import { Message } from '@arco-design/web-vue';
  import { useRoute } from 'vue-router';
  import { bindVar, getVal } from '@/utils/print';
  import { formatDate } from '@/utils/utils';
  import { watch } from 'vue';

  // status为状态，（打印、预览、详情）
  const props = defineProps({
    formProcessData: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: 'preview',
    },
    certificateStatus: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
    guardianUserId: {
      // 作业监护人Id
      type: String,
      default: '',
    },
  });

  const emits = defineEmits(['initData']);
  const router = useRouter();
  const userStore = useUserStore();
  const route = useRoute();

  const { id, status } = route.query;

  const pauseModalVisible = ref<boolean>(false);
  const closeModalVisible = ref<boolean>(false);
  const startModalVisible = ref<boolean>(false);
  const closeForm = ref<any>(null);

  const formData = ref<any>({
    pauseReason: '',
    closeReason: '',
    StartTime: new Date(),
  });
  const formRule = {
    closeReason: [{ required: true, message: '请输入关闭原因' }],
  };

  const store = useSafetyCertificationStore();

  const condition = store.needAnalysis
    ? props.certificateStatus === fireStatusEnum.作业中
    : props.certificateStatus === blindPlateStatusEnum.作业中;

  // 当前按钮是否显示
  const pauseVisible = condition && props.guardianUserId == userStore.userId; // 作业中才展示作业暂停
  const closeVisible = condition && props.guardianUserId == userStore.userId; //作业中的监护人才可以关闭作业
  const startVisible =
    props.certificateStatus === blindPlateStatusEnum.已安全交底 &&
    props.guardianUserId == userStore.userId; //已安全交底的监护人才可以开始作业(只有盲板抽堵才需要开始作业)

  // 暂停和关闭是在作业办理的时候打开，所以用prop.id
  const pauseOperation = async () => {
    await experimentalOperation({
      certId: props.id,
      userId: userStore.userId,
      beforeTaskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 2
        ].taskId,
      taskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 1
        ].taskId,
      operationType: 'pause',
      reason: formData.value.pauseReason,
    });
    Message.success('暂停作业成功');
    pauseModalVisible.value = false;
    emits('initData');
  };
  const closeOperation = async () => {
    const result = await closeForm.value.validate();
    if (result) return;
    await experimentalOperation({
      certId: props.id,
      userId: userStore.userId,
      beforeTaskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 2
        ].taskId,
      taskId:
        props.formProcessData.progress[
          props.formProcessData.progress.length - 1
        ].taskId,
      operationType: 'close',
      reason: formData.value.closeReason,
    });
    Message.success('关闭作业成功');
    closeModalVisible.value = false;
    emits('initData');
  };

  const currentProcess = computed<any>(() => {
    // 只找最近的一个processKey为operationStart的
    for (let i = props.formProcessData.progress.length - 1; i > 0; i--) {
      const item = props.formProcessData.progress[i];
      if (item.processKey === 'operationStart') {
        if (item.user.id == userStore.userId && !item.result) {
          return item;
        }
        if (
          props.formProcessData.progress[i - 1] &&
          props.formProcessData.progress[i - 1].processKey !== 'operationStart'
        ) {
          return false;
        }
      }
    }
    return false;
  });

  const startOperation = async () => {
    const params = {
      action: 'agree',
      instanceId: props.formProcessData.instanceId,
      formData: {},
      // 看当前节点是不是常规节点，需要传过去更新状态
      processKey: currentProcess.value.processKey || '',
      taskId: currentProcess.value.taskId,
      nodeId: currentProcess.value.nodeId,
      operationBeginTime: formData.value.startTime,
      updateSign: true,
    };
    await normalOperation(props.id, params);
    Message.success('开始作业成功');
    closeModalVisible.value = false;
    emits('initData');
  };

  const closeModal = () => {
    formData.value = {
      pauseReason: '',
      closeReason: '',
      StartTime: new Date(),
    };
    pauseModalVisible.value = false;
    closeModalVisible.value = false;
    startModalVisible.value = false;
  };

  const formatFormData = computed(async () => {
    let val: any = {};
    await getVal(
      props.formProcessData.formData || {},
      props.formProcessData.formItems || [],
      val
    );
    val.ownerDept = props.formProcessData.starterDept;
    val.owner = props.formProcessData.staterUser.name;
    val.startTime =
      props.formProcessData.startTime &&
      formatDate(props.formProcessData.startTime);
    val.finishTime =
      props.formProcessData.finishTime &&
      formatDate(props.formProcessData.finishTime);
    val.code = props.formProcessData.instanceId;
    return val;
  });

  const printTemplate = ref<string>('');
  const loading = ref<boolean>(false);

  const getPrintDetail = async () => {
    const paramId = id ? id : props.id;
    const { data } = await getCertificatePrint(paramId as string);
    nextTick(async () => {
      printTemplate.value = bindVar(
        data.printTemplate,
        await formatFormData.value,
        props.formProcessData.progress,
        'printDom'
      );
    });
  };

  formatFormData.value;
  setTimeout(() => {
    getPrintDetail();
  }, 500);

  watch(
    () => props.formProcessData,
    async () => {
      if (Object.keys(props.formProcessData).length) {
        await formatFormData.value;
        setTimeout(() => {
          getPrintDetail();
        }, 500);
      }
    }
  );

  const printObj = {
    id: 'printDom', //  需要打印区域
    popTitle: '安全作业证',
    preview: false,
    previewTitle: '安全作业证',
    previewPrintBtnLabel: '预览结束，开始打印',
    zIndex: 20002,
    previewBeforeOpenCallback() {
      console.log('正在加载预览窗口！');
    }, // 预览窗口打开之前的callback
    previewOpenCallback() {
      console.log('已经加载完预览窗口，预览打开了！');
    }, // 预览窗口打开时的callback
    beforeOpenCallback() {
      console.log('开始打印之前！');
    }, // 开始打印之前的callback
    openCallback() {
      console.log('执行打印了！');
    }, // 调用打印时的callback
    closeCallback() {
      console.log('关闭了打印工具！');
    }, // 关闭打印的callback(无法区分确认or取消)
    clickMounted() {
      console.log('点击v-print绑定的按钮了！');
    },
  };
</script>
<style lang="less" scoped>
  .preview-certificate {
    display: flex;
    flex-direction: column;

    .btn-group {
      flex: 0 0 auto;
      text-align: right;
      margin-bottom: 20px;

      button + button {
        margin-left: 12px;
      }
    }

    .preview-content {
      flex: 1;
    }
  }
</style>
