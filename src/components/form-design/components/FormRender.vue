<template>
  <!--渲染表单-->
  <el-form
    v-if="mode === 'PC'"
    ref="form"
    class="process-form"
    :rules="rules"
    :model="_value"
    :disabled="disabled"
    :label-width="225"
  >
    <div
      :class="{ readonly: isReadonly(item) }"
      v-show="showItem(item)"
      v-for="(item, index) in forms"
      :key="item.name + index"
    >
      <el-form-item
        v-if="
          item.name !== 'SpanLayout' &&
          item.name !== 'ModuleBlock' &&
          item.name !== 'Description'
        "
        :prop="item.id"
        :label="item.title + '：'"
      >
        <form-design-render
          :readonly="isReadonly(item)"
          :ref="item.id"
          v-model="_value[item.id]"
          :formData="_value"
          :mode="mode"
          :config="item"
        />
      </el-form-item>
      <form-design-render
        :ref="item.id"
        :readonly="isReadonly(item)"
        v-else
        v-model="_value"
        :formData="_value"
        :mode="mode"
        :config="item"
      />
    </div>
  </el-form>
  <div
    v-else
    class="process-form"
  >
    <div
      :class="{ readonly: isReadonly(item) }"
      v-show="showItem(item)"
      v-for="(item, index) in forms"
      :key="item.name + index"
    >
      <form-item
        v-if="
          item.name !== 'SpanLayout' &&
          item.name !== 'ModuleBlock' &&
          item.name !== 'Description'
        "
        :model="_value"
        :rule="rules[item.id]"
        :ref="item.id"
        :prop="item.id"
        :label="item.title + '：'"
      >
        <form-design-render
          :readonly="isReadonly(item)"
          :formData="_value"
          :ref="item.id + '_item'"
          v-model="_value[item.id]"
          :mode="mode"
          :config="item"
        />
      </form-item>
      <form-design-render
        :ref="item.id"
        :readonly="isReadonly(item)"
        :formData="_value"
        v-else
        v-model="_value"
        :mode="mode"
        :config="item"
      />
    </div>
  </div>
</template>

<script>
import { Field, Form } from 'vant';
import { CompareFuncs } from './components/compare/CompareOptions';
import FormItem from '@/components/common/FormItem.vue';
import FormDesignRender from '@/components/form-design/design/FormDesignRender.vue';
import { ValueType } from './ComponentsConfigExport';
import { useSafetyCertificationStore } from '../../../storeWX';
import { operationTypeEnum } from '@/views/operation/composition/useCertificateDict';
import { ElMessage } from 'element-plus';

const VForm = Form;
export default {
  name: 'FormRender',
  components: { FormItem, FormDesignRender, VForm, Field, ElMessage },
  props: {
    forms: {
      type: Array,
      default: () => {
        return [];
      },
    },
    config: {
      type: Object,
      default: () => {
        return {
          ruleType: 'SIMPLE',
          rules: [],
        };
      },
    },
    process: {
      type: Object,
      default: () => {
        return {};
      },
    },
    //当前节点，用来联动表单权限
    currentNode: {
      type: String,
      default: null,
    },
    modelValue: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mode: {
      type: String,
      default: 'PC',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formRules: {},
      //缓存下原始权限设置
      formPermHis: {},
      compareFunc: {},
      //缓存旧值
      oldFormData: {},
      //缓存所有用到的条件字段
      conditionFields: new Set(),
      execute: null,
      rules: {},
      operationLevelItemId: '',
      operationEndTimeItemId: '',
      operationBeginTimeItemId: '',
    };
  },
  computed: {
    _value: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    formItemMap() {
      const map = new Map();
      this.loadFormItemMap(this.forms, map);
      return map;
    },
  },
  created() {
    this.loadFormConfig(this.forms, this.rules);
  },
  methods: {
    showItem(item) {
      return (
        (!(this.isReadonly(item) && this.isBlank(this._value[item.id])) ||
          item.name === 'SpanLayout' ||
          item.name === 'ModuleBlock' ||
          item.name === 'TableList') &&
        item.perm !== 'H'
      );
    },
    isBlank(val) {
      return (
        !this.$isNotEmpty(val) ||
        (val instanceof String && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0)
      );
    },
    isReadonly(item) {
      return item.perm === 'R';
    },
    validate(call) {
      let success = true;
      console.log(this.rules);
      if (this.mode === 'PC') {
        return new Promise((resolve, reject) => {
          this.$refs.form.validate((valid) => {
            success = valid;
            if (valid) {
              resolve('校验成功');
              //校验成功再校验内部
              for (let i = 0; i < this.forms.length; i++) {
                if (this.forms[i].name === 'TableList') {
                  let formRef = this.$refs[this.forms[i].id];
                  if (formRef && Array.isArray(formRef) && formRef.length > 0) {
                    formRef[0].validate((subValid) => {
                      success = subValid;
                    });
                    if (!success) {
                      break;
                    }
                  }
                }
              }
            } else {
              reject('校验失败');
            }
            call && call(success);
          });
        });
      } else {
        const html = document.getElementsByTagName('html')[0];
        const height = html.clientHeight;
        this.forms.forEach((form) => {
          console.log('formItem', form);
          let formRef = this.$refs[form.id];

          if (formRef && Array.isArray(formRef) && formRef.length > 0) {
              formRef[0].validate_m((subValid) => {
                console.log('校验' + form.title, form.id, subValid);
                if (!subValid && this.showItem(form)) {
                  success = false;
                  ElMessage({
                    message: form.title + '不能为空',
                    icon: 'none',
                    // type: "success",
                    customClass: 'message-error',
                    duration: 1500,
                    offset: height / 2 - 120,
                  });
                  throw new Error('校验失败');
                }
              });

            if (form.name === 'TableList') {
              //扫描明细表项
              this.$refs[form.id + '_item'][0].validate_m((subValid) => {
                if (!subValid && this.showItem(form)) {
                  success = false;
                  ElMessage({
                    message: form.title + '不能为空',
                    icon: 'none',
                    // type: "success",
                    customClass: 'message-error',
                    duration: 1500,
                    offset: height / 2 - 120,
                  });
                  throw new Error('校验失败');
                }
              });
            }

          }
        });
        // call(success);
        return success;
      }
    },
    loadFormItemMap(forms, map) {
      forms.forEach((item) => {
        if (item.name === 'TableList') {
          map.set(item.id, item);
          this.loadFormItemMap(item.props.columns, map);
        } else if (item.name === 'SpanLayout' || item.name === 'ModuleBlock') {
          this.loadFormItemMap(item.props.items, map);
        } else {
          map.set(item.id, item);
        }
      });
    },
    loadFormConfig(forms, rules) {
      const store = useSafetyCertificationStore();
      forms.forEach((item) => {
        if (item.props.valueKey === 'operationLevel') {
          this.operationLevelItemId = item.id;
        }
        if (item.props.valueKey === 'operationEndTime') {
          this.operationEndTimeItemId = item.id;
        }
        if (item.props.valueKey === 'operationBeginTime') {
          this.operationBeginTimeItemId = item.id;
        }
        if (item.name === 'SpanLayout' || item.name === 'ModuleBlock') {
          this.loadFormConfig(item.props.items, this.rules);
        } else {
          this._value[item.id] = this.modelValue[item.id];
          if (
            item.props.required &&
            this.showItem(item) &&
            item.name !== 'SafetyMeasure' &&
            item.name !== 'TableList'
          ) {
            if (
              store.$state.currentOperationType === operationTypeEnum.FIRE &&
              (item.props.valueKey === 'operationBeginTime' ||
                item.props.valueKey === 'operationEndTime')
            ) {
              this.rules[item.id] = [
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    const startTime =
                      this._value[this.operationBeginTimeItemId];
                    const endTime = this._value[this.operationEndTimeItemId];
                    if (!value) {
                      callback(new Error(`请完成${item.title}`));
                    }
                    if (
                      ['1', '2'].includes(
                        this._value[this.operationLevelItemId]
                      )
                    ) {
                      if (
                        +new Date(endTime) - +new Date(startTime) >
                        8 * 60 * 60 * 1000
                      ) {
                        callback(
                          new Error(`当前作业级别下，作业时间不得超过8小时`)
                        );
                      }
                    } else if (this._value[this.operationLevelItemId] === '3') {
                      if (
                        +new Date(endTime) - +new Date(startTime) >
                        72 * 60 * 60 * 1000
                      ) {
                        callback(
                          new Error(`当前作业级别下，作业时间不得超过72小时`)
                        );
                      }
                    }
                    if (+new Date(endTime) - +new Date(startTime) <= 0) {
                      callback(
                        new Error(`作业结束时间不能小于等于作业开始时间`)
                      );
                    }
                    callback();
                  },
                  trigger: 'blur',
                },
              ];
            } else if (
              store.$state.currentOperationType ===
                operationTypeEnum.CONFINEDSPACE &&
              (item.props.valueKey === 'operationBeginTime' ||
                item.props.valueKey === 'operationEndTime')
            ) {
              this.rules[item.id] = [
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    const startTime =
                      this._value[this.operationBeginTimeItemId];
                    const endTime = this._value[this.operationEndTimeItemId];
                    if (!value) {
                      callback(new Error(`请完成${item.title}`));
                    }
                    if (
                      +new Date(endTime) - +new Date(startTime) >
                      24 * 60 * 60 * 1000
                    ) {
                      callback(new Error(`受限空间作业时间不能超过24小时`));
                    }
                    if (+new Date(endTime) - +new Date(startTime) <= 0) {
                      callback(
                        new Error(`作业结束时间不能小于等于作业开始时间`)
                      );
                    }
                    callback();
                  },
                  trigger: 'blur',
                },
              ];
            } else {
              this.rules[item.id] = [
                {
                  type: ValueType.getValidType(item.valueType),
                  required: this.showItem(item),
                  validator: (rule, value, callback) => {
                    if (this.showItem(item) && !value) {
                      callback(new Error(`请完成${item.title}`));
                    }
                    callback();
                  },
                  // message: `请完成${item.title}`,
                  trigger: 'blur',
                },
              ];
            }
          } else if (
            item.name === 'TableList' &&
            this.showItem(item) &&
            item.props.required
          ) {
            this.rules[item.id] = [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (!value || (value && value.length === 0)) {
                    callback(new Error(`请完成${item.title}`));
                    return;
                  }
                  const keys = Object.keys(value[0]);
                  const result = value.every((ele) => {
                    return keys.every((key) => {
                      return ele[key];
                    });
                  });
                  if (!result) {
                    callback(new Error(`请完成${item.title}`));
                  }
                  callback();
                },
                trigger: 'blur',
              },
            ];
          } else if (
            item.name === 'SafetyMeasure' &&
            this.showItem(item) &&
            item.props.required
          ) {
            this.rules[item.id] = [
              {
                required: true,
                validator: (rule, value, callback) => {
                  const result = value.tableData.every((ele) => {
                    return ele.confirmPerson && ele.isRelated;
                  });
                  if (!result) {
                    callback(new Error('请将安全措施填写完整'));
                  }
                  callback();
                },
                trigger: 'blur',
              },
            ];
          }
        }
      });
    },
    //解析表单联动规则
    parserRule(cdRule) {
      const condition = cdRule.condition;
      //在这里可以实现一个算法，按条件层级去解析，不需要解析所有条件，先不实现
      if (cdRule.children.length > 0) {
        for (let i = 0; i < cdRule.children.length; i++) {
          const result = this.parserRule(cdRule.children[i]);
          if (cdRule.logic) {
            //如果是且关系，有一个为假就是假
            if (!result) {
              return false;
            }
          } else {
            //如果是或关系，有一个为真就是真
            if (result) {
              return true;
            }
          }
        }
        //遍历完了返回最终结果
        return cdRule.logic;
      } else {
        //解析条件
        try {
          return this.compare(condition);
        } catch (e) {
          return false;
        }
      }
    },
    async doActions(actions) {
      (actions || []).forEach((action) => {
        //执行预设的动作
        switch (action.type) {
          case 'SHOW':
            action.targets.forEach((tg) => this.showField(tg));
            break;
          case 'HIDE':
            action.targets.forEach((tg) => this.hideField(tg));
            break;
          case 'DISABLE':
            action.targets.forEach((tg) => this.disableField(tg));
            break;
          case 'UPDATE':
            action.targets.forEach((tg) => this.updateField(tg, action.value));
            break;
          case 'ENABLE':
            action.targets.forEach((tg) => this.enableField(tg, action.value));
            break;
        }
      });
    },
    analyseFormRule() {
      if (this.config.ruleType === 'SIMPLE') {
        this.analyseRules();
      } else {
        this.analyseJsRules();
      }
    },
    async analyseJsRules() {
      if (!(this.execute instanceof Function)) {
        this.execute = new Function(
          'formData',
          'formMap',
          `${
            this.config.ruleJs || 'function doChange(){}'
          }\r\n doChange(formData, formMap);`
        );
      }
      this.execute(this._value, this.formItemMap);
    },
    async analyseRules() {
      (this.config.rules || []).forEach((rule, i) => {
        //解析表单联动条件
        const result = this.parserRule(rule.condition);
        console.log(`解析规则 ${i + 1}: ${result}`);
        this.doActions(result ? rule.action.with : rule.action.other);
      });
    },
    compare(condition) {
      //要判断组件类型，再取其值
      const source = this._value[condition.field];
      //动态调用函数
      let compareType = null;
      switch (condition.fieldType) {
        case 'AmountInput':
        case 'NumberInput':
        case 'Score':
        case 'CalcFormula':
          compareType = 'numCompare';
          break;
        case 'TextInput':
        case 'TextareaInput':
        case 'SelectInput':
        case 'Location':
        case 'Provinces':
          compareType = 'strCompare';
          break;
        case 'MultipleSelect':
          compareType = 'strArrCompare';
          break;
        case 'DateTime':
          compareType = 'timeCompare';
          break;
        case 'DateTimeRange':
          compareType = 'timeArrCompare';
          break;
        case 'DeptPicker':
        case 'UserPicker':
          compareType = 'orgCompare';
          break;
      }
      return CompareFuncs[compareType][condition.compare](
        source,
        condition.fixed
          ? condition.compareVal
          : this._value[condition.compareVal[0]]
      );
    },
    isRequired(item) {
      return this.rules[item.id] !== undefined;
    },
    hideField(id) {
      const field = this.formItemMap.get(id);
      if (field) {
        field.perm = 'H';
      }
    },
    showField(id) {
      const field = this.formItemMap.get(id);
      if (field) {
        field.perm = this.formPermHis[id] || 'E';
      }
    },
    disableField(id) {
      const field = this.formItemMap.get(id);
      if (field) {
        field.perm = 'R';
      }
    },
    enableField(id) {
      const field = this.formItemMap.get(id);
      if (field) {
        field.perm = 'E';
      }
    },
    updateField(id, val) {
      const field = this.formItemMap.get(id);
      if (field) {
        this._value[id] = val;
      }
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler() {
        if (this.config) {
          if (Object.keys(this.formPermHis).length === 0) {
            this.formItemMap.forEach((item) => {
              this.formPermHis[item.id] = item.perm;
            });
          }
          this.analyseFormRule();
        }
      },
    },
  },
  emits: ['update:modelValue'],
};
</script>
<style lang="less">
.el-picker-panel__body {
  .el-date-picker__header-label {
    line-height: 40px;
  }

  .el-date-picker__prev-btn,
  .el-date-picker__next-btn {
    line-height: 25px;
  }
}
.message-error {
  min-width: 120px;
  // height: 120px;
  border-radius: 5px;
  background-color: #4c4c4c;
  color: #dbdbdb;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  .el-message__content {
    font-size: 16px;
    margin-top: 0px;
  }
  .el-message__icon {
    font-size: 0px;
    margin-right: 0;
  }
}
</style>
<style lang="less" scoped>
.process-form {
  :deep(.el-form-item__label) {
    height: 40px;
    line-height: 40px;
    padding: 0 0;
    padding-right: 12px;
  }

  :deep(.el-form-item__content) {
    .el-input {
      width: 356px;
      min-height: 40px;
    }

    .el-textarea,
    .el-input-number {
      width: 356px;
    }
  }

  :deep(.el-col-8) {
    // 三列的时候特殊处理一下
    max-width: none;
    flex: 0 0 auto;

    .el-form-item > *:only-child {
      margin-left: 0px !important;
    }

    .el-input {
      width: 256px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 23px;
  }

  :deep(.van-cell) {
    padding: 10px 0;
    font-size: 1.2rem;
  }
}

:deep(.el-form-item__label) {
  margin-bottom: 0 !important;
}

:deep(.readonly .el-form-item__label) {
  white-space: nowrap;
}

:deep(.readonly) {
  font-size: 16px;

  .el-form-item {
    margin-bottom: 10px;

    .el-form-item__label::before {
      display: none;
    }

    .el-form-item__content {
      padding-left: 5px;
      line-height: 30px;
    }
  }

  .m-form-item {
    padding: 10px 5px;
    margin-bottom: 0;

    .m-form-item_title {
      font-size: 16px;

      .title-required {
        display: none;
      }
    }

    .m-form-item_content {
      padding-left: 4px;
    }
  }
}
</style>
