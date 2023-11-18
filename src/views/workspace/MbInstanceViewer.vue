<template>
  <div v-loading="loading" class="preview">
    <div v-if="instanceData.instanceId">
      <div class="title">
        <div v-if="instanceData.staterUser">
          <avatar showY :name="instanceData.staterUser.name" :src="instanceData.staterUser.avatar"/>
        </div>
        <div class="title-info">
          <div class="name">
            <span style="margin-right: 15px; color:#000;">{{ instanceData.processDefName }}</span>
            <el-tag :type="status.type" size="small">{{ status.text }}</el-tag>
          </div>
          <div class="code">
            <span style="color:#6c6c6c;">编号：</span>
            <span class="id">{{ instanceData.instanceId }}</span>
          </div>
          <img v-if="status.img" :src="status.img" :style="isMobile ? 'right: -20px':''">
          <!--          <div style="font-size: 13px; color: rgb(142 141 141)" v-if="instanceData.staterUser">
                      由 {{instanceData.staterUser.name}} 在{{instanceData.startTime}}发起
                    </div>-->
        </div>
      </div>
      <div class="form">
        <form-render class="process-form" :mode="isMobile ? 'MOBILE':'PC'" ref="form" :forms="instanceData.formItems"
                     :config="instanceData.formConfig" v-model="instanceData.formData"/>
      </div>
      <div class="process">
        <process-progress :result="instanceData.result" :status="instanceData.status" :progress="instanceData.progress"/>
      </div>
    </div>
  </div>
</template>

<script>
import FormRender from '@/views/common/form/FormRender.vue'
import ProcessProgress from "./approval/ProcessProgress.vue";
import {getFormAndProcessProgress} from '@/api/processTask'
import moment from "moment";

export default {
  name: "MbInstanceViewer",
  components: {FormRender, ProcessProgress},
  computed: {
    isMobile() {
      return window.screen.width < 450
    },
    status() {
      let status = {
        text: this.instanceData.status
      }
      switch (this.instanceData.result){
        case 'RUNNING':
        case 'COMPLETE':
          status.type = ''
          status.img = null
          break
        case 'PASS':
          status.type = 'success'
          status.img = this.$getLocalRes('agree.png')
          break
        case 'CANCEL':
          status.type = 'info'
          status.img = this.$getLocalRes('recall.png')
          break
        case 'REFUSE':
          status.type = 'danger'
          status.img = this.$getLocalRes('refuse.png')
          break
      }
      return status
    },
    formData() {
      //过滤出可编辑的表单字段
      let formFields = []
      let formData = {}
      this.getEnableEditForm(this.instanceData.formItems || [], formFields)
      formFields.forEach(k => {
        formData[k] = this.instanceData.formData[k]
      })
      return formData
    },
  },
  data() {
    return {
      loading: false,
      instanceData: {},
      instanceId: null,
      nodeId: null
    }
  },
  mounted() {
    this.instanceId = this.$route.query.instanceId
    this.getInstanceData()
  },
  methods: {
    //根据退回进行分段拆解
    splitByRecall(progress) {
      //提取分段时间点
      let points = progress.filter(p => p.result === 'recall').map(p => new Date(p.startTime).getTime())
      if (points.length > 0) {
        let blocks = [] //分段流程块组
        let pointer = 0 //定点索引
        points.push(new Date().getTime())
        points.forEach(point => {
          let block = []
          for (let i = pointer; i < progress.length; i++) {
            let startTime = new Date(progress[i].startTime).getTime()
            if (startTime <= point) {
              block.push(progress[i])
            } else {
              pointer = i
              break
            }
          }
          //存段
          blocks.push(block)
        })
        //按段处理
        let processNodes = []
        blocks.forEach(block => processNodes.push(...this.mergeTask(block)))
        return processNodes
      }
      return this.mergeTask(progress)
    },
    //合并活动节点，此处执行一段合并算法用来处理退回导致节点重合的问题
    mergeTask(progress) {
      let merge = []
      progress.forEach(pg => {
        //节点合并条件，满足以下条件就合并节点
        let i = merge.findIndex(n => n.nodeId === pg.nodeId && n.startTime === pg.startTime)
        if (i > -1) {
          //存在则合并到对象
          if (merge[i].users) {
            //已经合并过了
            merge[i].finishTime = pg.finishTime
            merge[i].users.push(pg)
            merge[i].result = this.getApprovalResult(merge[i], pg, pg.approvalMode)
            merge[i].comment = merge[i].comment.concat(pg.comment)
          } else {
            //没有就合并
            merge[i] = {
              agree: null,
              name: pg.name,
              nodeType: pg.nodeType,
              approvalMode: pg.approvalMode,
              nodeId: pg.nodeId,
              result: this.getApprovalResult(merge[i], pg, pg.approvalMode),
              startTime: merge[i].startTime,
              finishTime: pg.finishTime,
              comment: merge[i].comment.concat(pg.comment),
              users: [merge[i], pg]
            }
            merge[i].comment = merge[i].comment.sort((a, b) => moment(a.createTime) - moment(b.createTime))
          }
        } else {
          merge.push(pg)
        }
      })
      return merge
    },
    getInstanceData() {
      this.loading = true
      getFormAndProcessProgress(this.instanceId, this.nodeId).then(rsp => {
        this.loading = false
        this.instanceData = rsp.data
        this.instanceData.progress = this.splitByRecall(rsp.data.progress)
      }).catch(err => {
        this.loading = false
        this.$err(err, '获取审批实例数据失败')
      })
    },
    getApprovalResult(oldVal, newVal, mode) {
      if (mode === 'OR') {
        return newVal.result ? newVal.result : oldVal.result
      } else if (mode === 'AND') {
        let rs = oldVal.result || newVal.result
        return rs === 'recall' ? 'recall' : rs
      } else {
        return newVal.result
      }
    },
    comment() {
      this.actionType = 'comment'
      this.actionVisible = true
    },
    handler(action) {
      this.actionType = action
      this.actionVisible = true
    },
    getEnableEditForm(forms, fields) {
      forms.forEach(f => {
        if (f.name === 'SpanLayout' || f.name === 'ModuleBlock') {
          this.getEnableEditForm(f.props.items, fields)
        } else if (f.name === 'TableList'){
          fields.push(f.id)
        } else if (f.perm === 'E') {
          fields.push(f.id)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.preview {
  background: #eeeeee;
  position: relative;
  height: 100%;

  & > div:nth-child(1) {
    overflow-y: auto;
    height: 100%;
    //padding-bottom: 50px;
  }
}

.process {
  background: white;
  padding: 20px 10px 50px 10px;
}

.title {
  background: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  position: relative;
  padding: 10px;

  & > div {
    color: #666666;
    display: inline-block;
  }

  .title-info {
    height: 50px;
    display: flex;
    padding: 0 10px;
    position: relative;
    flex-direction: column;
    justify-content: space-between;

    .name {
      font-size: 15px;
      color: #5e5e5e;
    }

    .code {
      font-size: 13px;
    }

    img {
      width: 80px;
      height: 80px;
      position: absolute;
      right: -100px;
      top: 30px;
      z-index: 9999;
    }
  }

  .extend-options {
    position: absolute;
    right: 0;

    i {
      cursor: pointer;
      padding: 0 10px;

      &:hover {
        color: @theme-primary;
      }
    }
  }
}

.form {
  margin: 15px 0;
  padding: 10px 10px 1px 10px;
  background: white;
}
</style>
