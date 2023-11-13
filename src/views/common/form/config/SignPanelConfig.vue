<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="笔画粗细">
      <el-input-number controls-position="right" :precision="0" :max="5" :min="1" v-model="modelValue.thickness" placeholder="笔画粗细"/>
    </el-form-item>
    <el-form-item label="笔迹颜色">
      <el-color-picker v-model="modelValue.color"></el-color-picker>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'SignPanelConfig',
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
