<template>
  <div>
    <el-form-item label="提示文字">
      <el-input
        size="default"
        v-model="modelValue.placeholder"
        placeholder="请设置提示语"
      />
    </el-form-item>
    <el-form-item label="valueKey">
      <el-select
        size="default"
        v-model="modelValue.valueKey"
        placeholder="请设置对应valueKey值"
        clearable
        filterable
      >
        <el-option
          v-for="item in certValueKeys"
          :key="item.dictValue"
          :label="item.dictKey"
          :value="item.dictValue"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form label-position="top">
      <el-form-item
        label="选项设置"
        class="options"
      >
        <template #label>
          <div class="option-item-label">
            <span>选项设置</span>
            <el-button
              icon="el-icon-plus"
              link
              size="small"
              @click="modelValue.options.push('新选项')"
              >新增选项</el-button
            >
          </div>
        </template>
        <draggable
          item-key="id"
          v-model="modelValue.options"
          :component-data="{ tag: 'div', type: 'transition-group' }"
          handler=".el-icon-rank"
          v-bind="dragOption"
        >
          <template #item="{ element, index }">
            <div class="option-item">
              <icon name="el-icon-rank"></icon>
              <el-input
                v-if="modelValue.isNeedApi"
                v-model="modelValue.options[index].label"
                placeholder="请设置选项名称"
                clearable
                :disabled="modelValue.isNeedApi"
              >
                <template #append>
                  <el-button
                    icon="el-icon-delete"
                    type="danger"
                    @click="modelValue.options.splice(index, 1)"
                  ></el-button>
                </template>
              </el-input>
              <el-input
                v-else
                v-model="modelValue.options[index]"
                placeholder="请设置选项值"
                clearable
                :disabled="modelValue.isNeedApi"
              >
                <template #append>
                  <el-button
                    icon="el-icon-delete"
                    type="danger"
                    @click="modelValue.options.splice(index, 1)"
                  ></el-button>
                </template>
              </el-input>
            </div>
          </template>
        </draggable>
      </el-form-item>
    </el-form>
    <el-form-item label="选项展开">
      <el-switch
        v-model="modelValue.expanding"
        :disabled="modelValue.isNeedApi"
      ></el-switch>
    </el-form-item>
    <el-form-item label="获取列表">
      <el-switch v-model="modelValue.isNeedApi"></el-switch>
    </el-form-item>
    <el-form-item
      label="接口类型"
      v-if="modelValue.isNeedApi"
      :required="modelValue.isNeedApi"
    >
      <el-select
        v-model="modelValue.apiType"
        clearable
        filterable
      >
        <el-option
          v-for="item in interfaceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import multilevelLinkApi from '@/api/multilevelLink';

export default {
  name: 'SelectInputConfig',
  components: { draggable },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      dragOption: {
        animation: 300,
        sort: true,
        group: 'option',
      },
      interfaceOptions: [],
    };
  },
  computed: {
    certValueKeys() {
      return this.$store.state.certValueKeys;
    },
  },
  watch: {
    'modelValue.isNeedApi': {
      handler(val) {
        if (val) {
          this.initInterfaceOptions();
          this.modelValue.expanding = false;
        } else {
          this.interfaceOptions = [];
          this.modelValue.options = ['选项1', '选项2'];
          this.modelValue.apiType = '';
        }
      },
      immediate: true,
    },
    'modelValue.apiType': {
      handler(val) {
        if (!val) return;
        const requestUrl = this.interfaceOptions.find(
          (item) => item.value === val
        ).url;
        multilevelLinkApi.getRemoteOptions(requestUrl).then((res) => {
          let dataArr = res.data.data;
          // 后台返回值可能是Map，需要转换成数组
          if (Object.prototype.toString.call(dataArr) === '[object Object]') {
            this.modelValue.options = Object.keys(dataArr).map((key) => ({
              label: dataArr[key],
              value: key,
            }));
          } else {
            this.modelValue.options = dataArr.map((item) => ({
              label: item.name,
              value: item.id,
            }));
          }
        });
        this.modelValue.requestUrl = requestUrl;
      },
    },
  },
  methods: {
    initInterfaceOptions() {
      multilevelLinkApi.getAllDropDownOptions().then((res) => {
        this.interfaceOptions = res.data.data;
      });
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style lang="less" scoped>
:deep(.options) {
  .el-form-item__label {
    display: block;
    width: 100%;
    text-align: left;
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
