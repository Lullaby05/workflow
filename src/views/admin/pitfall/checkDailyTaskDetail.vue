<template>
  <div class="check-box">
    <cardDisplay :card-items="cardItems" :key="cardItems?.items.length" class = "cardDisplay">
    </cardDisplay>
    <div class="check-item" v-for="(ele, index) in Object.keys(checkItemList)">
      <span class="check-item-title">{{ `排查项目${index + 1}：${ele}` }}</span>
      <div class="item-slot" v-for="item in checkItemList[ele]" :key="item.id">
        <div class="form-render-title">{{ item.checkStandard }}</div>
        <form-render
          :disabled="true"
          v-model="item.formRenderData"
          :forms="item.formsTemp"
          mode="MOBILE"
          :config="item.formConfigTemp"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import FormRender from "@/components/form-design/components/FormRender.vue";
import { useFormRender } from "@/views/operation/wxHooks/useFormRender";
import { onBeforeMount, ref } from "vue";
import { getDailyCheckDetail } from "@/api/webView";
import cardDisplay from "./cardDisplay.vue";

const route = useRoute();
const router = useRouter();

const {
  id = "1737709418281267202",
  checkPerson = "肖雨",
  taskStartTime = "2023-12-21 00:00:00",
  taskEndTime = "2023-12-21 23:59:59",
  title="日期-计划名称-表名称",
  status="4",
} = route.query;

const goBack = () => {
  router.back();
};
document.title = "任务详情";

// const formLists = ref();
const checkItemList = ref({});
const cardItems = ref();

const getDetailData = async () => {
  const { data } = await getDailyCheckDetail(id);

  cardItems.value = {
    items: [
      { id: 1, field: "排查责任人", value: checkPerson },
      { id: 2, field: "计划开始时间", value: taskStartTime },
      { id: 3, field: "计划截止时间", value: taskEndTime },
      { id: 4, field: "排查开始时间", value: data.checkStartTime },
      { id: 5, field: "排查结束时间", value: data.checkEndTime },
      { id: 6, field: "任务名称", value: data.taskName },
      { id: 7, field: "任务详情", type: "slot" },
    ],
    title:title,
    status:status,
  };

  data.formList.forEach((item) => {
    const formItem = JSON.parse(item.formItems).design;
    const formRender = useFormRender(formItem);
    setDisabled(formRender.formsTemp);
    if (checkItemList.value[item.checkItem]) {
      checkItemList.value[item.checkItem].push({
        id: formItem.formId,
        checkStandard: item.checkStandard,
        formRenderData: formRender.formData,
        formsTemp: formRender.formsTemp,
        formConfigTemp: formRender.formConfigTemp,
      });
    } else {
      checkItemList.value[item.checkItem] = [
        {
          id: formItem.formId,
          checkStandard: item.checkStandard,
          formRenderData: formRender.formData,
          formsTemp: formRender.formsTemp,
          formConfigTemp: formRender.formConfigTemp,
        },
      ];
    }
  });
};

const setDisabled = (formsTemp) => {
  console.log("@formConfigTemp", formsTemp);
  formsTemp.forEach((e) => {
    e.props.disabled = true;
  });
};

onBeforeMount(() => {
  getDetailData();
});
</script>
<style lang="less" scoped>
.check-item{
    margin-top:10px;
    font-size: 14px;
}
.check-item-title {
//   margin-left: 10px;
  font-family: "微软雅黑";
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  color: #000000;
}

.item-slot {
  margin-top: 15px;

  .form-render-title {
    line-height: 30px;
    font-size: 14px;
    padding: 5px 10px;
    background-color: #f2f3f5;
  }
}
</style>
