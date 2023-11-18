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
    <el-form-item label="备选模式">
      <el-switch v-model="modelValue.expansion"></el-switch>
    </el-form-item>
    <el-form-item label="选项" v-if="modelValue.expansion">
      <el-button size="small" type="primary" icon="el-icon-plus" round @click="$refs.orgPicker.show()">添加</el-button>
      <org-items v-model="modelValue.options" />
    </el-form-item>
    <org-picker title="请选择部门备选项" multiple type="dept" ref="orgPicker" :selected="modelValue.options" @ok="selected" />
  </div>
</template>

<script>
import OrgItems from '@/views/common/process/OrgItems.vue'
import OrgPicker from '@/components/common/OrgPicker.vue'
import ConfigMinxins from "../ConfigMinxins";
export default {
  name: 'DeptPickerConfig',
  mixins: [ConfigMinxins],
  components: { OrgItems, OrgPicker },
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
