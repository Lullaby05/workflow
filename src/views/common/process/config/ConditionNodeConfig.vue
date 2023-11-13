<template>
  <div>
    <el-form inline label-width="100px">
      <el-form-item label="调整优先级" prop="level">
        <el-popover placement="right" title="拖拽条件调整优先级顺序" width="250" trigger="click">
          <draggable style="width: 100%; min-height: 25px" item-key="id" v-model="prioritySortList"
                     :component-data="{tag: 'div', type: 'transition-group'}" v-bind="dragProps">
            <template #item="{element, index}">
              <div :class="{'drag-no-choose': true, 'drag-hover': element.id === selectedNode.id}">
                <ellipsis style="width: 150px" hover-tip :content="element.name" />
                <div>优先级 {{ index + 1 }}</div>
              </div>
            </template>
          </draggable>
          <template #reference>
            <el-button icon="el-icon-sort" size="small">第{{ nowNodeLeave + 1 }}级</el-button>
          </template>
        </el-popover>
      </el-form-item>
      <el-form-item label="条件组关系" label-width="150px">
        <el-switch v-model="config.groupsType" active-color="#409EFF" inactive-color="#c1c1c1" active-value="AND" inactive-value="OR" active-text="且" inactive-text="或">
        </el-switch>
      </el-form-item>
      <el-form-item label="条件设置模式">
        <el-radio-group v-model="config.mode">
          <el-radio label="SIMPLE">简单模式</el-radio>
          <el-radio label="UEL" disabled>逻辑表达式</el-radio>
          <el-radio label="HTTP" disabled>网络请求</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="表达式设置" v-if="config.mode === 'UEL'">
        <el-input v-model="config.expression" placeholder="使用bpmn UEL表达式构造条件"/>
        <span class="item-desc">使用表达式构建复杂逻辑，谨慎使用</span>
      </el-form-item>
    </el-form>
    <div v-if="config.mode === 'SIMPLE'">
      <el-button type="primary" size="small" icon="el-icon-plus" style="margin: 0 15px 15px 0" round @click="addConditionGroup">
        添加条件组
      </el-button>
      <span class="item-desc">📢表单字段设置为必填才能作为审批条件</span>
      <group-item/>
    </div>
    <div v-if="config.mode === 'HTTP'">
<!--      <http-req v-model="config.http"/>-->
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import GroupItem from './ConditionGroupItemConfig.vue'

export default {
  name: 'ConditionNodeConfig',
  components: { draggable, GroupItem },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  computed: {
    selectedNode() {
      return this.$store.state.selectedNode
    },
    select() {
      return this.config.assignedUser || []
    },
    nowNodeLeave() {
      return this.prioritySortList.indexOf(this.selectedNode)
    },
    //条件节点
    prioritySortList: {
      get(){
        let node = this.$store.state.nodeMap.get(this.selectedNode.parentId)
        if (node) {
          return node.branchs || []
        }
        return []
      },
      set(val){
        let node = this.$store.state.nodeMap.get(this.selectedNode.parentId)
        if (node) {
          node.branchs = val
        }
      }
    },
  },
  data() {
    return {
      dragProps:{
        animation: 300,
        disabled: false,
        sort: true,
        ghostClass: "choose",
      },
    }
  },
  methods: {
    addConditionGroup() {
      this.config.groups.push({
        cids: [],
        groupType: 'OR',
        conditions: [],
      })
    },
    selectUser() {
      this.showOrgSelect = true
    },
    selected(select) {
      console.log(select)
      this.showOrgSelect = false
      select.forEach((val) => this.select.push(val))
    },
    removeOrgItem(index) {
      this.select.splice(index, 1)
    },
  },
}
</script>

<style lang="less" scoped>
.choose {
  border-radius: 5px;
  margin-top: 2px;
  background: #f4f4f4;
  border: 1px dashed #1890ff !important;
}
.drag-hover {
  color: #1890ff;
}
.drag-no-choose {
  cursor: move;
  background: #f8f8f8;
  border-radius: 5px;
  margin: 5px 0;
  height: 25px;
  line-height: 25px;
  padding: 5px 10px;
  border: 1px solid #ffffff;
  div {
    display: inline-block;
    font-size: small !important;
  }

  div:nth-child(2) {
    float: right !important;
  }
}
</style>
