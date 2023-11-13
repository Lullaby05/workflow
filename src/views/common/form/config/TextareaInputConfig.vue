<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="扫码录入">
      <el-switch v-model="modelValue.enableScan"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TextareaInput',
  components: {},
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {}
      },
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
