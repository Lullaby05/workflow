<template>
  <div>
    <el-form-item label="提示文字">
      <el-input
        size="default"
        v-model="modelValue.placeholder"
        placeholder="请设置提示语"
      />
    </el-form-item>
    <el-form label-position="top">
      <el-form-item label="选项设置" class="options">
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
                v-model="modelValue.options[index]"
                placeholder="请设置选项值"
                clearable
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
      <el-switch v-model="modelValue.expanding"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
  import draggable from 'vuedraggable';

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
      };
    },
    methods: {},
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
