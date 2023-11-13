<template>
  <el-date-picker
      v-model="modelValue.compareVal[0]"
      type="datetime"
      placeholder="选择比较时间点">
  </el-date-picker>
</template>
<script>
export default {
  name: "TimeArrCompare",
  components: {},
  props: {
    modelValue:{
      require: true,
      type: Object
    }
  }
}
</script>
