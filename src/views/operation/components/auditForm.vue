<template>
  <div class="auditContainer">
    <Form required="auto">
      <Field
        :rules="[{ required: true }]"
        :label="text"
        input-align="right"
      >
        <template #input>
          <RadioGroup
            v-model="auditFormData.result"
            direction="horizontal"
            @change="changeResult"
          >
            <Radio name="1">{{ resultText.pass }}</Radio>
            <Radio name="2">{{ resultText.fail }}</Radio>
          </RadioGroup>
        </template>
      </Field>
      <Field
        v-model="auditFormData.remark"
        label-align="top"
        label="备注"
        placeholder="请输入备注"
      />
      <Field
        v-if="auditFormData.result === '1' && needSign"
        v-model="auditFormData.signature"
        readonly
        :rules="[{ required: true }]"
        label-align="top"
        label="签名"
        placeholder="请完成签名"
        input-align="left"
        @click-input="openSignModal"
      >
        <template
          v-if="auditFormData.signature"
          #input
        >
          <img
            v-if="auditFormData.signature"
            class="sign-img"
            :src="auditFormData.signature"
          />
          <!-- <span
            style="color: #409eff"
            @click="openSignModal"
            >重新签名</span
          > -->
        </template>
      </Field>
    </Form>
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
import { ref, computed } from 'vue';
import { Field, Form, RadioGroup, Radio, showToast } from 'vant';
import { getNeedSignByTaskId } from '@/api/process';
import signModal from '@/views/admin/pitfall/sign.vue';

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
    default: '分析结果',
  },
  needTable: {
    type: Boolean,
    default: false,
  },
  taskId: {
    type: String,
    default: '',
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

const formData: any = computed({
  get() {
    return props.auditFormData;
  },
  set(val) {
    emits('update:auditFormData', val);
  },
});

const needSign = ref<boolean>(false);
if (props.status === 'edit') {
  getNeedSignByTaskId(props.taskId).then((res: any) => {
    needSign.value = res.data.enableSign;
  });
}

// 父组件调用
const validate = () => {
  return new Promise((resolve) => {
    if (formData.value.result === '') {
      showToast({
        message: `请选择${props.text}`,
      });
      resolve(true);
    } else if (
      formData.value.result === '1' &&
      needSign &&
      formData.value.signature === ''
    ) {
      showToast({
        message: `请完成签名`,
      });
      resolve(true);
    }
    resolve(false);
  });
};

const changeResult = () => {
  if (formData.value.result === '2') {
    formData.value.signature = '';
  }
};

const signModalVisible = ref(false);
const openSignModal = () => {
  signModalVisible.value = true;
};
const signConfirm = (signature: { baseCode: string }) => {
  formData.value.signature = signature.baseCode;
  signModalVisible.value = false;
};

defineExpose({
  validate,
});
</script>
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
</style>
