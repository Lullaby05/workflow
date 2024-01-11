<template>
  <div class="form-render-container">
    <div
      class="disclosure-form"
      v-if="status === 'edit'"
    >
      <Form required="auto">
        <Field
          label-width="120"
          v-model="formData.signature"
          readonly
          :rules="[{ required: true }]"
          label="安全交底人签名"
          placeholder="点击签名"
          input-align="right"
          @click-input="openSignModal(false)"
        >
          <template
            v-if="formData.signature"
            #input
          >
            <img
              v-if="formData.signature"
              class="sign-img"
              :src="formData.signature"
            />
          </template>
        </Field>
        <Field
          readonly
          :rules="[{ required: true }]"
          label-align="top"
          label="接受交底人签名"
          placeholder="点击签名"
          input-align="left"
          @click-input.self="openSignModal(true)"
        >
          <template
            v-if="formData.otherSignature.length > 0"
            #input
          >
            <div class="sign-input-list">
              <div
                class="sign-input-item"
                v-for="(item, index) in formData.otherSignature"
                :key="index"
              >
                <img
                  class="sign-img"
                  :src="item"
                />
                <span
                  style="color: #d9001b; font-size: 12px"
                  @click.self="deleteSignature(index)"
                  >删除</span
                >
              </div>
            </div>
          </template>
          <template #label>
            <div class="sign-label">
              <div>接受交底人签名</div>
              <Button
                v-if="formData.otherSignature.length > 0"
                type="primary"
                size="mini"
                @click.self="openSignModal(true)"
                >添加签名</Button
              >
            </div>
          </template>
        </Field>
      </Form>
      <div
        class="operation-apply-form-btn"
        v-if="status === 'edit'"
      >
        <Button
          v-for="item in buttonList"
          :key="item.key"
          :type="item.type || 'primary'"
          @click="handleButtonClick(item.key)"
        >
          {{ item.text }}
        </Button>
      </div>
    </div>
    <div
      class="disclosure-form-detail"
      v-if="status === 'detail'"
    >
      <!-- 有数据的情况 -->
      <div
        class="disclosure-form-card"
        v-if="lastDisclosure && lastDisclosure.result"
      >
        <div class="disclosure-content">
          <div class="disclosure-content-data">
            <div class="content-label">安全交底人签名</div>
            <div class="content-sign">
              <span class="sign-person-name">{{
                lastDisclosure.user.name
              }}</span>
              <img
                class="sign-img"
                :src="lastDisclosure.signature"
              />
            </div>
          </div>
          <div class="disclosure-content-data-accept">
            <div class="content-label">接受交底人签名</div>
            <div class="content-sign-list">
              <div
                class="sign-item"
                v-for="(item, index) in acceptDisclosure"
                :key="index"
              >
                <img
                  class="sign-img"
                  :src="item"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 没有数据的情况 -->
      <div
        class="disclosure-form-card"
        v-else
      >
        <div class="disclosure-person">
          <span class="person-text">{{ personArr[0].name }}</span>
        </div>
        <div class="no-data">
          <div class="no-data-text">待签署</div>
        </div>
      </div>
    </div>
    <Transition
      name="slide-fade"
      mode="out-in"
      appear
    >
      <signModal
        v-if="signModalVisible"
        @autographConfirm="signConfirm"
        @close="signModalVisible = false"
      />
    </Transition>
  </div>
</template>
<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import { useCertificate } from '../composition/useCertificate';
import { normalOperation } from '@/api/operation/operationApi';
import {
  blindPlateStatusEnum,
  fireStatusEnum,
  operationTypeEnum,
} from '../composition/useCertificateDict';
import { Field, Form, showToast, Button } from 'vant';
//@ts-ignore
import signModal from '@/views/admin/pitfall/sign.vue';

const props = defineProps({
  formProcessData: {
    type: Object,
    required: true,
  },
  originalProgress: {
    type: Array,
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
  certType: {
    type: String,
    required: true,
  },
});

const userStore = { userId: localStorage.getItem('userId') };
const wx: any = inject('wx');
const { searchFormItem } = useCertificate();
const formData = ref<any>({
  signature: '',
  otherSignature: [],
});

const needAnalysis = [
  operationTypeEnum.CONFINEDSPACE,
  operationTypeEnum.FIRE,
  operationTypeEnum.TEMPELECTRICITY,
].includes(props.certType as operationTypeEnum);

//@ts-ignore
const personInfo = (props.originalProgress as any[]).findLast(
  (item: any) => item.props.processKey === 'safeDisclosure'
);

const personFieldObj = {
  ASSIGN_USER: 'assignedUser',
  FORM_USER: 'formUser',
  ASSIGN_DEPT: 'assignedDept',
  FORM_DEPT: 'formDept',
};

const personField =
  personFieldObj[personInfo.props.assignedType as keyof typeof personFieldObj];
let tempArr: any[] = [];
// 如果是form则需要去formData取数据，否则直接从对应字段取
const formPersonReg = /form/;
if (formPersonReg.test(personField)) {
  // 表单字段
  personInfo.props[personField].forEach((ele: any) => {
    tempArr = Array.from(
      new Set([...tempArr, ...props.formProcessData.formData[ele]])
    );
  });
} else {
  tempArr = personInfo.props[personField];
}
const personArr = ref<any[]>(tempArr);

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

// 获取节点对应的表单，如果没有的话会是undefined
const formDesign: any = computed(() => {
  return searchFormItem(props.formProcessData, props.activeKey);
});
const formId: string = formDesign.value ? formDesign.value.formItems[0].id : '';

const lastDisclosureIndex: number =
  props.formProcessData.progress.findLastIndex(
    (ele: any) => ele.processKey === 'safeDisclosure'
  );
const lastDisclosure: any = props.formProcessData.progress[lastDisclosureIndex];
const condition: boolean = needAnalysis
  ? props.certificateStatus >= fireStatusEnum.已安全交底
  : props.certificateStatus >= blindPlateStatusEnum.已安全交底;

const acceptDisclosure = formDesign.value
  ? formDesign.value.formData[formId]
  : [];

// 只有待安全交底中并且需要他签名的情况才可以编辑
const status = computed<string>(() => {
  let condition: boolean = false;
  if (needAnalysis) {
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

const signModalVisible = ref(false);
const isAcceptSign = ref(false);
const openSignModal = (isAccept: boolean) => {
  signModalVisible.value = true;
  isAcceptSign.value = isAccept;
};
const signConfirm = (signature: { baseCode: string }) => {
  if (!isAcceptSign.value) {
    formData.value.signature = signature.baseCode;
  } else {
    formData.value.otherSignature.push(signature.baseCode);
  }
  signModalVisible.value = false;
};

const deleteSignature = (index: number) => {
  formData.value.otherSignature.splice(index, 1);
};

// 根据当前的作业证状态判断显示什么按钮
const buttonList = computed<any>(() => {
  if (needAnalysis) {
    switch (props.certificateStatus as fireStatusEnum) {
      case fireStatusEnum.安全交底中: {
        return [
          {
            key: 'operationAnalyze',
            text: '提交',
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
            text: '提交',
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
    if (formData.value.signature === '') {
      showToast({
        message: '请完成安全交底人签名',
      });
      return;
    } else if (formData.value.otherSignature.length === 0) {
      showToast({
        message: '请完成接受交底人签名',
      });
      return;
    }
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
    showToast({
      type: 'success',
      message: '操作成功',
      onClose: () => {
        wx.miniProgram.navigateBack();
      },
    });
  }
};
</script>
<style lang="less">
body {
  background-color: #f2f2f2;
}
</style>
<style lang="less" scoped>
.auditContainer {
  --van-cell-group-inset-padding: 0;
}
.sign-img {
  width: 300px;
  height: 150px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.form-render-container {
  padding-top: 5px;
  font-size: 14px;
  .disclosure-form {
    background-color: #ffffff;
    .sign-input-list {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
    }
    .sign-label {
      display: flex;
      flex: 1;
      & > button {
        margin-left: auto;
      }
    }
    .operation-apply-form-btn {
      text-align: center;
      margin-top: 30px;
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
  .sign-img {
    width: 100px;
    height: 50px;
  }
  .disclosure-form-detail {
    .disclosure-form-card {
      border-top: 1px solid #d7d7d7;
      border-bottom: 1px solid #d7d7d7;
      padding: 10px;
      background-color: #ffffff;
    }
    .disclosure-person {
      margin-bottom: 10px;
      .person-text {
        color: #333333;
        font-weight: bold;
      }
    }

    .disclosure-content {
      .disclosure-content-data {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #d7d7d7;
        padding-bottom: 10px;
      }
      .disclosure-content-data-accept {
        margin-top: 10px;
        .content-sign-list {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
      }
      .content-sign {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .sign-img {
        width: 100px;
        height: 50px;
      }
    }
  }
  .no-data {
    text-align: center;
    background-color: #fde8cc;
    padding: 5px 0;
    color: #333333;
  }
}
</style>
