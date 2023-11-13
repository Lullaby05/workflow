<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语"/>
    </el-form-item>
    <el-form-item label="保留小数">
      <el-input-number size="default" controls-position="right" :precision="0" :max="3" :min="0" v-model="modelValue.precision" placeholder="小数位数"/>
      位
    </el-form-item>
    <el-form-item label="展示大写">
      <el-switch v-model="modelValue.showChinese"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import ConfigMinxins from '../ConfigMinxins.js'
export default {
  name: 'AmountInputConfig',
  mixins: [ConfigMinxins],
  components: {},
}
</script>

<style scoped></style>
