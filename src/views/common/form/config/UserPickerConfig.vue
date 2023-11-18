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
    <el-form-item label="是否多选">
      <el-switch v-model="modelValue.multiple"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'UserPickerConfig',
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
  methods: {
    selected(select) {
      this.modelValue.options.length = 0
      select.forEach((val) => this.modelValue.options.push(val))
    },
  },
  computed: {
    certValueKeys() {
      return this.$store.state.certValueKeys
    }
  },
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
