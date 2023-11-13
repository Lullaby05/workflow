<script>
import {h} from 'vue'
//导入所有节点组件
import Approval from '@/views/common/process/nodes/ApprovalNode.vue'
import Task from '@/views/common/process/nodes/TaskNode.vue'
import Cc from '@/views/common/process/nodes/CcNode.vue'
import Inclusive from '@/views/common/process/nodes/InclusiveNode.vue'
import Concurrent from '@/views/common/process/nodes/ConcurrentNode.vue'
import Condition from '@/views/common/process/nodes/ConditionNode.vue'
import Trigger from '@/views/common/process/nodes/TriggerNode.vue'
import Delay from '@/views/common/process/nodes/DelayNode.vue'
import Empty from '@/views/common/process/nodes/EmptyNode.vue'
import Root from '@/views/common/process/nodes/RootNode.vue'
import Node from '@/views/common/process/nodes/Node.vue'

import DefaultProps from './DefaultNodeProps'
import Process from '@/utils/ProcessUtil'
import { resolveComponent } from 'vue'

export default {
  name: 'ProcessTree',
  components: {
    Node,
    Task,
    Root,
    Approval,
    Cc,
    Trigger,
    Inclusive,
    Concurrent,
    Condition,
    Delay,
    Empty,
  },
  data() {
    return {
      valid: true,
    }
  },
  computed: {
    nodeMap() {
      return this.$store.state.nodeMap
    },
    dom() {
      return this.$store.state.design.process
    },
  },
  render() {
    console.log('渲染流程树')
    this.nodeMap.clear()
    let processTrees = this.getDomTree(this.dom)
    //插入末端节点
    processTrees.push(
      h('div', { style: { 'text-align': 'center' } }, [
        h('div', {
            class: { 'process-end': true },
            innerHTML: '流程结束',
          }
        ),
      ])
    )
    return h('div', { class: { _root: true }, ref: '_root' }, processTrees)
  },
  methods: {
    getDomTree(node) {
      this.toMapping(node)
      if (Process.isPrimaryNode(node)) {
        //普通业务节点
        let childDoms = this.getDomTree(node.children)
        this.decodeAppendDom(node, childDoms)
        return [h('div', { class: { 'primary-node': true } }, childDoms)]
      } else if (Process.isBranchNode(node)) {
        let index = 0
        //纠正nodeID，添加后缀
        this.rectifyBranchNodeId(node)
        //遍历分支节点，包含并行及条件节点
        let branchItems = node.branchs.map((branchNode) => {
          //处理每个分支内子节点
          this.toMapping(branchNode)
          let childDoms = this.getDomTree(branchNode.children)
          this.decodeAppendDom(branchNode, childDoms, {
            level: index + 1,
            size: node.branchs.length,
          })
          //插入4条横线，遮挡掉条件节点左右半边线条
          this.insertCoverLine(index, childDoms, node.branchs)
          //遍历子分支尾部分支
          index++
          return h('div', { class: { 'branch-node-item': true } }, childDoms)
        })
        //插入添加分支/条件的按钮
        branchItems.unshift(
          h('div', { class: { 'add-branch-btn': true } }, [
            h(resolveComponent('el-button'), {
                class: { 'add-branch-btn-el': true },
                size: 'default',
                round: true,
                onClick: () => this.addBranchNode(node),
                innerHTML: `添加${Process.isConditionNode(node) ? '条件' : '分支'}`,
              },  () => []
            ),
          ])
        )
        let bchDom = [h('div', { class: { 'branch-node': true } }, branchItems)]
        //填充节点聚合属性
        node.children['parentType'] = node.type
        //继续遍历分支后的节点
        let afterChildDoms = this.getDomTree(node.children)
        return [h('div', {}, [bchDom, afterChildDoms])]
      } else if (Process.isEmptyNode(node)) {
        //空节点，存在于分支尾部
        let childDoms = this.getDomTree(node.children)
        this.decodeAppendDom(node, childDoms)
        return [h('div', { class: { 'empty-node': true } }, childDoms)]
      } else {
        //遍历到了末端，无子节点
        return []
      }
    },
    rectifyBranchNodeId(node){
      if (node.id.indexOf('_begin') < 0){
        node.id = node.id + '_begin'
        node.children.id = node.id + '_end'
      }
    },
    //解码渲染的时候插入dom到同级
    decodeAppendDom(node, dom, props = {}) {
      props.config = node
      dom.unshift(
        h(resolveComponent(node.type.toLowerCase()), {
          ...props,
            ref: node.id,
            key: node.id,
            //定义事件，插入节点，删除节点，选中节点，复制/移动
            onInsertNode: (type) => this.insertNode(type, node),
            onDelNode: () => this.delNode(node),
            onSelected: () => this.selectNode(node),
            onCopy: () => this.copyBranch(node),
            onLeftMove: () => this.branchMove(node, -1),
            onRightMove: () => this.branchMove(node, 1),
          }, () => []
        )
      )
    },
    //id映射到map，用来向上遍历
    toMapping(node) {
      if (node && node.id) {
        //console.log("node=> " + node.id + " name:" + node.name + " type:" + node.type)
        this.nodeMap.set(node.id, node)
      }
    },
    insertCoverLine(index, doms, branchs) {
      if (index === 0) {
        //最左侧分支
        doms.unshift(h('div', { class: { 'line-top-left': true } }, []))
        doms.unshift(h('div', { class: { 'line-bot-left': true } }, []))
      } else if (index === branchs.length - 1) {
        //最右侧分支
        doms.unshift(h('div', { class: { 'line-top-right': true } }, []))
        doms.unshift(h('div', { class: { 'line-bot-right': true } }, []))
      }
    },
    copyBranch(node) {
      let parentNode = this.nodeMap.get(node.parentId)
      let branchNode = this.$deepCopy(node)
      branchNode.name = branchNode.name + '-copy'
      this.forEachNode(parentNode, branchNode, (parent, node) => {
        let id = this.getRandomId()
        console.log(node, '新id =>' + id, '老nodeId:' + node.id)
        node.id = id
        node.parentId = parent.id
      })
      parentNode.branchs.splice(parentNode.branchs.indexOf(node), 0, branchNode)
      this.$forceUpdate()
    },
    branchMove(node, offset) {
      let parentNode = this.nodeMap.get(node.parentId)
      let index = parentNode.branchs.indexOf(node)
      let branch = parentNode.branchs[index + offset]
      parentNode.branchs[index + offset] = parentNode.branchs[index]
      parentNode.branchs[index] = branch
      this.$forceUpdate()
    },
    getRandomId() {
      return `node_${new Date().getTime().toString().substring(5)}${Math.round(
        Math.random() * 9000 + 1000
      )}`
    },
    //选中一个节点
    selectNode(node) {
      this.$store.commit('selectedNode', node)
      this.$emit('selectedNode', node)
    },
    //处理节点插入逻辑
    insertNode(type, parentNode) {
      this.$refs['_root'].click()
      //缓存一下后面的节点
      let afterNode = parentNode.children
      //插入新节点
      parentNode.children = {
        id: this.getRandomId(),
        parentId: parentNode.id,
        props: {},
        type: type,
      }
      switch (type) {
        case 'APPROVAL':
          this.insertApprovalNode(parentNode, afterNode)
          break
        case 'CC':
          this.insertCcNode(parentNode)
          break
        case 'TASK':
          this.insertTaskNode(parentNode);
          break;
        case 'DELAY':
          this.insertDelayNode(parentNode)
          break
        case 'TRIGGER':
          this.insertTriggerNode(parentNode)
          break
        case 'INCLUSIVES':
          this.insertInclusivesNode(parentNode);
          break;
        case 'CONDITIONS':
          this.insertConditionsNode(parentNode)
          break
        case 'CONCURRENTS':
          this.insertConcurrentsNode(parentNode)
          break
        default:
          break
      }
      //拼接后续节点
      if (Process.isBranchNode({ type: type })) {
        if (afterNode && afterNode.id) {
          afterNode.parentId = parentNode.children.children.id
        }
        parentNode.children.children['children'] = afterNode
      } else {
        if (afterNode && afterNode.id) {
          afterNode.parentId = parentNode.children.id
        }
        parentNode.children['children'] = afterNode
      }
      this.$forceUpdate()
    },
    insertApprovalNode(parentNode) {
      parentNode.children['name'] = '审批人'
      parentNode.children['props'] = this.$deepCopy(DefaultProps.APPROVAL_PROPS)
    },
    insertTaskNode(parentNode){
      parentNode.children["name"] = "办理人"
      parentNode.children['props'] = this.$deepCopy(DefaultProps.TASK_PROPS)
    },
    insertCcNode(parentNode) {
      parentNode.children['name'] = '抄送人'
      parentNode.children['props'] = this.$deepCopy(DefaultProps.CC_PROPS)
    },
    insertDelayNode(parentNode) {
      parentNode.children['name'] = '延时处理'
      parentNode.children['props'] = this.$deepCopy(DefaultProps.DELAY_PROPS)
    },
    insertTriggerNode(parentNode) {
      parentNode.children['name'] = '触发器'
      parentNode.children['props'] = this.$deepCopy(DefaultProps.TRIGGER_PROPS)
    },
    insertInclusivesNode(parentNode){
      parentNode.children['id'] = parentNode.children['id'] + '_begin'
      parentNode.children['name'] = "包容分支"
      parentNode.children['children'] = {
        id: parentNode.children['id'] + '_end',
        parentId: parentNode.children.id,
        parentType: 'INCLUSIVES',
        type: "EMPTY"
      }
      parentNode.children["branchs"] = [
        {
          id: this.getRandomId(),
          name: "包容条件1",
          parentId: parentNode.children.id,
          type: "INCLUSIVE",
          props: this.$deepCopy(DefaultProps.CONDITION_PROPS),
          children:{}
        },{
          id: this.getRandomId(),
          name: "默认条件",
          parentId: parentNode.children.id,
          type: "INCLUSIVE",
          props: this.$deepCopy(DefaultProps.CONDITION_PROPS),
          children:{}
        }
      ]
      //让第二个条件成为默认条件
      parentNode.children.branchs[1].props.groups = []
    },
    insertConditionsNode(parentNode) {
      parentNode.children['id'] = parentNode.children['id'] + '_begin'
      parentNode.children['name'] = '条件分支'
      parentNode.children['children'] = {
        id: parentNode.children['id'] + '_end',
        parentId: parentNode.children.id,
        parentType: 'CONDITIONS',
        type: 'EMPTY',
      }
      parentNode.children['branchs'] = [
        {
          id: this.getRandomId(),
          parentId: parentNode.children.id,
          type: 'CONDITION',
          props: this.$deepCopy(DefaultProps.CONDITION_PROPS),
          name: '条件1',
          children: {},
        },
        {
          id: this.getRandomId(),
          parentId: parentNode.children.id,
          type: 'CONDITION',
          props: this.$deepCopy(DefaultProps.CONDITION_PROPS),
          name: '默认条件',
          children: {},
        },
      ]
      //让第二个条件成为默认条件
      parentNode.children.branchs[1].props.groups = []
    },
    insertConcurrentsNode(parentNode) {
      parentNode.children['id'] = parentNode.children['id'] + '_begin'
      parentNode.children['name'] = '并行分支'
      parentNode.children['children'] = {
        id: parentNode.children['id'] + '_end',
        parentId: parentNode.children.id,
        parentType: 'CONCURRENTS',
        type: 'EMPTY',
      }
      parentNode.children['branchs'] = [
        {
          id: this.getRandomId(),
          name: '分支1',
          parentId: parentNode.children.id,
          type: 'CONCURRENT',
          props: {},
          children: {},
        },
        {
          id: this.getRandomId(),
          name: '分支2',
          parentId: parentNode.children.id,
          type: 'CONCURRENT',
          props: {},
          children: {},
        },
      ]
    },
    getBranchEndNode(conditionNode) {
      if (!conditionNode.children || !conditionNode.children.id) {
        return conditionNode
      }
      return this.getBranchEndNode(conditionNode.children)
    },
    addBranchNode(node){
      if (node.branchs.length < 10){
        let props = {}
        let type = 'CONCURRENT'
        if (Process.isConditionNode(node)){
          type = 'CONDITION'
          props = this.$deepCopy(DefaultProps.CONDITION_PROPS)
        }else if (Process.isInclusiveNode(node)){
          type = 'INCLUSIVE'
          props = this.$deepCopy(DefaultProps.CONDITION_PROPS)
        }
        node.branchs.push({
          id: this.getRandomId(),
          parentId: node.id,
          name: (Process.isConditionNode(node) ? '条件':'分支') + (node.branchs.length + 1),
          props: props,
          type: type,
          children:{}
        })
      }else {
        this.$message.warning("最多只能添加 10 项😥")
      }
    },
    //删除当前节点
    delNode(node) {
      console.log('删除节点', node)
      //获取该节点的父节点
      let parentNode = this.nodeMap.get(node.parentId)
      if (parentNode) {
        //判断该节点的父节点是不是分支节点
        if (Process.isBranchNode(parentNode)) {
          //移除该分支
          parentNode.branchs.splice(parentNode.branchs.indexOf(node), 1)
          //处理只剩1个分支的情况
          if (parentNode.branchs.length < 2) {
            //获取条件组的父节点
            let ppNode = this.nodeMap.get(parentNode.parentId)
            //判断唯一分支是否存在业务节点
            if (
              parentNode.branchs[0].children &&
              parentNode.branchs[0].children.id
            ) {
              //将剩下的唯一分支头部合并到主干
              ppNode.children = parentNode.branchs[0].children
              ppNode.children.parentId = ppNode.id
              //搜索唯一分支末端最后一个节点
              let endNode = this.getBranchEndNode(parentNode.branchs[0])
              //后续节点进行拼接, 这里要取EMPTY后的节点
              endNode.children = parentNode.children.children
              if (endNode.children && endNode.children.id) {
                endNode.children.parentId = endNode.id
              }
            } else {
              //直接合并分支后面的节点，这里要取EMPTY后的节点
              ppNode.children = parentNode.children.children
              if (ppNode.children && ppNode.children.id) {
                ppNode.children.parentId = ppNode.id
              }
            }
          }
        } else {
          //不是的话就直接删除
          if (node.children && node.children.id) {
            node.children.parentId = parentNode.id
          }
          parentNode.children = node.children
        }
        this.$forceUpdate()
      } else {
        this.$message.warning('出现错误，找不到上级节点😥')
      }
    },
    validateProcess() {
      this.valid = true
      let err = []
      this.validate(err, this.dom)
      return err
    },
    validateNode(err, node) {
      if (this.$refs[node.id].validate) {
        this.valid = this.$refs[node.id].validate(err)
      }
    },
    //更新指定节点的dom
    nodeDomUpdate(node) {
      this.$refs[node.id].$forceUpdate()
    },
    //给定一个起始节点，遍历内部所有节点
    forEachNode(parent, node, callback) {
      if (Process.isBranchNode(node)) {
        callback(parent, node)
        this.forEachNode(node, node.children, callback)
        node.branchs.map((branchNode) => {
          callback(node, branchNode)
          this.forEachNode(branchNode, branchNode.children, callback)
        })
      } else if (
        Process.isPrimaryNode(node) ||
        Process.isEmptyNode(node) ||
        Process.isBranchSubNode(node)
      ) {
        callback(parent, node)
        this.forEachNode(node, node.children, callback)
      }
    },
    //校验所有节点设置
    validate(err, node) {
      if (Process.isPrimaryNode(node)) {
        this.validateNode(err, node)
        this.validate(err, node.children)
      } else if (Process.isBranchNode(node)) {
        //校验每个分支
        let defaultBranchNum = 0
        node.branchs.map((branchNode) => {
          if (
            !Process.isConcurrentNode(node) &&
            (branchNode.props.groups || []).length === 0
          ) {
            defaultBranchNum++
          }
          //校验条件节点
          this.validateNode(err, branchNode)
          //校验条件节点后面的节点
          this.validate(err, branchNode.children)
        })
        if (defaultBranchNum > 1) {
          err.push(`存在${defaultBranchNum}条默认条件分支，只允许一条`)
        }
        this.validate(err, node.children)
      } else if (Process.isEmptyNode(node)) {
        this.validate(err, node.children)
      }
    },
  },
  emits: ['selectedNode'],
}
</script>

<style lang="less" scoped>
._root {
  margin: 0 auto;
}
.process-end {
  width: 60px;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: small;
  color: #747474;
  background-color: #f2f2f2;
  box-shadow: 0 0 10px 0 #bcbcbc;
}
.primary-node {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.branch-node {
  display: flex;
  justify-content: center;
  /*border-top: 2px solid #cccccc;
  border-bottom: 2px solid #cccccc;*/
}
.branch-node-item {
  position: relative;
  display: flex;
  background: #f5f6f6;
  flex-direction: column;
  align-items: center;
  border-top: 2px solid #cccccc;
  border-bottom: 2px solid #cccccc;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - 1px);
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }
  .line-top-left,
  .line-top-right,
  .line-bot-left,
  .line-bot-right {
    position: absolute;
    width: 50%;
    height: 4px;
    background-color: #f5f6f6;
  }
  .line-top-left {
    top: -2px;
    left: -1px;
  }
  .line-top-right {
    top: -2px;
    right: -1px;
  }
  .line-bot-left {
    bottom: -2px;
    left: -1px;
  }
  .line-bot-right {
    bottom: -2px;
    right: -1px;
  }
}
.add-branch-btn {
  position: absolute;
  width: 80px;
  .add-branch-btn-el {
    z-index: 999;
    position: absolute;
    top: -15px;
  }
}

.empty-node {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
