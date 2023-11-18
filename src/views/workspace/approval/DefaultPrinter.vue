<template>
  <div id="default-print" class="print">
    <h2>{{ instance.processDefName }}</h2>
    <div class="header">
      <div>审批编号：{{ instance.instanceId }}</div>
      <div>提交时间：{{ instance.startTime }}</div>
    </div>
    <img class="result" v-if="status.img" :src="status.img" />
    <div class="qr-code">
      <div>扫码查流程</div>
      <qrcode-vue ref="qrCode" :value="qrCode" :size="90" level="L"/>
    </div>
    <div class="content">
      <table border="0">
        <tr>
          <th>提交人</th>
          <td>{{ instance.staterUser.name }}</td>
        </tr>
        <tr>
          <th>所在部门</th>
          <td>{{ instance.starterDept }}</td>
        </tr>
        <!--v-show="form.props.enablePrint"-->
        <tr v-for="form in formItems" :key="form.id">
          <th>{{ form.title }}</th>
          <td>
            <default-print-item :config="form" :data="instance.formData[form.id]"/>
          </td>
        </tr>
        <tr>
          <th :rowspan="process.length + 1">审批流程</th>
        </tr>
        <tr class="process-list" v-for="(task, i) in process" :key="i">
          <td>
            <div class="base-info">
              <div>{{ task.userName }}</div>
              <div>{{ task.result }}</div>
              <div>{{ task.finishTime }}</div>
              <img class="sign" v-if="task.signature" :src="task.signature">
            </div>
            <div class="comment">{{ task.comment }}</div>
          </td>
        </tr>
        <tr>
          <th>审批结果</th>
          <td>{{ status.text }}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <div>打印人：{{ loginUser.name }}</div>
      <div>打印时间：{{ moment().format('yyyy-MM-DD HH:mm:ss') }}</div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import DefaultPrintItem from './DefaultPrintFormItem.vue'
import QrcodeVue from "qrcode.vue";

export default {
  name: 'DefaultPrinter',
  components: {QrcodeVue, DefaultPrintItem },
  props: {
    instance: {
      required: true,
    },
    status: {
      required: true,
    },
  },
  computed: {
    loginUser() {
      return this.$store.state.loginUser
    },
    qrCode(){
      return `${window.location.origin}/#/mbInstance?instanceId=${this.instance.instanceId}`
    },
    process() {
      let userNodes = this.instance.progress.filter(
        (p) => p.nodeType === 'APPROVAL'
      )
      let userTask = []
      userNodes.forEach((un) => {
        if (Array.isArray(un.users)) {
          userTask.push(...un.users.map((u) => this.getTask(u)))
        } else {
          userTask.push(this.getTask(un))
        }
      })
      return userTask
    },
    formItems() {
      let result = []
      this.getItems(this.instance.formItems, result)
      return result
    },
  },
  data() {
    return {
      moment,
    }
  },
  methods: {
    getItems(items, collects) {
      items.forEach((item) => {
        if (item.name === 'SpanLayout' || item.name === 'ModuleBlock') {
          this.getItems(item.props.items, collects)
        } else {
          collects.push(item)
        }
      })
    },
    getTask(item) {
      return {
        userName: item.user.name,
        result: this.getResult(item.result),
        signature: item.signature,
        finishTime: item.finishTime ? item.finishTime.substring(0, 16) : '----',
        comment: item.comment.length > 0 ? item.comment[0].text : '',
      }
    },
    getResult(res) {
      switch (res) {
        case 'agree':
          return '已同意'
        case 'refuse':
          return '已拒绝'
        case 'recall':
          return '已退回'
        default:
          return '--'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.print {
  font-family: 宋体;
  position: relative;
  .result {
    position: absolute;
    width: 100px;
    height: 100px;
    right: 100px;
    top: 10px;
  }
  .qr-code{
    position: absolute;
    text-align: center;
    top: 0;
    right: 0;
  }
}
h2 {
  text-align: center;
}
.header {
  font-size: 16px;
  margin-bottom: 20px;
  div {
    padding: 5px 0;
  }
}
table {
  font-size: 16px;
  width: 100%;
  border-collapse: collapse;
  padding: 2px;
  th {
    width: 30%;
  }
}
table tr th,
table tr td {
  text-align: left;
  border: 1px solid #464648;
  padding: 5px 10px;
}
.footer {
  font-size: 16px;
  margin-top: 20px;
  div {
    display: inline-block;
    width: 50%;
  }

  div:last-child {
    text-align: right;
  }
}
.process-list {
  .base-info {
    position: relative;

    & > div {
      position: absolute;
    }

    div:nth-child(3) {
      right: 0;
    }

    div:nth-child(2) {
      right: 200px;
    }

    .sign {
      position: absolute;
      left: 50px;
      width: 110px;
      height: 50px;
    }
  }

  .comment {
    margin-left: 10px;
    margin-top: 40px;
  }
}
</style>
