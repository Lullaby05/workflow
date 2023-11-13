<template>
  <el-select v-if="modelValue.compare === 'IN' || modelValue.compare === 'NIN'"
             multiple default-first-option
             style="width: calc(100% - 410px);"
             allow-create filterable v-model="modelValue.compareVal"
             placeholder="输入可能的值"></el-select>
  <el-input v-else style="width: calc(100% - 410px);"
            v-model="modelValue.compareVal[0]" placeholder="输入比较值"></el-input>
</template>
<script>
export default {
  name: "StrCompare",
  props: {
    modelValue:{
      require: true,
      type: Object
    }
  },
}
</script>
