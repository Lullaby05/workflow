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

const { id, checkPerson, status, token, refreshToken } = route.query;

localStorage.setItem('wflow-token', token);
localStorage.setItem('refreshToken', refreshToken);

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
        visible: !!data.checkEndTime,
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
      // 如果原有表单id和当前遍历的表单id相同则不加入进去
      if (checkItemList.value[item.checkItem][0].id === formItem.formId) return;
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
    if (e.name === 'TableList') {
      setDisabled(e.props.columns);
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
  background-color: #fbfbfb;
  box-sizing: border-box;
  font-size: 12px;
  padding-top: 10px;
}
.card-display-container {
  margin: 0 10px;
  padding: 16px 8px 20px 8px;
  box-shadow: 0px 2px 8px 1px #e5e5ea;
  border-radius: 4px;
  :deep(.card-display-title) {
    padding: 0 0 10px 0;
  }
}
.check-item {
  margin-top: 20px;
}
.check-item-title {
  font-size: 16px;
  margin-left: 16px;
  line-height: 16px;
  font-weight: 400;
  font-style: normal;
  color: #333333;
}

.row {
  span + span {
    margin-left: 50px;
  }
}
.row + .row {
  margin-top: 20px;
}

.item-slot {
  background-color: #ffffff;
  margin-top: 10px;
  font-size: 14px;
  .form-render-title {
    line-height: 20px;
    padding: 16px;
    font-weight: 700;
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
      --van-cell-value-color: #1d2129;
      .m-form-item_title {
        color: #86909c;
      }
    }
  }
}
</style>
