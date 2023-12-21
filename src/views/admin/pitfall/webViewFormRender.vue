<template>
  <div>
    <div class="check-item" v-for="(ele, index) in Object.keys(checkItemList)">
      <span class="check-item-title">{{ `排查项目${index + 1}：${ele}` }}</span>
      <div class="item-slot" v-for="item in checkItemList[ele]" :key="item.id">
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
    <div class="submit-btn" v-if="type !== detail">
      <Button block type="primary" @click="handleSave">提交</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: "webViewFormRender",
};
</script>

<script setup>
import FormRender from "@/components/form-design/components/FormRender.vue";
// import FormRender from '@/views/common/form/FormRender.vue';
import { inject, onBeforeMount, ref } from "vue";
import { Button } from "vant";
import { useRoute, useRouter } from "vue-router";
import { planInfo } from "@/api/webView";
import { useFormRender } from "@/views/operation/wxHooks/useFormRender";
import { formatDate } from "@/utils/utils";
import { ElMessage } from "element-plus";

import {
  checkPlanDetailForm,
  dailyCheckExecute,
  getDailyCheckDetail,
  pitfallAdd,
} from "@/api/webView";

const wx = inject("wx");
const route = useRoute();
const router = useRouter();

document.title = route.query.title ? route.query.title : "排查计划";

const send = () => {
  const html = document.getElementsByTagName("html")[0];
  const height = html.clientHeight;
  ElMessage({
    message: "保存成功",
    // type: "success",
    duration: 1000,
    offset: height / 2,
    onClose: () => {
      console.log("closed");
      wx.miniProgram.postMessage({
        data: {
          foo: "123",
          route: route,
        },
      });
      wx.miniProgram.navigateBack();
    },
  });
};

const {
  checkTableIds = "1737744126473949186",
  type = "detail2",
  taskType = "2",
  taskId,
  taskName,
  checkPerson,
  checkPersonId,
  id = "1737383050846699522",
} = route.query;

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
  if (type !== "detail") {
    const res = await checkPlanDetailForm(taskType, checkTableIds);
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
      if (type === "detail") {
        setDisabled(formRender.formsTemp);
      }
      if (checkItemList.value[item.checkItem]) {
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
    console.log("@", checkItemList.value);
  }
};

const setDisabled = (formsTemp) => {
  console.log("@formConfigTemp", formsTemp);
  formsTemp.forEach((e) => {
    e.props.disabled = true;
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
        isQualified: ele.formRenderData.field_isQualified === "不合格" ? 0 : 1,
        formItems: JSON.stringify({ design }),
      };
    });
  const unchecked = formLists
    // .filter((ele) => ele.formRenderData.field_isQualified)
    .filter((ele) => {
      return ele.formRenderData.field_isQualified === "不合格";
    })
    .map((ele) => {
      return {
        taskId,
        taskName,
        dangerSourceCode: type === "dailyExecute" ? "2" : "3",
        hazardDesc: ele.formRenderData.field_hazardDesc,
        hazardAddr: ele.formRenderData.field_hazardAddr,
        sceneImages: ele.formRenderData.field_sceneImages
          ? ele.formRenderData.field_sceneImages.map((item) => item.url)
          : [],
        dangerStateCode: "1",
        inspectorName: checkPerson,
        inspectorId: checkPersonId,
        inspectTime: checkStartTime,
        checkItem: ele.checkItem,
        problemSpot: ele.problemSpot,
        checkStandard: ele.checkStandard,
        tenantId: "1",
      };
    });
  await dailyCheckExecute(params);
  if (unchecked.length > 0) {
    await pitfallAdd(unchecked);
  }
  send();
};

const goBack = () => {
  router.back();
};
</script>

<style>
:root {
  font-size: 12px;
}
</style>

<style lang="less" scoped>
.submit-btn {
  padding: 0 10px;
  position: fixed;
  bottom: 15px;
  width: 100%;
  box-sizing: border-box;

  button {
    border-radius: 5px;
  }
}
.check-item{
  font-size: var(--van-font-size-m);
}
.check-item-title {
  margin-left: 10px;
  font-family: "微软雅黑";
  font-weight: 400;
  font-style: normal;
  color: #000000;
}

.item-slot {
  margin-top: 20px;

  .form-render-title {
    line-height: 30px;
    padding: 5px 10px;
    background-color: rgba(215, 215, 215, 1);
  }
}
</style>
