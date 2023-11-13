<template>
  <el-popover placement="bottom-start" title="添加流程节点" width="370" trigger="click">
    <div class="node-select">
      <div @click="addApprovalNode">
        <icon name="el-icon-stamp" style="color: rgb(255, 148, 62)"></icon>
        <span>审批人</span>
      </div>
      <div @click="addTaskNode">
        <icon name="el-icon-checked" style="color:#E6B039;"></icon>
        <span>办理人</span>
      </div>
      <div @click="addCcNode">
        <icon name="el-icon-promotion" style="color: rgb(50, 150, 250)"></icon>
        <span>抄送人</span>
      </div>
      <div @click="addConditionsNode">
        <icon name="el-icon-share" style="color: rgb(21, 188, 131)"></icon>
        <span>条件分支</span>
      </div>
      <div @click="addConcurrentsNode">
        <icon name="el-icon-operation" style="color: #718dff"></icon>
        <span>并行分支</span>
      </div>
      <div @click="addInclusivesNode">
        <icon name="el-icon-connection" style="color:#345DA2;"></icon>
        <span>包容分支</span>
      </div>
      <div @click="addDelayNode">
        <icon name="el-icon-clock" style="color: #f25643"></icon>
        <span>延迟等待</span>
      </div>
      <div @click="addTriggerNode">
        <icon name="el-icon-setup" style="color: #15bc83"></icon>
        <span>触发器</span>
      </div>
    </div>
    <template #reference>
      <el-button icon="el-icon-plus" type="primary" size="default" circle></el-button>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: 'InsertButton',
  components: {},
  data() {
    return {}
  },
  computed: {
    selectedNode() {
      this.$store.state.selectedNode
    },
  },
  methods: {
    addApprovalNode() {
      this.$emit('insertNode', 'APPROVAL')
    },
    addCcNode() {
      this.$emit('insertNode', 'CC')
    },
    addDelayNode() {
      this.$emit('insertNode', 'DELAY')
    },
    addConditionsNode() {
      this.$emit('insertNode', 'CONDITIONS')
    },
    addInclusivesNode(){
      this.$emit('insertNode', "INCLUSIVES")
    },
    addTaskNode(){
      this.$emit('insertNode', "TASK")
    },
    addConcurrentsNode() {
      this.$emit('insertNode', 'CONCURRENTS')
    },
    addTriggerNode() {
      this.$emit('insertNode', 'TRIGGER')
    },
  },
  emits: ['insertNode'],
}
</script>

<style lang="less" scoped>
.node-select {
  div {
    display: inline-block;
    margin: 5px 5px;
    cursor: pointer;
    padding: 10px 15px;
    border: 1px solid #f8f9f9;
    background-color: #f8f9f9;
    border-radius: 10px;
    width: 130px;
    position: relative;
    span {
      position: absolute;
      left: 65px;
      top: 18px;
    }
    &:hover {
      background-color: #fff;
      box-shadow: 0 0 8px 2px #d6d6d6;
      transition: box-shadow 0.3s;
    }
    :deep(.icon) {
      font-size: 25px;
      padding: 5px;
      border: 1px solid #dedfdf;
      border-radius: 14px;
    }
  }
}
</style>
