<template>
  <div class="auditContainer">
    <div
      class="audit-part"
      v-if="props.status === 'edit'"
    >
      <a-form
        :model="formData"
        ref="auditForm"
      >
        <a-form-item
          :label="props.text + '结果'"
          field="result"
          v-if="props.needResult"
          :rules="auditRules.result"
        >
          <a-radio-group v-model="formData.result">
            <a-radio value="1">{{ props.resultText.pass }}</a-radio>
            <a-radio value="2">{{ props.resultText.fail }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="needSign"
          :label="props.text + '人签名'"
          field="signature"
          :rules="auditRules.signature"
        >
          <div class="sign-container">
            <a-button
              type="primary"
              @click="openSignModal"
              >{{ formData.signature ? '重签' : '签名' }}</a-button
            >
            <img
              class="sign-img"
              v-if="formData.signature"
              :src="formData.signature"
            />
          </div>
        </a-form-item>
        <a-form-item
          label="备注"
          field="remark"
        >
          <a-textarea
            v-model="formData.remark"
            :max-length="300"
            :auto-size="{
              minRows: 6,
              maxRows: 6,
            }"
            show-word-limit
            :placeholder="formData.result === '1' ? '备注' : '请输入驳回意见'"
          >
          </a-textarea>
        </a-form-item>
      </a-form>
    </div>
    <div
      class="audit-part"
      v-if="props.status === 'detail' && !props.needTable"
    >
      <cardDisplay
        v-if="cardItems?.items.length"
        :card-items="cardItems"
      />
    </div>
    <div
      class="audit-part"
      v-if="
        props.status === 'detail' && Array.isArray(formData) && props.needTable
      "
    >
      <a-table
        :columns="columns"
        :data="formData"
        :pagination="false"
        :bordered="{ cell: true }"
      >
        <template #signature="{ record }">
          <img
            v-if="record.signature"
            class="sign-img"
            :src="record.signature"
          />
        </template>
      </a-table>
    </div>
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
        <a-button
          type="primary"
          @click="clearSign()"
          >重写</a-button
        >
        <a-button
          type="primary"
          @click="closeSignModal"
          >取消</a-button
        >
        <a-button
          type="primary"
          @click="handleConfirm"
          >确定</a-button
        >
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { useSign } from '@/views/pitfall/snapshot/composition/useSign';
import cardDisplay from '@/views/pitfall/snapshot/components/cardDisplay.vue';
import { ref } from 'vue';
import { computed } from 'vue';
import { getNeedSignByTaskId } from '@/api/process';

const props = defineProps({
  auditFormData: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: 'edit',
  },
  text: {
    type: String,
    default: '',
  },
  needTable: {
    type: Boolean,
    default: false,
  },
  taskId: {
    type: String,
    default: '',
  },
  needCheckSign: {
    type: Boolean,
    default: false,
  },
  needResult: {
    type: Boolean,
    default: true,
  },
  resultText: {
    type: Object,
    default: {
      pass: '合格',
      fail: '不合格',
    },
  },
});

const emits = defineEmits(['update:auditFormData']);
const auditForm = ref<HTMLFormElement | null>(null);

const signRef = ref<HTMLCanvasElement | null>(null); // 签名画布Ref
const {
  signModalVisible,
  openSignModal,
  closeSignModal,
  clearSign,
  confirmSign,
} = useSign(signRef);

const formData: any = computed({
  get() {
    return props.auditFormData;
  },
  set(val) {
    emits('update:auditFormData', val);
  },
});

const auditRules = {
  result: [{ required: true, message: `请选择${props.text}结果 ` }],
  signature: [{ required: true, message: '请完成签名' }],
};

const cardItems = ref<any>({
  items: [],
});

if (!props.needTable && props.status === 'detail') {
  cardItems.value = {
    items: [
      {
        id: 1,
        field: '关闭原因',
        value: formData.value.closeReason,
      },
      {
        id: 2,
        field: '验收签名',
        value: formData.value.signature || '',
        visible: !!formData.value.signature,
        type: 'sign',
      },
      {
        id: 3,
        field: '关闭人',
        value: formData.value.closePerson,
        visible: !formData.value.signature && formData.value.closePerson,
      },
      {
        id: 4,
        field: '关闭时间',
        value: formData.value.closeTime,
      },
    ],
  };
}

const needSign = ref<boolean>(false);
if (props.status === 'edit' && props.needCheckSign) {
  getNeedSignByTaskId(props.taskId).then((res: any) => {
    needSign.value = res.enableSign;
  });
}

const columns: TableData[] = [
  { title: `${props.text}环节`, dataIndex: 'round', width: 100 },
  { title: `${props.text}结果`, dataIndex: 'result', width: 90 },
  {
    title: `${props.text}人签字`,
    dataIndex: 'signature',
    slotName: 'signature',
    width: 160,
  },
  { title: `${props.text}时间`, dataIndex: 'createTime', width: 170 },
  { title: `备注`, dataIndex: 'remark' },
];

const handleConfirm = () => {
  auditForm.value!.clearValidate(['signature']);
  emits('update:auditFormData', {
    ...formData.value,
    signature: confirmSign(),
  });
};

// 父组件使用
const validate = async () => {
  return await auditForm.value?.validate();
};

defineExpose({
  validate,
});
</script>
<style lang="less" scoped>
.sign-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  img {
    width: 200px;
    height: 100px;
  }
}

.sign-modal-footer {
  text-align: right;

  button {
    margin-left: 20px;
  }
}

.sign-img {
  border: 1px solid #999999;
  width: 200px;
  height: 100px;
  object-fit: fill;
}
</style>
