<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="default" v-model="modelValue.placeholder" placeholder="请设置提示语" />
    </el-form-item>
    <el-form-item label="valueKey">
      <el-select size="default" v-model="modelValue.valueKey" placeholder="请设置对应valueKey值" clearable filterable>
        <el-option v-for="item in certValueKeys" :key="item.dictValue" :label="item.dictKey" :value="item.dictValue"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="扫码录入">
      <el-switch v-model="modelValue.enableScan"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TextInput',
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
  computed: {
    certValueKeys() {
      return this.$store.state.certValueKeys
    }
  },
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
