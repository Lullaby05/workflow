<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="数量限制">
      <template #label>
        <tip content="限制最大上传图片数量（为0则不限制）">数量限制</tip>
      </template>
      <el-input-number class="max-fill" controls-position="right" :precision="0" v-model="modelValue.maxNumber" placeholder="最多上传几张图片"/>
    </el-form-item>
    <el-form-item label="大小限制">
      <template #label>
        <tip content="限制单个图片最大大小-MB（为0则不限制）">大小限制</tip>
      </template>
      <el-input-number class="max-fill" controls-position="right" :precision="1" v-model="modelValue.maxSize" placeholder="单个文件最大大小"/>
    </el-form-item>
    <el-form-item label="图片压缩">
      <el-switch v-model="modelValue.enableZip"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ImageUploadConfig',
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

<style lang="less" scoped>
:deep(.el-form-item__label) {
  padding: 0 12px 0 0;
}
</style>
