<template>
  <div class="container">
    <div class="title">作业申请信息</div>
    <div class="preview-container">
      <previewCertificate
        v-if="formProcessData"
        :form-process-data="formProcessData"
        status="preview"
        :id="props.id"
      />
    </div>
    <div
      class="progress"
      v-if="progressList.length > 0"
    >
      <div
        class="progress-item"
        v-for="item in progressList"
        :key="item.processKey"
      >
        <div class="progress-title">{{ item.title }}</div>
        <div class="progress-content">
          <formRenderContent
            ref="formRender"
            v-if="item.formDesign"
            class="operation-apply-form"
            :design="item.formDesign"
            status="detail"
          />
          <detailInfo :tableData="item.tableData" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import previewCertificate from './previewCertificate.vue';
import formRenderContent from './formRenderContent.vue';
import { ref, inject } from 'vue';
import detailInfo from './detailInfo.vue';
import { useCertificate } from '../composition/useCertificate';

const props = defineProps({
  formProcessData: {
    type: Object,
    required: true,
  },
  originalProgress: {
    type: Array,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  applyUserId: {
    type: String,
    required: true,
  },
  certType: {
    type: String,
    required: true,
  },
  certificateStatus: {
    type: String,
    default: '',
  },
});

const formProcessData = ref<any>({});

formProcessData.value = props.formProcessData;

const userId = localStorage.getItem('userId');
const wx: any = inject('wx');
const progress = JSON.parse(JSON.stringify(props.formProcessData.progress));

const { searchFormItem } = useCertificate();

let lastProgress: any = {};
// 如果最后一个节点没有processKey，则获取为倒数第二个节点
const tempLast = progress[progress.length - 1];
if (tempLast.processKey === undefined) {
  const lastIndex = props.formProcessData.progress.findLastIndex(
    (ele: any) => ele.processKey
  );
  lastProgress = props.formProcessData.progress[lastIndex];
} else if (tempLast.processKey === 'apply') {
  const lastIndex = props.formProcessData.progress.findLastIndex(
    (ele: any) => ele.result
  );
  lastProgress = props.formProcessData.progress[lastIndex];
} else {
  lastProgress = tempLast;
}

const currentStep = ref<number>(0);
currentStep.value =
  props.originalProgress.findIndex(
    (ele: any) => ele.id === lastProgress.nodeId
  ) + 1;

const progressList = ref<any>([]);
const needShowList = ['analyse', 'review', '', 'siteCheck'];

const delIndex: number[] = [];
progress.reverse();
progress.forEach((item: any, index: number) => {
  // 正常情况
  if (!needShowList.includes(item.processKey)) {
    return;
  }
  if (
    progressList.value.findIndex(
      (ele: any) => ele.processKey === item.processKey
    ) > -1
  ) {
    return;
  }
  const judgeText = item.processKey === 'analyse' ? '合格' : '通过';
  const tableData: any[] = [
    {
      result: item.result
        ? item.result === 'agree'
          ? judgeText
          : `不${judgeText}`
        : '',
      resultCode: item.result ? (item.result === 'agree' ? 1 : 0) : '',
      signature: item.signature,
      remark: item.comment.length ? item.comment[0].text : '',
      createTime: item.finishTime,
      round: item.user.name,
      deptName: item.user.deptName,
    },
  ];
  // 特殊情况会有两个人同时签字才能走到下一步，这时候流程节点的nodeId和startTime相同
  const otherData: any[] = [];
  for (let i = index + 1; i < progress.length; i++) {
    if (
      progress[i].nodeId === item.nodeId &&
      progress[i].startTime === item.startTime
    ) {
      const item = progress[i];
      delIndex.push(i);
      otherData.push({
        result: item.result
          ? item.result === 'agree'
            ? judgeText
            : `不${judgeText}`
          : '',
        resultCode: item.result ? (item.result === 'agree' ? 1 : 0) : '',
        signature: progress[i].signature,
        remark: progress[i].comment.length ? progress[i].comment[0].text : '',
        createTime: progress[i].finishTime,
        round: progress[i].user.name,
        deptName: progress[i].user.deptName,
      });
    }
  }
  const formDesign = searchFormItem(props.formProcessData, item.processKey);
  const formItemIds: string[] = formDesign
    ? formDesign.formItems.map((item: any) => item.id)
    : [];
  const formContentVisible = formItemIds.some(
    // 有数据才显示
    (ele: any) => formDesign.formData[ele]
  );
  progressList.value.push({
    title: item.name + '信息',
    processKey: item.processKey,
    formDesign: !formContentVisible ? null : formDesign,
    tableData: [...tableData, ...otherData],
  });
});

progressList.value.filter((item: any) => item.tableData.length);
// if (delIndex.length) {
//   progressList.value = progressList.value.filter(
//     (ele: any, i: number) => delIndex.indexOf(i) === -1
//   );
// }
progressList.value.reverse();
</script>
<style lang="less" scoped>
.title {
  font-size: 14px;
  font-weight: bold;
  padding: 5px;
}
.preview-container {
  display: flex;
  flex-direction: column;
}
.progress {
  padding-bottom: 40px;
  width: 100%;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .progress-title {
    font-size: 14px;
    padding: 5px;
    font-weight: bold;
  }
  .progress-content {
    background-color: #ffffff;
  }
}
</style>
