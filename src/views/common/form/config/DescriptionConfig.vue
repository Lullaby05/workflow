<template>
  <div>
    <el-form-item label="提示内容">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示内容"/>
    </el-form-item>
    <el-form-item label="文字颜色">
      <el-color-picker v-model="modelValue.color"></el-color-picker>
    </el-form-item>
  </div>
</template>

<script>
import ConfigMinxins from "../ConfigMinxins";

export default {
  name: 'Description',
  mixins: [ConfigMinxins],
  components: {},
}
</script>

<style scoped></style>
