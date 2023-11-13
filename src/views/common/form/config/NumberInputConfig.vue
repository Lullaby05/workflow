<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="保留小数">
      <el-input-number controls-position="right" :precision="0" :max="3" :min="0" v-model="modelValue.precision" placeholder="小数位数"/>
      位
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'NumberInput',
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
