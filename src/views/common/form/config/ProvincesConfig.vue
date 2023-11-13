<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="地区级别">
      <el-select v-model="modelValue.level" size="small">
        <el-option :value="1" label="省"></el-option>
        <el-option :value="2" label="省-市"></el-option>
        <el-option :value="3" label="省-市-区"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'Provinces',
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  components: {},
  data() {
    return {}
  },
  methods: {},
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
