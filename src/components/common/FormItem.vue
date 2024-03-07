<template>
  <div
    :class="{
      'm-form-item': true,
      safe: label == '安全措施：',
    }"
  >
    <div
      class="m-form-item_title"
      :class="{ tableTitle: item.name === 'TableList' }"
      v-if="label != '安全措施：'"
    >
      <span
        class="title-required"
        v-if="required || rule.length > 0"
        >*
      </span>
      <span>{{ label }}</span>
    </div>
    <div class="m-form-item_content">
      <slot ref="item"></slot>
    </div>
    <div
      v-if="showError && rule.length > 0"
      class="valid-error"
    >
      {{ rule[0].message || '请完善' }}
    </div>
  </div>
</template>

<script>
import { showToast } from 'vant';
export default {
  name: 'FormItem',
  components: {},
  props: {
    label: {
      type: String,
      default: '',
    },
    rule: {
      type: Array,
      default: () => {
        return [];
      },
    },
    prop: {
      type: String,
      default: '',
    },
    model: {
      type: Object,
      default: () => {
        return {};
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      showError: false,
    };
  },
  methods: {
    isError() {
      return this.showError;
    },
    validate(call) {
      if (this.rule.length > 0) {
        if (this.rule[0].type === 'array') {
          this.showError = !(
            Array.isArray(this.model[this.prop]) &&
            this.model[this.prop].length > 0
          );
        } else {
          this.showError = !this.$isNotEmpty(this.model[this.prop]);
        }
      }
      if (!this.showError) {
      }
      if (call) {
        call(!this.showError);
      }
    },
    validate_m(call) {
      let error = false;
      if (this.rule.length > 0) {
        if (this.rule[0].type === 'array') {
          error = !(
            Array.isArray(this.model[this.prop]) &&
            this.model[this.prop].length > 0
          );
        } else {
          error = !this.$isNotEmpty(this.model[this.prop]);
        }
      }
      // 受限空间开始和结束时间校验
      if (
        this.prop === 'field3185314173423' ||
        this.prop === 'field8567214170140'
      ) {
        const startTime = this.model['field3185314173423'];
        const endTime = this.model['field8567214170140'];
        if (+new Date(endTime) - +new Date(startTime) > 24 * 60 * 60 * 1000) {
          showToast({
            message: `受限空间作业时间不能超过24小时`,
          });
          throw new Error('校验失败');
        }
        if (+new Date(endTime) - +new Date(startTime) <= 0) {
          showToast({
            message: `作业结束时间不能小于等于作业开始时间`,
          });
          throw new Error('校验失败');
        }
      }
      // 动火作业开始和结束时间校验
      if (
        this.prop === 'field7961019363200' ||
        this.prop === 'field6888319366698'
      ) {
        const fireLevel = this.model['field4514019247425'];
        const startTime = this.model['field6888319366698'];
        const endTime = this.model['field7961019363200'];
        if (['1', '2'].includes(fireLevel)) {
          if (+new Date(endTime) - +new Date(startTime) > 8 * 60 * 60 * 1000) {
            showToast({
              message: `当前作业级别下，作业时间不得超过8小时`,
            });
            throw new Error('校验失败');
          }
        } else if (fireLevel === '3') {
          if (+new Date(endTime) - +new Date(startTime) > 72 * 60 * 60 * 1000) {
            showToast({
              message: '当前作业级别下，作业时间不得超过72小时',
            });
            throw new Error('校验失败');
          }
        }
        if (+new Date(endTime) - +new Date(startTime) <= 0) {
          showToast({
            message: '作业结束时间不能小于等于作业开始时间',
          });
          throw new Error('校验失败');
        }
      }
      if (this.item.name === 'SafetyMeasure') {
        for (let i = 0; i < this.model[this.prop].tableData.length; i++) {
          const item = this.model[this.prop].tableData[i];
          if (!item.isRelated) {
            showToast({
              message: '是否涉及不能为空',
            });
            throw new Error('校验失败');
          } else if (!item.confirmPerson) {
            showToast({
              message: '确认人不能为空',
            });
            throw new Error('校验失败');
          }
        }
      }
      if (this.item.name === 'MultilevelLink') {
        const value = this.model[this.prop];
        if (!value) return;
        this.model[this.prop] = value.filter((obj) => {
          // 检查对象的所有属性值是否都不为空
          return Object.values(obj).every(
            (value) => value !== null && value !== undefined && value !== ''
          );
        });
        if (!this.model[this.prop].length) {
          this.model[this.prop] = [{}];
        }
      }

      if (!error) {
      }
      if (call) {
        call(!error);
      }
    },
  },
  //挂载
  mounted() {
    console.log('组件名称', this.label);
  },
};
</script>

<style lang="less" scoped>
.safe {
  padding: 0px !important;
  background: #ffffff00 !important;
}
.m-form-item {
  position: relative;
  padding: 10px 10px 20px 10px;
  background: white;
  //margin-top:5px;
  margin-bottom: 10px;

  & > div:first-child {
    font-weight: 400;
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: #333333;
  }
  .tableTitle {
    font-weight: 500;
    font-family: '思源黑体 Medium';
  }

  & > div:last-child {
    //padding: 0 5px;
  }

  .title-required {
    color: @theme-danger;
  }

  .valid-error {
    color: @theme-danger;
    position: absolute;
    font-size: 0.85rem;
  }
}
</style>
