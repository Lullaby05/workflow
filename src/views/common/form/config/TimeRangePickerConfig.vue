<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder[0]" placeholder="开始时间提示"/>
      <el-input size="default" v-model="modelValue.placeholder[1]" placeholder="结束时间提示"/>
    </el-form-item>
    <el-form-item label="时间格式">
      <el-select v-model="modelValue.format">
        <el-option value="HH:mm:ss" label="时:分:秒"></el-option>
        <el-option value="HH:mm" label="时:分"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="展示时长">
      <el-switch v-model="modelValue.showLength"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TimeRangePickerConfig',
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
