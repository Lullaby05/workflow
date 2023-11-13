<template>
  <span v-if="modelValue.compare === 'IN_EQ' || modelValue.compare === 'IN_NEQ'">
    <el-input-number controls-position="right" v-model="modelValue.compareVal[0]"/>
    <span style="margin: 5px"> ~ </span>
    <el-input-number controls-position="right" v-model="modelValue.compareVal[1]"/>
  </span>
  <el-select v-else-if="modelValue.compare === 'IN' || modelValue.compare === 'NIN'"
             multiple default-first-option
             style="width: calc(100% - 410px);"
             allow-create filterable v-model="modelValue.compareVal"
             placeholder="输入可能的值"></el-select>
  <el-input-number v-else controls-position="right" v-model="modelValue.compareVal[0]"/>
</template>
<script>
export default {
  name: "NumCompare",
  props: {
    modelValue:{
      require: true,
      type: Object
    }
  },
}
</script>
