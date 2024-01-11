<template>
  <div class="m-form-item">
    <div class="m-form-item_title">
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
      if (this.label.includes('安全措施')) {
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
      if (!error) {
      }
      if (call) {
        call(!error);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.m-form-item {
  position: relative;
  padding: 10px 10px 20px 10px;
  background: white;
  //margin-top:5px;
  margin-bottom: 10px;

  & > div:first-child {
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: #545456;
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
