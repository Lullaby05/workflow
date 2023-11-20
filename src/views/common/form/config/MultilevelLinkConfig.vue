<template>
  <div>
    <el-form label-width="90px">
      <el-form-item label="选项设置" class="options">
        <el-select v-model="modelValue.optionsKey" placeholder="请选择联动类型" clearable>
          <el-option value="1" label="省-市-区"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import multilevelLinkApi from '@/api/multilevelLink';
export default {
  name: 'MultilevelLinkConfig',
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  watch: {
    'modelValue.optionsKey'(val) {
      if (!val) return;
      const current = this.allOptions.find((item) => item.key === val);
      multilevelLinkApi.getMultilevelLink(current.apis[0], '').then((res) => {
        current.options = new Array(current.columns).fill(0).map(() => []);
        current.options[0] = res.data.map((ele) => ({
          key: ele.name,
          value: ele.id,
        }));
        this.$emit('update:modelValue', { ...this.modelValue, currentOptions: current });
      });
    },
  },
  data() {
    return {
      allOptions: [
        {
          key: '1',
          apis: ['oa/org/province', 'oa/org/city?param=', 'oa/org/county?param='],
          columns: 3,
          fields: ['province', 'city', 'county'],
          placeholder: ['省', '市', '区'],
          options: [],
        },
      ],
    };
  },
  methods: {
    getAllOptions() { },
  },
  emits: ['update:modelValue', 'update:currentOptions'],
};
</script>

<style lang="less" scoped>
:deep(.options) {
  .el-form-item__label {
    display: block;
    width: 100%;
    text-align: right;
  }

  .el-icon-rank {
    padding-right: 5px;
    cursor: move;
  }
}

.option-item {
  display: flex;
  align-items: center;
  padding-bottom: 5px;

  :deep(.el-input) {
    width: 250px;
    float: right;
  }
}

.option-item-label {
  display: flex;
  justify-content: space-between;

  button {
    float: right;
  }
}
</style>
