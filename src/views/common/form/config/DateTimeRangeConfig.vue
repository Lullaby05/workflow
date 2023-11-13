<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder[0]" placeholder="开始日期提示"/>
      <el-input size="default" v-model="modelValue.placeholder[1]" placeholder="结束日期提示"/>
    </el-form-item>
    <el-form-item label="日期格式">
      <el-select v-model="modelValue.format">
        <el-option value="YYYY" label="年"></el-option>
        <el-option value="YYYY-MM" label="年-月"></el-option>
        <el-option value="YYYY-MM-DD" label="年-月-日"></el-option>
        <el-option value="YYYY-MM-DD HH:mm" label="年-月-日 时:分"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="展示时长">
      <el-switch v-model="modelValue.showLength"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import ConfigMinxins from "../ConfigMinxins";

export default {
  name: 'DateTimeRangeConfig',
  mixins: [ConfigMinxins],
  components: {},
}
</script>

<style scoped></style>
