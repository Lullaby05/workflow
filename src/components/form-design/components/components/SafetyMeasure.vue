<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-table
        :cell-style="cellStyle"
        :header-cell-style="tbCellStyle"
        :border="showBorder"
        :data="_value.tableData"
        style="width: 100%"
      >
        <el-table-column
          fixed
          type="index"
          label="序号"
          width="55"
        ></el-table-column>
        <el-table-column
          label="安全措施"
          props="safetyMeasure"
        ></el-table-column>
        <el-table-column
          label="是否涉及"
          props="isRelated"
        >
          <template #default="scope">
            <el-radio-group>
              <el-radio
                label="是"
                value="是"
                size="large"
              ></el-radio>
              <el-radio
                label="否"
                value="否"
                size="large"
              ></el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column
          label="确认人"
          props="confirmPerson"
        >
          <form-design-render :config="signPanalConfig" />
        </el-table-column>
      </el-table>
    </div>
    <div v-else-if="mode === 'MOBILE'">
      <cell-group
        inset
        class="cell-group"
      >
        <div
          style="background: #f7f8fa"
          :name="i"
          v-for="(row, i) in _value.tableData"
          :key="i"
          class="cell-list"
        >
          <div
            style="
              background: white;
              display: flex;
              padding: 10px;
              font-size: 1rem;
              line-height: 2;
            "
          >
            <div style="height: 20px">{{ i + 1 }}. &nbsp;</div>

            <form-design-render
              v-if="index !== _columns.length - 1"
              :index="i + 1"
              :formData="row['securityMeasure']"
              :readonly="safeConfig['securityMeasure'].readonly"
              v-model="row['securityMeasure']"
              :mode="mode"
              :config="safeConfig['securityMeasure']"
            />
          </div>
          <form-item
            :model="row"
            :rule="rules['isRelated']"
            :ref="`isRelated_${i}`"
            prop="isRelated"
            label="是否涉及"
            :key="'column_' + 2"
          >
            <form-design-render
              :index="i + 1"
              :formData="row['isRelated']"
              :readonly="safeConfig['isRelated'].readonly"
              v-model="row['isRelated']"
              :mode="mode"
              :config="safeConfig['isRelated']"
            />
          </form-item>
          <form-item
            :model="row"
            :rule="rules['confirmPerson']"
            :ref="`confirmPerson_${i}`"
            prop="confirmPerson"
            label="确认人"
            :key="'column_' + 3"
          >
            <Field
              v-model="row['confirmPerson']"
              is-link
              readonly
              label=""
              placeholder="请选择确认人"
              @click="openPopup(i)"
              input-align="right"
              size="16"
            />
            <Popup
              v-model:show="showPicker[i]"
              position="bottom"
            >
              <Picker
                :columns="userListOptions"
                :columns-field-names="{ text: 'name', value: 'name' }"
                @cancel="showPicker[i] = false"
                @confirm="(val) => onConfirm(val, row, i)"
              />
            </Popup>
          </form-item>
        </div>
      </cell-group>
      <div class="m-form-item_title">
        <span>其他安全措施:</span>
      </div>
      <div v-if="_value.otherSafetyMeasure.length > 0">
        <div
          class="form_item"
          :name="`7000${i + 1}`"
          :key="`7000${i + 1}`"
          v-for="(row, i) in _value.otherSafetyMeasure"
        >
          <div class="other_from padding-t-10">
            <div class="other_title flex">
              <span>其他安全措施</span>
              <icon
                name="cross"
                @click.stop="delOther(i)"
                v-if="!otherReadonly"
              />
            </div>
            <div class="other_content">
              <Field
                v-model="row.otherMeasure"
                label=""
                size="16"
                placeholder="请输入其他安全措施"
                :readonly="otherReadonly"
              />
            </div>
          </div>
          <div class="other_from flex">
            <div class="other_title">编制人</div>
            <div class="other_content">
              <Field
                v-model="row.organizer"
                label=""
                size="16"
                placeholder="请输入编制人"
                :readonly="otherReadonly"
                input-align="right"
              />
            </div>
          </div>
          <div class="other_from flex">
            <div class="other_title">确认人</div>
            <div class="other_content">
              <Field
                v-model="row.confirmPerson"
                label=""
                size="16"
                placeholder="请输入确认人"
                :readonly="otherReadonly"
                input-align="right"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="m-tb-empty"
        v-if="!otherReadonly"
      >
        <Button
          type="primary"
          size="small"
          @click="addSafetyMeasure"
          >添加其他安全措施</Button
        >
      </div>
    </div>
    <template v-else>
      <template v-if="rowLayout">
        <el-table
          :cell-style="cellStyle"
          :header-cell-style="tbCellStyle"
          :border="showBorder"
          :data="_value.tableData"
          style="width: 100%"
          class="safety-measure-table"
        >
          <el-table-column
            fixed
            type="index"
            label="序号"
            width="55"
          ></el-table-column>
          <el-table-column
            label="安全措施"
            props="safetyMeasure"
          >
            <template #default="scope">
              {{ scope.row.securityMeasure }}
            </template>
          </el-table-column>
          <el-table-column
            label="是否涉及"
            props="isRelated"
            width="130"
          >
            <template #default="scope">
              <el-radio-group
                v-if="!readonly"
                v-model="scope.row.isRelated"
              >
                <el-radio
                  size="large"
                  value="是"
                  label="是"
                ></el-radio>
                <el-radio
                  size="large"
                  value="否"
                  label="否"
                ></el-radio>
              </el-radio-group>
              <span v-else>{{ scope.row.isRelated }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="确认人"
            props="confirmPerson"
            width="200"
          >
            <template #default="scope">
              <el-select
                v-if="!readonly"
                class="confirm-person"
                v-model="scope.row.confirmPerson"
                placeholder="请选择确认人"
                filterable
                clearable
              >
                <el-option
                  v-for="item in userListOptions"
                  :key="item.id"
                  :label="item.id + '_' + item.name"
                  :value="item.name"
                ></el-option>
              </el-select>
              <span v-else>{{ scope.row.confirmPerson }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          size="default"
          icon="el-icon-plus"
          style="display: block; margin: 12px 0"
          type="primary"
          @click="addSafetyMeasure"
          v-if="!readonly"
          >{{ '添加其他安全措施' }}</el-button
        >
        <div
          class="otherSafetyMeasure"
          v-for="(item, index) in _value.otherSafetyMeasure"
          :key="index"
        >
          <el-form
            :model="item"
            inline
          >
            <el-form-item field="otherMeasure">
              <el-input
                v-model="item.otherMeasure"
                clearable
                placeholder="请输入其他安全措施"
              ></el-input>
            </el-form-item>
            <el-form-item field="organizer">
              <el-input
                v-model="item.organizer"
                clearable
                placeholder="请输入编制人"
              ></el-input>
            </el-form-item>
            <el-form-item field="confirmPerson">
              <el-input
                v-model="item.confirmPerson"
                clearable
                placeholder="请输入确认人"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template v-else>
        <el-form
          :rules="rules"
          :model="row"
          :ref="`table-form-${i}`"
          class="table-column"
          v-for="(row, i) in _value"
          :key="i"
        >
          <div class="table-column-action">
            <span>第 {{ i + 1 }} 项</span>
          </div>
          <el-form-item
            v-for="(column, index) in _columns"
            :key="'column_' + index"
            :prop="column.id"
            :label="column.title"
          >
            <form-design-render
              :index="index + 1"
              :formData="formData"
              :readonly="isReadonly(column)"
              v-model="row[column.id]"
              :mode="mode"
              :config="column"
            />
          </el-form-item>
        </el-form>
      </template>
    </template>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { ValueType } from '../ComponentsConfigExport';
import {
  Collapse,
  CollapseItem,
  Dialog,
  showFailToast,
  Field,
  Picker,
  Popup,
  showConfirmDialog,
  Cell,
  CellGroup,
  Icon,
  Button,
} from 'vant';
import FormItem from '@/components/common/FormItem.vue';
import FormDesignRender from '@/components/form-design/design/FormDesignRender.vue';
import componentMinxins from '../ComponentMinxins';
import signPanal from './SignPanel.vue';
import userPicker from './UserPicker.vue';
import {
  getSafetyMeasureSmiple,
  getUserList,
} from '@/api/operation/safetyMeasure';
import { useSafetyCertificationStore } from '../../../../storeWX';

export default {
  name: 'SafetyMeasure',
  components: {
    draggable,
    FormItem,
    Collapse,
    CollapseItem,
    FormDesignRender,
    signPanal,
    Field,
    Popup,
    Picker,
    Cell,
    CellGroup,
    Icon,
    Button,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {
          tableData: [],
          otherSafetyMeasure: [],
        };
      },
    },
    placeholder: {
      type: String,
      default: '添加数据',
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    showBorder: {
      type: Boolean,
      default: true,
    },
    showSummary: {
      type: Boolean,
      default: false,
    },
    maxSize: {
      type: Number,
      default: 0,
    },
    rowLayout: {
      type: Boolean,
      default: true,
    },
    formData: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: String,
      default: 'DESIGN',
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    // 判断两个表格的值是否为空，为空则加载目前作业证的安全措施
    if (
      this.modelValue.tableData.length === 0 &&
      this.modelValue.otherSafetyMeasure.length === 0
    ) {
      this.loadSecurityMeasure();
    } else {
      this._value = this.modelValue;
    }
    this.showPicker = new Array(this.modelValue.tableData.length).fill(false);
    // 获取所有人员列表
    getUserList().then((res) => {
      this.userListOptions = res.data;
    });
    console.log('_columns:', this._columns);
  },
  computed: {
    rules() {
      const rules = {};
      if (this.required) {
        rules.isRelated = [
          { required: true, message: '请选择是否涉及', trigger: 'change' },
        ];
        rules.confirmPerson = [
          { required: true, message: '请完成签名', trigger: 'change' },
        ];
      }
      return rules;
    },
    _columns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.$emit('update:columns', val);
      },
    },
    selectFormItem: {
      get() {
        return this.$store.state.selectFormItem;
      },
      set(val) {
        this.$store.state.selectFormItem = val;
      },
    },
  },
  data() {
    return {
      ValueType,
      actives: [],
      otherActives: [],
      tbCellStyle: {
        background: '#e8e8e8',
        padding: '10px 0',
      },
      cellStyle: {
        padding: '0',
        height: '40px',
      },
      showPicker: [],
      userListOptions: [],
      userPickerConfig: {
        icon: 'el-icon-avatar',
        name: 'UserPicker',
        title: '人员选择',
        props: {
          enablePrint: true,
          expansion: false,
          multiple: false,
          options: [],
          required: false,
          valueKey: '',
        },
        value: [],
        valueType: 'User',
      },
      safeConfig: {
        number: {
          valueType: 'String',
          icon: 'el-icon-edit',
          name: 'TextInput',
          title: '序号',
          value: '',
          props: {
            enableScan: false,
            enablePrint: true,
            required: true,
          },
          readonly: true,
        },
        securityMeasure: {
          valueType: 'String',
          icon: 'el-icon-edit',
          name: 'TextInput',
          title: '安全措施',
          value: '',
          props: {
            enableScan: false,
            enablePrint: true,
            required: true,
          },
          readonly: true,
        },
        isRelated: {
          valueType: 'String',
          icon: 'el-icon-circlecheck',
          name: 'SelectInput',
          title: '是否涉及',
          value: '',
          props: {
            expanding: false,
            options: ['是', '否'],
            enablePrint: true,
            required: true,
            isNeedApi: false,
          },
          readonly: this.readonly,
        },
        confirmPerson: {
          valueType: 'User',
          icon: 'el-icon-avatar',
          name: 'UserPicker',
          title: '确认人',
          value: [],
          props: {
            options: [],
            multiple: false,
            enablePrint: true,
            placeholder: '',
            required: true,
            expansion: false,
          },
          readonly: this.readonly,
        },
      },
      signPanalConfig: {
        icon: 'el-icon-edit',
        name: 'SignPanel',
        props: {
          color: '#000000',
          enablePrint: true,
          required: false,
          thickness: 2,
        },
        title: '签名',
        value: '',
        valueType: 'String',
      },
      _value: {
        tableData: [],
        otherSafetyMeasure: [],
      },
      otherReadonly: false,
    };
  },
  watch: {
    _value: {
      deep: true,
      handler(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  methods: {
    async loadSecurityMeasure() {
      const store = useSafetyCertificationStore();
      if (!store.currentOperationType) return;
      const { data } = await getSafetyMeasureSmiple(store.currentOperationType);
      this._value.tableData = data.map((ele, index) => {
        return {
          number: index + 1,
          securityMeasure: ele.securityMeasure,
          isRelated: '',
          confirmPerson: [],
        };
      });
      this.actives = this._value.tableData.map((item, index) => index);
      this._value.otherSafetyMeasure = [];
      if (this._value.otherSafetyMeasure.length > 0) {
        this.otherReadonly = true;
      } else {
        this.otherActives = this._value.otherSafetyMeasure.map(
          (item, index) => '7000' + (index + 1)
        );
      }
      console.log('安全措施:', this._value.tableData);
      console.log('其他安全措施:', this._columns);
    },
    isReadonly(item) {
      return item.perm === 'R';
    },
    showError(col, val) {
      if (col.props.required) {
        switch (col.valueType) {
          case ValueType.dept:
          case ValueType.user:
          case ValueType.dateRange:
          case ValueType.array:
            return !(Array.isArray(val) && val.length > 0);
          default:
            return !this.$isNotEmpty(val);
        }
      }
      return false;
    },
    addSafetyMeasure() {
      this._value.otherSafetyMeasure.push({
        otherMeasure: '',
        organizer: '',
        confirmPerson: [],
      });
      this.otherActives.push('7000' + this._value.otherSafetyMeasure.length);
      console.log('其他安全措施:', this.otherActives);
    },
    delOther(i) {
      showConfirmDialog({
        title: '提示',
        message: '您确定要删除该行数据吗？',
      }).then(() => {
        this._value.otherSafetyMeasure.splice(i, 1);
      });
    },
    openPopup(i) {
      this.showPicker[i] = true;
    },
    onConfirm(val, row, i) {
      row.confirmPerson = val.selectedValues[0];
      this.showPicker[i] = false;
    },
    validate(call) {
      if (this.mode === 'PC') {
        if (this.rowLayout) {
          let result = true;
          for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].props.required) {
              for (let j = 0; j < this._value.tableData.length; j++) {
                result = !this.showError(
                  this.columns[i],
                  this._value.tableData[j][this.columns[i].id]
                );
                if (!result) {
                  call(false);
                  return;
                }
              }
            }
          }
          call(result);
        } else {
          let success = 0;
          this._value.tableData.forEach((v, i) => {
            let formRef = this.$refs[`table-form-${i}`];
            if (formRef && Array.isArray(formRef) && formRef.length > 0) {
              formRef[0].validate((valid) => {
                if (valid) {
                  success++;
                }
              });
            }
          });
          setTimeout(() => call(success === this._value.tableData.length), 500);
        }
      } else {
        let success = true;
        this._value.forEach((row, i) => {
          this._columns.forEach((col) => {
            let tbColRef = this.$refs[`${col.id}_${i}`];
            if (tbColRef && Array.isArray(tbColRef) && tbColRef.length > 0) {
              tbColRef[0].validate((valid) => {
                if (!valid) {
                  success = false;
                }
              });
            }
          });
        });
        call(success);
      }
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style lang="less" scoped>
.title-required {
  color: @theme-danger;
}
.otherSafetyMeasure .el-form .el-input {
  width: 256px;
}

.m-valid-error {
  margin-left: 10px;
  font-size: 1rem;
  color: @theme-danger;
}

.readonly {
  padding: 5px 0;
}

:deep(.m-form-item .valid-error) {
  border-bottom: none;
}

.del-row {
  float: right;
  margin-right: 20px;
  font-size: 1rem;
  color: #d43030;
}

:deep(.valid-error) {
  border-bottom: 2px dashed @theme-danger;
}

.choose {
  border: 1px dashed @theme-primary !important;
}

:deep(.el-table__row) {
  .el-input.is-focus .el-input__wrapper {
    box-shadow: none;
  }

  .cell {
    .el-input__wrapper,
    .el-input__inner,
    .el-textarea__inner {
      border-radius: 0;
      border: none;
      padding-left: 0;
      box-shadow: none;
    }

    .el-input__prefix {
      display: none;
    }
  }
}

.table-column {
  padding: 5px;
  margin-bottom: 10px;
  border-left: 3px solid @theme-primary;
  border-radius: 5px;
  background: #fafafa;

  :deep(.el-form-item) {
    margin-bottom: 20px;

    .el-form-item__label {
      height: 25px;
    }
  }

  .table-column-action {
    float: right;

    span {
      color: #afafaf;
      margin-right: 10px;
      font-size: 13px;
    }

    .icon {
      color: #afafaf;
      padding: 5px;
      font-size: large;
      cursor: pointer;

      &:hover {
        color: #666666;
      }
    }
  }
}

.l-drag-from {
  min-height: 50px;
  background-color: rgb(245, 246, 246);

  .l-form-item,
  li {
    cursor: grab;
    background: #ffffff;
    padding: 10px;
    border: 1px solid #ebecee;
    margin: 5px 0;
  }
}

.m-add-row {
  color: @theme-primary;
  padding-top: 10px;
  text-align: center;
  cursor: pointer;
}

:deep(.van-collapse-item__content) {
  padding: 0;
  background: #f7f8fa;
}

.m-tb-empty {
  font-size: 14px;
  padding: 10px;
  text-align: right;
  --van-button-primary-background: #165dff;
  --van-button-small-padding: 6px 10px;
  --van-button-small-height: 24px;
  button {
    border-radius: 197px;
  }
}

.l-form-header {
  font-size: small;
  color: #818181;
  text-align: left;
  position: relative;
  background-color: #fff;

  p {
    position: relative;
    margin: 0 0 10px 0;

    span {
      position: absolute;
      left: -8px;
      top: 3px;
      color: rgb(217, 0, 19);
    }
  }

  .l-option {
    position: absolute;
    top: -10px;
    right: -10px;

    .icon {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;

      &:hover {
        color: @theme-primary;
      }
    }
  }
}
.confirm-person {
  :deep(.el-input) {
    width: 156px !important;
    .el-input__inner {
      padding: 0 10px;
    }
  }
}
.m-form-item_title {
  padding: 10px;
  font-size: 1.2rem;
}
.other_from {
  position: relative;
  padding: 0px 10px 0px 10px;
  background: white;

  .other_title {
    margin-bottom: 0px;
    font-size: 1rem;
    color: #545456;
  }
  .other_content {
  }
}
.form_item {
  margin-bottom: 10px;
}
.padding-t-10 {
  padding-top: 10px;
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.van-cell-group) {
  background: #ffffff00;
}
:deep(.cell-list) {
  margin-bottom: 10px;
}
.cell-group {
  :deep(.m-form-item) {
    margin-bottom: 0px;
    background: white !important;
    padding: 0px 10px 10px 10px;
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    .m-form-item_title {
      font-size: 1rem;
      margin-bottom: 0px;
      display: flex;
      align-items: center;
    }
  }
}
:deep(.van-radio-group) {
  > .van-radio--horizontal:first-child {
    margin-right: 15px !important;
  }
}
:deep(.van-radio__icon) {
  height: 0.8em;
}
:deep(.van-radio__icon .van-icon) {
  width: 0.8em;
  height: 0.8em;
}
:deep(.van-cell-group--inset) {
  margin: 0;
}
:deep(.van-cell:after) {
  border-bottom: none;
}
:deep(.van-radio__icon--checked .van-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff00;
}
</style>
