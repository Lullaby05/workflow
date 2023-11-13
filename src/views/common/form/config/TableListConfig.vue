<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="提醒添加记录的提示"/>
    </el-form-item>
    <el-form-item label="最大行数">
      <template #label>
        <tip content="允许添加多少条记录（为0则不限制）">最大行数</tip>
      </template>
      <el-input-number controls-position="right" :precision="0" :max="100" :min="0" v-model="modelValue.maxSize" placeholder="限制条数"/>
    </el-form-item>
    <el-form-item label="布局方式">
      <el-radio name="layout" :label="true" v-model="modelValue.rowLayout">按表格</el-radio>
      <el-radio name="layout" :label="false" v-model="modelValue.rowLayout">按表单</el-radio>
    </el-form-item>
    <el-form-item label="展示合计">
      <el-switch v-model="modelValue.showSummary"></el-switch>
      <!--      <el-select v-if="modelValue.showSummary" style="width: 100%;" size="small" v-model="modelValue.summaryColumns" multiple clearable placeholder="请选择合计项">
          <el-option :label="column.title" :value="column.id" v-for="column in columns" :key="column.id"/>
        </el-select>-->
    </el-form-item>
    <el-form-item label="展示边框">
      <el-switch v-model="modelValue.showBorder"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TableListConfig',
  components: {},
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  computed: {
    columns() {
      return this.modelValue.columns.filter((c) => c.valueType === 'Number')
    },
  },
  data() {
    return {}
  },
  methods: {},
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
