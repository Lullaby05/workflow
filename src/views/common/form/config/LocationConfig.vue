<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="允许编辑">
      <el-switch v-model="modelValue.enableEdit"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'Location',
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
