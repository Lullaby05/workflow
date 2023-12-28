<template>
  <div class="check-box">
    <cardDisplay
      :card-items="cardItems"
      :key="cardItems?.items.length"
      class="cardDisplay"
    >
      <div>
        <div class="row">
          <span>危险源数：{{ detailData.dangerNum || 0 }}</span>
          <span>排查项数：{{ detailData.checkItemNum || 0 }}</span>
        </div>
        <div class="row">
          <span>合格项数：{{ detailData.checkedItem || 0 }}</span
          ><span>不合格项数：{{ detailData.unCheckedItem || 0 }}</span>
        </div>
      </div>
    </cardDisplay>
    <div
      class="check-item"
      v-for="(ele, index) in Object.keys(checkItemList)"
    >
      <span class="check-item-title">{{ `排查项目${index + 1}：${ele}` }}</span>
      <div
        class="item-slot"
        v-for="item in checkItemList[ele]"
        :key="item.id"
      >
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
import { useRoute, useRouter } from 'vue-router';
import FormRender from '@/components/form-design/components/FormRender.vue';
import { useFormRender } from '@/views/operation/wxHooks/useFormRender';
import { onBeforeMount, ref } from 'vue';
import { getDailyCheckDetail } from '@/api/webView';
import cardDisplay from './cardDisplay.vue';

const route = useRoute();
const router = useRouter();

const { id, checkPerson, status } = route.query;

const goBack = () => {
  router.back();
};
document.title = '排查详情';

// const formLists = ref();
const checkItemList = ref({});
const cardItems = ref();
const detailData = ref();

const getDetailData = async () => {
  const { data } = await getDailyCheckDetail(id);

  detailData.value = data;

  cardItems.value = {
    items: [
      {
        id: 1,
        field: '任务类型',
        value: data.taskType === 1 ? '日常排查任务' : '计划排查任务',
      },
      {
        id: 2,
        type: 'slot',
        notNeedField: true,
      },
      {
        id: 3,
        field: '任务计划时间',
        value: `${data.taskStartTime} 至 ${data.taskEndTime}`,
      },
      {
        id: 4,
        field: '排查完成时间',
        value: `${data.checkStartTime} 至 ${data.checkEndTime}`,
        visible: data.checkEndTime,
      },
    ],
    title: data.taskName,
    status: status,
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
  // console.log('@formConfigTemp', formsTemp);
  formsTemp.forEach((e) => {
    e.props.disabled = true;
    if(e.name === "TableList"){
      setDisabled(e.props.columns)
    }
  });
};

onBeforeMount(() => {
  getDetailData();
});
</script>

<style>
:root {
  font-size: 12px;
}
</style>
<style lang="less" scoped>
.check-box {
  min-height: 100vh;
  background-color: #f2f2f2;
  font-size: 12px;
}
.check-item {
  margin-top: 10px;
}
.check-item-title {
  margin-left: 10px;
  font-family: '微软雅黑';
  font-weight: 400;
  font-style: normal;
  color: #000000;
}

.row {
  span + span {
    margin-left: 50px;
  }
}
.row + .row {
  margin-top: 14px;
}

.item-slot {
  margin-top: 15px;

  .form-render-title {
    line-height: 20px;
    padding: 5px 10px;
    background-color: #d7d7d7;
    color: #7f7f7f;
  }
}
</style>
