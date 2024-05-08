<template>
  <div class="check-box">
    <div
      class="check-item"
      v-for="(ele, index) in Object.keys(checkItemList)"
    >
      <div class="check-item-title">{{ `排查项目${index + 1}：${ele}` }}</div>
      <div
        class="item-slot"
        v-for="item in checkItemList[ele]"
        :key="item.id"
      >
        <div class="form-render-title">
          {{ item.checkStandard }}
        </div>
        <form-render
          :disabled="type === 'detail'"
          ref="form"
          v-model="item.formRenderData"
          :forms="item.formsTemp"
          mode="MOBILE"
          :config="item.formConfigTemp"
          @click="handleClick"
        />
      </div>
    </div>
    <div
      class="submit-btn"
      v-if="type !== detail"
    >
      <Button
        block
        type="primary"
        @click="handleSave"
        >提交</Button
      >
    </div>
  </div>
</template>
<script>
export default {
  name: 'webViewFormRender',
};
</script>

<script setup>
import FormRender from '@/components/form-design/components/FormRender.vue';
// import FormRender from '@/views/common/form/FormRender.vue';
import { inject, onBeforeMount, ref } from 'vue';
import { Button, showConfirmDialog, showToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import { planInfo } from '@/api/webView';
import { useFormRender } from '@/views/operation/wxHooks/useFormRender';
import { formatDate } from '@/utils/utils';
import { ElMessage } from 'element-plus';
import Success from './success.vue';

import {
  checkPlanDetailForm,
  checkPlanDetailForms,
  dailyCheckExecute,
  getDailyCheckDetail,
  pitfallAdd,
} from '@/api/webView';

const wx = inject('wx');
const route = useRoute();
const router = useRouter();

document.title = '开始排查';

const send = () => {
  const html = document.getElementsByTagName('html')[0];
  const height = html.clientHeight;
  showToast({
    type: 'success',
    message: '保存成功',
    onClose: () => {
      wx.miniProgram.navigateBack();
    },
  });
};

const {
  checkTableIds,
  type = 'detail',
  taskType,
  taskId,
  taskName,
  checkPerson,
  checkPersonId,
  id,
  token,
  refreshToken,
} = route.query;

localStorage.setItem('wflow-token', token);
localStorage.setItem('refreshToken', refreshToken);

let checkStartTime = undefined;

const handleClick = () => {
  if (!checkStartTime) {
    checkStartTime = formatDate(new Date());
  }
};

const form = ref(null);

const checkItemList = ref({});

// const formLists = ref<any[]>([]);

const getContentData = async () => {
  let data = {};
  if (type !== 'detail') {
    // const res = await checkPlanDetailForm(taskType, checkTableIds);
    const res = await checkPlanDetailForms(taskId);
    data = res.data;
  } else {
    const res = await getDailyCheckDetail(id);
    data = [res.data];
  }

  for (let i = 0; i < data.length; i++) {
    const resFormList = data[i].formList;
    resFormList.forEach((item) => {
      const formItem = JSON.parse(item.formItems).design;
      const formRender = useFormRender(formItem);
      if (type === 'detail') {
        setDisabled(formRender.formsTemp);
      }
      if (checkItemList.value[item.checkItem]) {
        // 如果原有表单id和当前遍历的表单id相同则不加入进去
        if (checkItemList.value[item.checkItem][0].id === formItem.formId)
          return;
        checkItemList.value[item.checkItem].push({
          id: formItem.formId,
          checkContentId: item.checkContentId,
          checkStandard: item.checkStandard,
          problemSpot: item.problemSpot,
          checkItem: item.checkItem,
          design: formItem,
          formRenderData: formRender.formData,
          formsTemp: formRender.formsTemp,
          formConfigTemp: formRender.formConfigTemp,
        });
      } else {
        checkItemList.value[item.checkItem] = [
          {
            id: formItem.formId,
            checkContentId: item.checkContentId,
            checkStandard: item.checkStandard,
            problemSpot: item.problemSpot,
            checkItem: item.checkItem,
            design: formItem,
            formRenderData: formRender.formData,
            formsTemp: formRender.formsTemp,
            formConfigTemp: formRender.formConfigTemp,
          },
        ];
      }
      // formLists.value.push({
      //   id: formItem.formId,
      //   checkContentId: item.checkContentId,
      //   checkStandard: item.checkStandard,
      //   problemSpot: item.problemSpot,
      //   checkItem: item.checkItem,
      //   design: formItem,
      //   formRenderData: formRender.formData,
      //   formsTemp: formRender.formsTemp,
      //   formConfigTemp: formRender.formConfigTemp,
      // });
    });
  }
};

const setDisabled = (formsTemp) => {
  formsTemp.forEach((e) => {
    e.props.disabled = true;
    if (e.name === 'TableList') {
      setDisabled(e.props.columns);
    }
  });
};

onBeforeMount(() => {
  getContentData();
});

const handleSave = async () => {
  if (form.value && form.value.length) {
    let formList = form.value.map((f) => {
      // if (!f.modelValue.field_isQualified) {
      //   return;
      // }
      // if (!f.validate()) {
      return f.validate();
    });

    Promise.all(formList)
      .then(() => {
        saveData();
      })
      .catch(() => {});
  }
};

const saveData = async () => {
  const keys = Object.keys(checkItemList.value);
  const formLists = [];
  for (const item of keys) {
    formLists.push(...checkItemList.value[item]);
  }
  // 调接口保存
  const params = formLists
    // .filter((ele) => ele.formRenderData.field_isQualified)
    .map((ele) => {
      const design = {
        settings: ele.design.settings,
        logo: ele.design.logo,
        process: ele.design.process,
        remark: ele.design.remark,
        formName: ele.design.formName,
        formId: ele.design.formId,
        formItems: ele.formsTemp,
        formConfig: ele.formConfigTemp,
        formData: ele.formRenderData,
      };
      return {
        taskId,
        taskName,
        checkItem: ele.checkItem,
        checkContentId: ele.checkContentId,
        checkStartTime: checkStartTime,
        checkStandard: ele.checkStandard,
        isQualified: ele.formRenderData.field_isQualified === '不合格' ? 0 : 1,
        formItems: JSON.stringify({ design }),
      };
    });
  const unchecked = formLists
    // .filter((ele) => ele.formRenderData.field_isQualified)
    .filter((ele) => {
      return ele.formRenderData.field_isQualified === '不合格';
    })
    .map((ele) => {
      return {
        taskId,
        taskName,
        dangerSourceCode: type === 'dailyExecute' ? '2' : '3',
        hazardDesc: ele.formRenderData.field_hazardDesc,
        hazardAddr: ele.formRenderData.field_hazardAddr,
        sceneImages: ele.formRenderData.field_sceneImages
          ? ele.formRenderData.field_sceneImages.map((item) => {
              return {
                fileUrl: item.sourceUrl,
                postUrl: item.url,
                fileType: item.fileType,
              };
            })
          : [],
        hidRiskLevelCode:
          ele.formRenderData.field_hidRiskLevelCode === '一般隐患' ? '2' : '1',
        rectifyAdvise: ele.formRenderData.field_rectifyAdvise,
        dangerStateCode: '1',
        inspectorName: checkPerson,
        inspectorId: checkPersonId,
        inspectTime: checkStartTime,
        checkItem: ele.checkItem,
        problemSpot: ele.problemSpot,
        checkStandard: ele.checkStandard,
        tenantId: '1',
      };
    });
  showConfirmDialog({
    title: '',
    message: '提交后无法修改，是否确认提交排查信息？',
  }).then(async () => {
    await dailyCheckExecute(params);
    if (unchecked.length > 0) {
      await pitfallAdd(unchecked);
    }
    send();
  });
};

const goBack = () => {
  router.back();
};
</script>

<style lang="less">
:root {
  font-size: 12px;
}
</style>

<style lang="less" scoped>
.check-box {
  min-height: 100vh;
  padding-bottom: 74px;
  background-color: #fbfbfb;
  box-sizing: border-box;
}

.submit-btn {
  padding: 0 16px;
  position: fixed;
  bottom: 30px;
  width: 100%;
  box-sizing: border-box;
  --van-button-primary-background: #165dff;
  --van-button-primary-border-color: #165dff;

  button {
    border-radius: 4px;
  }
}

.check-item {
  font-size: var(--van-font-size-m);
}

.check-item-title {
  font-size: 16px;
  padding: 16px 0 10px 16px;
  font-weight: 500;
  color: #333333;
  line-height: 16px;
}

.item-slot {
  // margin-top: 20px;

  .form-render-title {
    background-color: #ffffff;
    padding: 16px 16px 10px 16px;
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
    word-break: break-all;
  }
  :deep(.process-form) {
    & > div + div {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        width: calc(100vw - 32px);
        height: 0.5px;
        margin: 0 16px;
        background-color: #e5e5ea;
      }
    }
    .m-form-item {
      padding: 13px 16px 13px 16px;
      margin-bottom: 1px;
      font-weight: 400;
      --van-field-input-disabled-text-color: #999999;
      --van-field-input-text-color: #999999;
      --van-cell-value-color: #999999;
    }
  }
}
</style>
