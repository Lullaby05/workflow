<template>
  <div class="form-render-container">
    <div class="disclosure-form" v-if="status === 'edit'">
      <a-form ref="form" :model="formData" :rules="rules">
        <a-form-item label="安全交底人签名" field="signature">
          <div class="sign-container">
            <a-button type="primary" @click="openSignModal">{{
              formData.signature ? '重签' : '签名'
            }}</a-button>
            <img
              class="sign-img"
              style="margin-top: 10px"
              v-if="formData.signature"
              :src="formData.signature"
              alt=""
            />
          </div>
        </a-form-item>
        <a-form-item label="接受交底人签名" field="otherSignature">
          <div class="sign-container">
            <a-button type="primary" @click="openOtherSignModal">{{
              formData.otherSignature.length ? '加签' : '签名'
            }}</a-button>
            <div class="sign-list">
              <div
                class="sign-img"
                v-if="formData.otherSignature"
                v-for="(item, index) in formData.otherSignature"
                :key="index"
              >
                <icon-close
                  v-if="status === 'edit'"
                  class="sign-del"
                  @click="handleDelSign('otherSignature', index)"
                />
                <img :src="item" />
              </div>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div
      class="disclosure-form-detail"
      v-if="lastDisclosure.finishTime && status === 'detail'"
    >
      <cardDisplay :card-items="cardItems" />
    </div>
    <div class="operation-apply-form-btn" v-if="status === 'edit'">
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
  <!-- 安全交底人签名 -->
  <a-modal
    :visible="signModalVisible"
    title="请工整书写您的名字"
    :footer="false"
    @cancel="closeSignModal"
  >
    <div class="sign-modal-content">
      <canvas
        ref="signRef"
        width="480"
        style="border: 1px dashed #999999"
      ></canvas>
    </div>
    <div class="sign-modal-footer">
      <a-button type="primary" @click="clearSign()">重写</a-button>
      <a-button type="primary" @click="closeSignModal">取消</a-button>
      <a-button type="primary" @click="handleConfirm">确定</a-button>
    </div>
  </a-modal>
  <!-- 接受安全交底人签名 -->
  <a-modal
    :visible="otherSignModalVisible"
    title="请工整书写您的名字"
    :footer="false"
    @cancel="closeOtherSignModal"
  >
    <div class="sign-modal-content">
      <canvas
        ref="otherSignRef"
        width="480"
        style="border: 1px dashed #999999"
      ></canvas>
    </div>
    <div class="sign-modal-footer">
      <a-button type="primary" @click="clearOtherSign()">重写</a-button>
      <a-button type="primary" @click="closeOtherSignModal">取消</a-button>
      <a-button type="primary" @click="handleOtherConfirm">确定</a-button>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { useCertificate } from '../composition/useCertificate';
  import { useRouter } from 'vue-router';
  import { useSafetyCertificationStore, useUserStore } from '@/store';
  import { normalOperation } from '@/api/operation/operationApi';
  import {
    blindPlateStatusEnum,
    fireStatusEnum,
    operationTypeEnum,
  } from '../composition/useCertificateDict';
  import { Message } from '@arco-design/web-vue';
  import { useSign } from '@/views/pitfall/snapshot/composition/useSign';
  import cardDisplay from '@/views/pitfall/snapshot/components/cardDisplay.vue';

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
  });
  const router = useRouter();
  const userStore = useUserStore();
  const { searchFormItem } = useCertificate();
  const store = useSafetyCertificationStore();
  // 获取processKey为安全交底的，并且处理人为登陆人，并且未评审的，如果为空则说明登陆人不是操作人，显示detail页面
  const currentProcess = computed<any>(() => {
    // 只找最近的一个processKey为safeDisclosure的
    for (let i = props.formProcessData.progress.length - 1; i > 0; i--) {
      const item = props.formProcessData.progress[i];
      if (item.processKey === 'safeDisclosure') {
        if (item.user.id == userStore.userId && !item.result) {
          return item;
        }
        if (
          props.formProcessData.progress[i - 1] &&
          props.formProcessData.progress[i - 1].processKey !== 'safeDisclosure'
        ) {
          return false;
        }
      }
    }
    return false;
  });

  const signRef = ref<HTMLCanvasElement | null>(null); // 签名画布Ref
  const {
    signModalVisible,
    openSignModal,
    closeSignModal,
    clearSign,
    confirmSign,
  } = useSign(signRef);

  const otherSignRef = ref<HTMLCanvasElement | null>(null); // 签名画布Ref
  const {
    signModalVisible: otherSignModalVisible,
    openSignModal: openOtherSignModal,
    closeSignModal: closeOtherSignModal,
    clearSign: clearOtherSign,
    confirmSign: confirmOtherSign,
  } = useSign(otherSignRef);

  const formData = ref<any>({
    signature: '',
    otherSignature: [],
  });

  // 获取节点对应的表单，如果没有的话会是undefined
  const formDesign: any = computed(() => {
    return searchFormItem(props.formProcessData, props.activeKey);
  });
  const formId: string = formDesign.value
    ? formDesign.value.formItems[0].id
    : '';

  const emits = defineEmits(['initData']);
  const form = ref<any>(null);
  const rules = {
    signature: [
      {
        required: true,
        message: '请填写安全交底人签名',
      },
    ],
    otherSignature: [
      {
        required: true,
        message: '请填写接受交底人签名',
      },
    ],
  };

  const lastDisclosureIndex: number =
    props.formProcessData.progress.findLastIndex(
      (ele: any) => ele.processKey === 'safeDisclosure'
    );
  const lastDisclosure: any =
    props.formProcessData.progress[lastDisclosureIndex];
  const condition: boolean = store.needAnalysis
    ? props.certificateStatus >= fireStatusEnum.已安全交底
    : props.certificateStatus >= blindPlateStatusEnum.已安全交底;
  const cardItems = ref<any>({
    title: '',
    items: [
      {
        id: 1,
        field: '安全交底人',
        value: lastDisclosure.signature,
        type: 'sign',
      },
      {
        id: 2,
        field: '接受安全交底人',
        value: formDesign.value ? formDesign.value.formData[formId] : [],
        type: 'signArray',
      },
      {
        id: 3,
        field: '安全交底时间',
        value: lastDisclosure.finishTime,
        visible: condition,
      },
    ],
  });

  // 只有待安全交底中并且需要他签名的情况才可以编辑
  const status = computed<string>(() => {
    let condition: boolean = false;
    if (store.needAnalysis) {
      condition = props.certificateStatus === fireStatusEnum.安全交底中;
    } else {
      condition = props.certificateStatus === blindPlateStatusEnum.安全交底中;
    }
    if (condition && currentProcess.value) {
      return 'edit';
    } else {
      return 'detail';
    }
  });

  const handleConfirm = () => {
    const result = confirmSign();
    if (result) {
      formData.value.signature = result;
    }
  };

  const handleOtherConfirm = () => {
    const result = confirmOtherSign();
    if (result) {
      formData.value.otherSignature.push(result);
    }
  };

  const handleDelSign = (formKey: string, index: number) => {
    formData.value[formKey].splice(index, 1);
  };

  // 根据当前的作业证状态判断显示什么按钮
  const buttonList = computed<any>(() => {
    if (store.needAnalysis) {
      switch (props.certificateStatus as fireStatusEnum) {
        case fireStatusEnum.安全交底中: {
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
        case blindPlateStatusEnum.安全交底中: {
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
      const result = await form.value.validate();
      if (!result) {
        const params = {
          action: 'agree',
          signature: formData.value.signature,
          formData: formId
            ? {
                [formId]: formData.value.otherSignature,
              }
            : {},
          instanceId: props.formProcessData.instanceId,
          // 看当前节点是不是常规节点，需要传过去更新状态
          processKey: currentProcess.value.processKey || '',
          taskId: currentProcess.value.taskId,
          nodeId: currentProcess.value.nodeId,
          updateSign: true,
          userId: userStore.userId,
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
  .operation-apply-form-btn {
    text-align: center;
  }
  .sign-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    img {
      width: 200px;
      height: 100px;
    }
    .sign-img {
      position: relative;
      border: 1px solid #999999;
    }
  }
  .sign-modal-footer {
    text-align: right;
    button {
      margin-left: 20px;
    }
  }
  .sign-list {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    .sign-del {
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .sign-img {
      position: relative;
      border: 1px solid #999999;
      margin: 0px 10px 10px 0px;
    }
  }

  :deep(.card-display-content) {
    width: auto;
    .content-items div:first-child {
      margin-right: 10px;
    }
  }
</style>
