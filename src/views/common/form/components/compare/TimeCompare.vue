<template>
  <el-date-picker
      v-if="modelValue.compare === 'IN' || modelValue.compare === 'NIN'"
      v-model="modelValue.compareVal"
      type="datetimerange"
      placeholder="选择比较时间区间">
  </el-date-picker>
  <el-date-picker v-else v-model="modelValue.compareVal[0]" type="datetime" placeholder="选择比较时间点">
  </el-date-picker>
</template>
<script>
export default {
  name: "TimeCompare",
  components: {},
  props: {
    modelValue:{
      require: true,
      type: Object
    }
  }
}
</script>
