<template>
  <div class="card-display-container">
    <div class="card-display-title">
      <div>{{ title }}</div>
      <div :style="statusStyle">{{ statusText }}</div>
    </div>
    <div class="card-display-content">
      <div
        class="content-items"
        v-for="item in filterItems"
        :key="item.id"
      >
        <div v-if="!item.notNeedField">{{ item.field }}:</div>
        <div
          v-if="item.type === 'image' && item.value"
          class="img-container"
        >
          <img
            class="sign-img"
            :src="item.value"
          />
        </div>
        <div v-else-if="item.type === 'sign' && item.value">
          <img
            class="sign-img"
            :src="item.value"
          />
        </div>
        <div v-else-if="item.type === 'signArray' && item.value">
          <div class="sign-list">
            <div
              class="sign-img"
              v-if="item.value.length"
              v-for="(url, index) in item.value"
              :key="index"
            >
              <img :src="url" />
            </div>
          </div>
        </div>
        <slot
          v-else-if="item.type === 'slot'"
          :name="item.slotName || 'default'"
        ></slot>
        <div v-else>{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const props = defineProps({
  cardItems: {
    type: Object,
    default: () => {
      return {
        title: '',
        items: [],
        status: '',
      };
    },
  },
});
const taskStateEnum = {
  1: {
    text: '未开始',
    color: '#9a9a9a',
  },
  2: {
    text: '待完成',
    color: '#26db6d',
  },
  3: {
    text: '进行中',
    color: '#26db6d',
  },
  4: {
    text: '按时完成',
    color: '#165dff',
  },
  5: {
    text: '逾期未完成',
    color: '#D43030',
  },
  6: {
    text: '逾期完成',
    color: '#FF8D1A',
  },
};

const { title = '', items = [], status = '' } = props.cardItems;
const statusStyle = {
  color: taskStateEnum[status]?.color || '#9a9a9a',
  border: `1px solid ${taskStateEnum[status]?.color || '#9a9a9a'}`,
  padding: '2px 8px',
  borderRadius: '20px',
  fontSize: '12px',
};
const statusText = taskStateEnum[status]?.text || '未开始';
const filterItems = items
  .filter((ele) => ele.visible === undefined || ele.visible)
  .map((ele) => {
    if (ele.type === 'image') {
      return {
        ...ele,
        value: ele.value.map((url) => {
          return {
            url: url,
          };
        }),
      };
    }
    return { ...ele };
  });
</script>
<style lang="less" scoped>
.card-display-container {
  background: #fff;
  padding-top: 10px;
  color: #333333;
}
.card-display-title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-bottom: 0.5px solid #e5e5ea;
}

.card-display-content {
  background: #fff;
  overflow: hidden;
  white-space: break-spaces;
  overflow-wrap: anywhere;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 0;
  gap: 20px;
  .content-items {
    font-size: 12px;
    line-height: 12px;
    display: flex;
    div:first-child {
      text-align: right;
      // flex: 0 0 140px;
      margin-right: 10px;
    }

    .img-container {
      margin-top: 13px;
    }
  }
}
.sign {
  border: 1px solid #999999;
}
</style>

<style lang="less">
.image-modal-body {
  text-align: center;
  .modalImage {
    width: 500px;
    height: 500px;
  }
}
.sign-img {
  border: 1px solid #999999;
  width: 200px;
  height: 100px;
}
.sign-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  .sign-img {
    position: relative;
    border: 1px solid #999999;
    margin: 0px 10px 10px 0px;
    img {
      width: 200px;
      height: 100px;
    }
  }
}
</style>
