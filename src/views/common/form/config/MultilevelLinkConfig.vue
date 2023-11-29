<template>
  <div>
    <el-form label-width="90px">
      <el-form-item label="选项设置" class="options">
        <el-select v-model="modelValue.optionsKey" placeholder="请选择联动类型" clearable>
          <el-option v-for="item in allOptions" :value="item.key" :label="item.label" :key="item.key"></el-option>
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
        let data = res.data.data;
        // 后台返回值可能是Map，需要转换成数组
        if (Object.prototype.toString.call(data) === '[object Object]') {
          current.options[0] = Object.keys(data).map((key) => ({
            key: data[key],
            value: key,
          }));
        } else {
          current.options[0] = data.map((ele) => ({
            key: ele.name,
            value: ele.id,
          }));
        }
        this.$emit('update:modelValue', {
          ...this.modelValue,
          currentOptions: current,
        });
      });
    },
  },
  data() {
    return {
      allOptions: [],
    };
  },
  created() {
    this.getAllOptions();
  },
  methods: {
    getAllOptions() {
      multilevelLinkApi.getAllLevelLinkOptions().then((res) => {
        this.allOptions = res.data.data;
      });
    },
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
