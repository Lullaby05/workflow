<template>
  <div class="detail-info-table">
    <div
      class="table-item"
      v-for="(item, index) in tableData"
      :key="index"
    >
      <div class="info-num">
        {{ index + 1 }}
      </div>
      <div class="detail-content">
        <div class="flex">
          <div class="audit-person">
            <span> {{ item.round }}</span>
            <span> {{ item.deptName }}</span>
          </div>
          <div
            class="audit-result"
            :class="item.resultCode ? 'success-color' : 'fail-color'"
          >
            {{ item.result }}
          </div>
        </div>
        <div
          class="audit-detail-content"
          v-if="item.result"
        >
          <div
            class="audit-remark"
            :class="item.resultCode === 0 ? 'fail-color' : ''"
          >
            <span class="audit-remark-text">{{ item.remark }}</span>
            <Button
              v-if="item.needEditApply"
              type="primary"
              size="mini"
              @click="jumpToEditApply"
              >点击修改申请</Button
            >
          </div>
          <div class="flex">
            <div class="audit-sign">
              签名：
              <img
                class="sign-img"
                :src="item.signature"
              />
            </div>
            <div class="audit-time">{{ item.createTime }}</div>
          </div>
        </div>
        <div
          class="no-data"
          v-else
        >
          待签署
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Button } from 'vant';
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  tableData: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['jumpToEditApply']);

const tableData: {
  createTime: string;
  remark?: string;
  result: string;
  round: string;
  signature?: string;
  resultCode: 1 | 0;
  needEditApply?: boolean;
  deptName: string;
}[] = props.tableData as any;

const jumpToEditApply = () => {
  emits('jumpToEditApply');
};
</script>
<style lang="less" scoped>
.detail-info-table {
  // padding: 5px 10px;
}
.table-item {
  border-top: 1px solid #d7d7d7;
  border-bottom: 1px solid #d7d7d7;
  padding: 10px 10px 10px 5px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  overflow: hidden;
  .info-num {
    flex: 0 0 auto;
    background-color: #409eff;
    width: 15px;
    height: 15px;
    border-radius: 30%;
    color: #ffffff;
    text-align: center;
    font-size: 12px;
    margin-right: 5px;
  }
  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    .audit-detail-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .audit-person {
      span:nth-child(1) {
        font-size: 15px;
        color: #333333;
        font-weight: bold;
      }
      span:nth-child(2) {
      }
      span + span {
        margin-left: 10px;
      }
    }
    .audit-remark {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-left: 5px;
      line-height: 32px;
      background-color: #f2f2f2;
      .audit-remark-text {
        width: 250px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .audit-sign {
      display: flex;
      align-items: center;
      // border: 1px solid #d7d7d7;
      .sign-img {
        height: 50px;
      }
    }
    .audit-time {
      color: #999999;
    }
  }
  .no-data {
    text-align: center;
    background-color: #fde8cc;
    padding: 5px 0;
    color: #333333;
  }
  .success-color {
    color: #26db6d;
  }
  .fail-color {
    color: #d9001b;
  }
}
</style>
