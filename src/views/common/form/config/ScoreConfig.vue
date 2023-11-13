<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="最大分值">
      <el-input-number controls-position="right" :precision="0" :max="20" :min="1" v-model="modelValue.max" placeholder="最大分值"/>
    </el-form-item>
    <el-form-item label="允许半分">
      <el-switch v-model="modelValue.enableHalf"></el-switch>
    </el-form-item>
    <el-form-item label="显示分值">
      <el-switch v-model="modelValue.showScore"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ScoreConfig',
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
