<!-- 如果没有作业暂停或者异常关闭的信息，则直接展示作业监护人即可，否则展示作业暂停和关闭信息 -->
<!-- 只做展示 -->
<template>
  <div class="operation-start-container">
    <div
      class="no-data"
      v-if="!pauseInfo.length && !closeInfo"
    >
      <div class="guardian-person">
        <span>作业监护人：{{ guradianPerson }}</span>
      </div>
    </div>
    <div
      class="pause-info"
      v-if="pauseInfo.length"
    >
      <div class="pause-info-title">作业暂停信息</div>
      <div class="pause-info-content">
        <div
          class="pause-info-item"
          v-for="(item, index) in pauseInfo"
          :key="index"
        >
          <div class="info-item-title">{{ `第${index + 1}次暂停信息` }}</div>
          <div class="info-item-pause">
            <div class="pause-person-time">
              <span class="pause-person"
                >作业暂停人：{{ item.pauseInfo.pausePerson }}</span
              >
              <span class="pause-time">{{ item.pauseInfo.pauseTime }}</span>
            </div>
            <div class="pause-reason">
              {{ item.pauseInfo.pauseReason }}
            </div>
          </div>
          <div
            class="info-item-recover"
            v-if="item.recoverInfo"
          >
            <div class="recover-person-time">
              <span class="recover-person"
                >作业恢复人：{{ item.recoverInfo.recoverPerson }}</span
              >
              <span class="recover-time">{{
                item.recoverInfo.recoverTime
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="close-info"
      v-if="closeInfo"
    >
      <div class="close-info-title">作业关闭信息</div>
      <div class="close-info-content">
        <div class="close-card">
          <div class="close-person-time">
            <span class="close-person">
              作业关闭人：{{ closeInfo.closePerson }}
            </span>
            <span class="close-time">
              {{ closeInfo.closeTime }}
            </span>
          </div>
          <div class="close-reason">
            {{ closeInfo.closeReason }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
  formProcessData: {
    type: Object,
    required: true,
  },
  certificateStatus: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
  certType: {
    type: String,
    required: true,
  },
  detail: {
    type: Object,
    default: {},
  },
});

const progress = props.formProcessData.progress;

const guradianPerson = props.detail.guardianUserName; // 作业监护人

const pauseInfo = ref<any[]>([]);
const closeInfo = ref<any>({});

// 收集所有的暂停和恢复信息
// 把所有的暂停和恢复信息格式化，暂停和恢复信息是相邻的，如果暂停相邻没有恢复则恢复为空
for (let i = 0; i < progress.length; ) {
  if (progress[i].operationType === 'pause') {
    let info: any = {};
    info.pauseInfo = {
      pausePerson: progress[i].user.name,
      pauseTime: progress[i].finishTime,
      pauseReason: progress[i].comment.length
        ? progress[i].comment[0].text || '无'
        : '无',
    };
    if (progress[i + 1].operationType === 'recover') {
      info.recoverInfo = {
        recoverPerson: progress[i + 1].user.name,
        recoverTime: progress[i + 1].finishTime,
      };
      i++;
    }
    pauseInfo.value.push(info);
  }
  if (progress[i].operationType === 'close') {
    closeInfo.value = {
      closePerson: progress[i].user.name,
      closeTime: progress[i].finishTime,
      closeReason: progress[i].comment.length
        ? progress[i].comment[0].text || '无'
        : '无',
    };
  }
  i++;
}
</script>
<style>
body {
  background-color: #f2f2f2;
}
</style>
<style lang="less" scoped>
.operation-start-container {
  padding-top: 5px;
  font-size: 14px;
  .no-data {
    background-color: #ffffff;
    padding: 10px;
    border-top: 1px solid #d7d7d7;
    border-bottom: 1px solid #d7d7d7;
  }
  .pause-info {
    .pause-info-title {
      font-weight: bold;
      padding-left: 5px;
      padding-bottom: 5px;
    }
    .pause-info-content {
      .pause-info-item {
        background-color: #ffffff;
        .info-item-title {
          color: #666666;
          border-bottom: 1px solid #d7d7d7;
          padding: 5px;
        }
        .info-item-pause {
          border-bottom: 1px solid #d7d7d7;
          padding: 5px;
          .pause-person-time {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .pause-person {
            }
            .pause-time {
              color: #666666;
            }
          }
          .pause-reason {
            margin-top: 10px;
            margin-bottom: 5px;
            padding: 5px 0;
            background-color: #f8f8f8;
          }
        }
        .info-item-recover {
          padding: 5px 5px 10px 5px;
          .recover-person-time {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .recover-time {
              color: #666666;
            }
          }
        }
      }
      .pause-info-item + .pause-info-item {
        margin-top: 10px;
      }
    }
  }
  .close-info {
    .close-info-title {
      font-weight: bold;
      padding: 5px;
    }
    .close-info-content {
      .close-card {
        background-color: #ffffff;
        padding: 5px;
        .close-person-time {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .close-time {
            color: #666666;
          }
        }
        .close-reason {
          margin-top: 10px;
          margin-bottom: 5px;
          padding: 5px 0;
          background-color: #f8f8f8;
        }
      }
    }
  }
}
</style>
