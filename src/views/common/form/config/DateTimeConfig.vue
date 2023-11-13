<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="modelValue.placeholder" placeholder="请设置日期提示"/>
    </el-form-item>
    <el-form-item label="日期格式">
      <el-select v-model="modelValue.format">
        <el-option value="YYYY" label="年"></el-option>
        <el-option value="YYYY-MM" label="年-月"></el-option>
        <el-option value="YYYY-MM-DD" label="年-月-日"></el-option>
        <el-option value="YYYY-MM-DD HH:mm" label="年-月-日 时:分"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
import ConfigMinxins from "../ConfigMinxins";

export default {
  name: 'DateTime',
  mixins: [ConfigMinxins],
  components: {},
}
</script>

<style scoped></style>
