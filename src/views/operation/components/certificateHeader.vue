<template>
  <div class="header">
    <div class="header-center">
      <span class="header-title">{{ props.title }}</span>
      <div>
        <span class="header-status">{{ props.status }}</span>
      </div>
    </div>
    <div class="header-btn">
      <a-button class="print-btn" type="primary" @click="toPrintPage"
        >打印</a-button
      >
      <a-button class="back-btn" @click="goBack">返回</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';

  const props = defineProps({
    title: {
      type: String,
      default: '动火安全作业证',
    },
    status: {
      type: String,
      default: '待分析',
    },
    printUrl: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  });

  // 状态对应颜色
  const statusColorObj = {};

  const router = useRouter();

  // 打印页面
  const toPrintPage = () => {
    router.push({
      name: props.printUrl,
      query: {
        id: props.id,
        status: 'print',
      },
    });
  };

  const goBack = () => {
    router.back();
  };
</script>
<style lang="less" scoped>
  .header {
    width: 100%;
    border-radius: 10px;
    height: 120px;
    background-color: #ffffff;
    position: relative;
    .header-center {
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .header-title {
        font-size: 24px;
        font-weight: bolder;
        color: #6b7785;
      }
      .header-status {
        margin-top: 10px;
        color: #666666;
        --icon-color: #ff9900;
        position: relative;
        &::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: -12px;
          transform: translate(0, -50%);
          background-color: var(--icon-color);
        }
      }
    }
    .header-btn {
      text-align: center;
      position: absolute;
      bottom: 10px;
      right: 10px;
      button + button {
        margin-left: 12px;
      }
      .arco-btn {
        width: 90px;
        height: 30px;
        line-height: 30px;
        border-radius: 4px;
      }
    }
  }
</style>
