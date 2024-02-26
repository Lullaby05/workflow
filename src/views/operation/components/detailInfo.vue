<template>
  <div class="detail-info-table">
    <div
      class="table-item"
      v-for="(item, index) in tableData"
      :key="index"
    >
      <div class="info-header">
        <div class="info-num">{{ index + 1 }}</div>
        <div class="flex">
          <div class="audit-person">
            <span> {{ item.round }}</span>
            <span> {{ item.deptName }}</span>
          </div>
        </div>
      </div>
      <div class="detail-content">
        <div
          class="audit-detail-content"
          v-if="item.result"
        >
          <div
            class="audit-remark"
            :class="item.resultCode === 0 ? 'fail-color' : ''"
            v-if="item.remark"
          >
            <span class="audit-remark-text">{{ item.remark }}</span>
          </div>
          <div class="flex">
            <div class="audit-sign">
              <span v-if="item.signature">签名：</span>
              <img
                v-if="item.signature"
                class="sign-img"
                :src="item.signature"
              />
            </div>
            <div class="audit-time">{{ item.createTime }}</div>
          </div>
          <div
            class="edit-btn"
            v-if="item.needEditApply"
          >
            <Button
              type="primary"
              size="mini"
              @click="jumpToEditApply"
              >点击修改申请</Button
            >
          </div>
        </div>
        <div
          class="no-data"
          v-else
        >
          待签署
        </div>
      </div>
      <div
        class="audit-result"
        v-if="item.result"
      >
        <img
          v-if="item.resultCode"
          src="@/assets/image/icon-success.png"
          alt=""
        />
        <img
          v-if="!item.resultCode"
          src="@/assets/image/icon-fail.png"
          alt=""
        />
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
.table-item {
  padding: 14px 16px 16px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: column;
  overflow: hidden;
  gap: 20px;
  box-shadow: 0px 2px 8px 1px #e5e5ea;
  position: relative;
  .info-header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    .audit-person {
      span:nth-child(1) {
        font-size: 14px;
        color: #333333;
      }
      span:nth-child(2) {
        color: #86909c;
        font-weight: 400;
        font-size: 12px;
      }
      span + span {
        margin-left: 10px;
      }
    }
    .info-num {
      background-color: #165dff;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      color: #ffffff;
      text-align: center;
      font-size: 12px;
      margin-right: 5px;
      line-height: 18px;
    }
  }
  .flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    .audit-detail-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .audit-remark {
      width: 100%;
      font-size: 14px;
      line-height: 14px;
      .audit-remark-text {
        color: #86909c;
        width: 250px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .audit-sign {
      display: flex;
      align-items: flex-start;
      .sign-img {
        height: 60px;
        border: 1px solid rgba(228, 231, 237, 0.7);
      }
    }
    .audit-time {
      align-self: flex-end;
      color: #999999;
    }
    .edit-btn {
      text-align: right;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 0.5px;
        background: #e5e5ea;
        top: -10px;
        left: 0;
      }
      button {
        --van-button-primary-background: #165dff;
        --van-button-mini-padding: 6px 12px;
        border-radius: 147px;
      }
    }
  }
  .no-data {
    text-align: center;
    background: #f5f7fa;
    border: 1px solid #e5e5e5;
    color: #4e5969;
    font-size: 14px;
    padding: 41px 0;
  }
  .audit-result {
    position: absolute;
    right: 0;
    top: 0;
    img {
      width: 66px;
      height: 66px;
      object-fit: cover;
    }
  }
}
.table-item + .table-item {
  margin-top: 10px;
}
</style>
