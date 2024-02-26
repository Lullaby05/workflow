<template>
  <div class="preview-certificate">
    <div class="preview-content">
      <div class="preview-header">
        <div class="preview-content">
          <div
            v-html="printTemplate"
            id="printDom"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getCertificatePrint } from '@/api/operation/operationApi';
import { computed, nextTick, ref } from 'vue';
import { bindVar, getVal } from '@/utils/printTS';
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
  id: {
    type: String,
    required: true,
  },
  formId: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['initData']);

const formatFormData = computed(async () => {
  let val: any = {};
  await getVal(
    props.formProcessData.formData || {},
    props.formProcessData.formItems || [],
    val
  );
  val.ownerDept = props.formProcessData.starterDept;
  val.owner =
    props.formProcessData.staterUser == undefined
      ? ''
      : props.formProcessData.staterUser.name;
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

const getPrintDetail = async () => {
  const paramId = props.id;
  const formId = props.formId;
  const { data } = await getCertificatePrint(paramId as string, formId);
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
  padding-bottom: 20px;

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
<style>
:root {
  font-size: 11px;
}
</style>
