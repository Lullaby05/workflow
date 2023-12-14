<template>
  <div>
    <form-render :disabled="true" v-model="formRenderData" :forms="formsTemp" mode="MOBILE" :config="formConfigTemp" />
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
import FormRender from '../common/form/formrender.vue';
import { ref } from 'vue';
import { Button } from 'vant';
import { inject } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const wx = inject('wx');

const formRenderData = ref({});
const formConfigTemp = ref({});
const formsTemp = ref([]);

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
