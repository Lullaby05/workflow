<template>
  <div>
    <el-form-item label="URL地址">
      <el-input v-model="modelValue.url" placeholder="请输入网页地址URL"></el-input>
    </el-form-item>
    <el-form-item label="网页高度">
      <el-input-number :max="2000" :min="50" v-model="modelValue.height" placeholder="网页高度px"/>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'WebIframeConfig',
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
