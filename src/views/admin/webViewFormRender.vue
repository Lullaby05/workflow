<template>
  <div>
    <div
      class="check-item"
      v-for="(ele, index) in Object.keys(checkItemList)"
    >
      <span class="check-item-title">{{
        `排查项目${index + 1}：${ele}`
      }}</span>
      <div
        class="item-slot"
        v-for="item in checkItemList[ele]"
        :key="item.id"
      >
        <div class="form-render-title">
          {{ item.checkStandard }}
        </div>
        <form-render
          :disabled="false"
          ref="form"
          v-model="item.formRenderData"
          :forms="item.formsTemp"
          mode="MOBILE"
          :config="item.formConfigTemp"
          @click="handleClick"
        />
      </div>
    </div>
    <div class="submit-btn">
      <Button block type="primary" @click="send">提交</Button>
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
import { ref } from 'vue';
import { Button } from 'vant';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import { planInfo } from '@/api/webView';
import { useFormRender } from '@/views/operation/wxHooks/useFormRender';
import { formatDate } from '@/utils/utils';
// import { planInfo } from '@/api/webView';
const route = useRoute();

const wx = inject('wx'); 

// const formRenderData = ref({});
// const formConfigTemp = ref({});
// const formsTemp = ref([]);
const formList = ref([]);
const checkItemList = ref({});
let checkStartTime = undefined;

document.title = route.query.title;

const send = () => {
  wx.miniProgram.postMessage({
    data: {
      foo: '123',
      route: route,
    },
  });
  wx.miniProgram.navigateBack();
};

const getFormData = async () => {
  let data;
  const res = await planInfo("1","1736557216837701641")
  data = res.data.data;
  console.log(data);
  for (let i = 0; i < data.length; i++) {
      const resFormList = data[i].formList;
      resFormList.forEach((item) => {
        const formItem = JSON.parse(item.formItems).design;
        const formRender = useFormRender(formItem);
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
      });
      console.log('@', checkItemList.value);
    }

}

getFormData();

const handleClick = () => {
    if (!checkStartTime) {
      checkStartTime = formatDate(new Date());
    }
};


</script>

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
</style>
