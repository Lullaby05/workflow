<template>
  <div>
    <el-tabs v-model="active" v-if="name && formConfig.length > 0">
      <el-tab-pane label="基本信息" name="basic" v-if="isOperationPage">
        <el-form :model="selectNode" label-width="130px">
          <el-form-item field="processKey" label="processKey">
            <el-select v-model="selectNode.processKey" placeholder="请选择processKey">
              <el-option v-for="item in processKeyOptions" :key="item.dictValue" :disabled="item.disabled" :label="item.dictKey" :value="item.dictValue"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item field="processFormKey" label="processFormKey">
            <el-select v-model="selectNode.processFormKey" placeholder="请选择processFormKey">
              <el-option v-for="item in processFormKeyOptions" :key="item.dictValue" :label="item.dictKey" :value="item.dictValue"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="name" name="properties">
        <component :is="(selectNode.type || '').toLowerCase()" :config="selectNode.props" />
      </el-tab-pane>
      <el-tab-pane label="表单权限设置" name="permissions">
        <form-authority-config />
      </el-tab-pane>
      <el-tab-pane label="操作权限" name="operatePerm" v-if="selectNode.type === 'APPROVAL' ||
        selectNode.type === 'ROOT' ||
        selectNode.type === 'TASK'
        ">
        <task-operation-config />
      </el-tab-pane>
    </el-tabs>
    <component :is="(selectNode.type || '').toLowerCase()" v-else :config="selectNode.props" />
  </div>
</template>

<script>
import Approval from './ApprovalNodeConfig.vue';
import Condition from './ConditionNodeConfig.vue';
import Task from './TaskNodeConfig.vue';
import Delay from './DelayNodeConfig.vue';
import Cc from './CcNodeConfig.vue';
import Trigger from './TriggerNodeConfig.vue';
import Inclusive from './InclusiveNodeConfig.vue';
import TaskOperationConfig from './TaskOperationConfig.vue';
import FormAuthorityConfig from './FormAuthorityConfig.vue';
import Root from './RootNodeConfig.vue';

export default {
  name: 'NodeConfig',
  components: {
    Approval,
    Condition,
    Inclusive,
    Trigger,
    Delay,
    Root,
    Task,
    Cc,
    FormAuthorityConfig,
    TaskOperationConfig,
  },
  data() {
    return {
      active: 'properties',
    };
  },
  watch: {
    'selectNode.processKey'(newVal, oldVal) {
      this.$store.commit('setCertProcessKeyDisabled', { newVal, oldVal })
    }
  },
  computed: {
    selectNode() {
      return this.$store.state.selectedNode;
    },
    formConfig() {
      return this.$store.state.design.formItems;
    },
    processKeyOptions() {
      return this.$store.state.certProcessKeys;
    },
    processFormKeyOptions() {
      return this.$store.state.certProcessFormKeys;
    },
    isOperationPage() {
      return this.$route.name.includes('ForOperation');
    },
    name() {
      switch (this.selectNode.type) {
        case 'ROOT':
          return '设置发起人';
        case 'APPROVAL':
          return '设置审批人';
        case 'TASK':
          return '设置办理人';
        case 'CC':
          return '设置抄送人';
        default:
          return null;
      }
    }
  },
};
</script>

<style lang="less" scoped></style>
