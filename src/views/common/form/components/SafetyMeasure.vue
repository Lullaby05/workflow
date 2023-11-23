<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-table
        :cell-style="cellStyle"
        :header-cell-style="tbCellStyle"
        :border="showBorder"
        :summary-method="getSummaries"
        :show-summary="showSummary"
        :data="_value"
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
            <el-radio-group v-model="_value[scope.$index].isRelated">
              <el-radio
                label="1"
                size="large"
                >是</el-radio
              >
              <el-radio
                label="0"
                size="large"
                >否</el-radio
              >
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
      <collapse v-model="actives">
        <div
          class="m-tb-empty"
          v-if="_value.length === 0"
        >
          点击下方 + 添加安全措施
        </div>
        <collapse-item
          :lazy-render="false"
          style="background: #f7f8fa"
          :name="i"
          v-for="(row, i) in _value"
          :key="i"
        >
          <template #title>
            <span>第 {{ i + 1 }} 项 </span>
            <span
              class="m-valid-error"
              v-show="isError(i)"
            >
              <icon name="el-icon-warning"></icon>
            </span>
            <span
              class="del-row"
              @click.stop="delRow(i, row)"
              v-if="!readonly"
              >删除</span
            >
          </template>
          <form-item
            :model="row"
            :rule="rules[column.id]"
            :ref="`${column.id}_${i}`"
            :prop="column.id"
            :label="column.title"
            v-for="(column, index) in _columns"
            :key="'column_' + index"
          >
            <form-design-render
              :index="i + 1"
              :formData="formData"
              :readonly="isReadonly(signPanalConfig)"
              v-model="scoped.row.confirmPerson"
              :mode="mode"
              :config="signPanalConfig"
            />
          </form-item>
        </collapse-item>
      </collapse>
      <div
        class="m-add-row"
        @click="addRow"
        v-if="!readonly"
      >
        <icon name="el-icon-plus"></icon>
        <span> {{ placeholder }}</span>
      </div>
    </div>
    <template v-else>
      <template v-if="rowLayout">
        <el-table
          :cell-style="cellStyle"
          :header-cell-style="tbCellStyle"
          :border="showBorder"
          :summary-method="getSummaries"
          :show-summary="showSummary"
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
          >
            <template #default="scope">
              {{ _value.tableData[scope.$index].securityMeasure }}
            </template>
          </el-table-column>
          <el-table-column
            label="是否涉及"
            props="isRelated"
          >
            <template #default="scope">
              <el-radio-group
                v-model="_value.tableData[scope.$index].isRelated"
              >
                <el-radio
                  size="large"
                  label="1"
                  >是</el-radio
                >
                <el-radio
                  size="large"
                  label="0"
                  >否</el-radio
                >
              </el-radio-group>
            </template>
          </el-table-column>
          <el-table-column
            label="确认人"
            props="confirmPerson"
          >
            <template #default="scope">
              <signPanal
                :config="signPanalConfig"
                :mode="mode"
                v-model="_value.tableData[scope.$index].confirmPerson"
              />
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
            <icon
              name="el-icon-close"
              @click="delRow(i, row)"
              v-if="!readonly"
            ></icon>
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
        <el-button
          size="small"
          icon="el-icon-plus"
          @click="addRow"
          v-if="!readonly"
          >{{ placeholder }}</el-button
        >
      </template>
    </template>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { ValueType } from '../ComponentsConfigExport';
import { Collapse, CollapseItem, Dialog, showFailToast } from 'vant';
import FormItem from '@/components/common/FormItem.vue';
import FormDesignRender from '@/views/admin/layout/form/FormDesignRender.vue';
import componentMinxins from '../ComponentMinxins';
import signPanal from './SignPanel.vue';
import multilevelLink from '../../../../api/multilevelLink';

export default {
  mixins: [componentMinxins],
  name: 'SafetyMeasure',
  components: {
    draggable,
    FormItem,
    Collapse,
    CollapseItem,
    FormDesignRender,
    signPanal,
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
      default: () => {
        return {};
      },
    },
  },
  created() {
    if (Array.isArray(this.modelValue)) {
      this._value = {
        tableData: [],
        otherSafetyMeasure: [],
      };
    } else if (this.$isNotEmpty(this.modelValue)) {
      this.loadSecurityMeasure();
    }
  },
  computed: {
    rules() {
      const rules = {};
      this.columns.forEach((col) => {
        if (col.props.required) {
          rules[col.id] = [
            {
              type: ValueType.getValidType(col.valueType),
              required: true,
              message: `请完成${col.title}`,
              trigger: 'blur',
            },
          ];
        }
      });
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
      select: null,
      drag: false,
      ValueType,
      actives: [],
      tbCellStyle: {
        background: '#e8e8e8',
        padding: '10px 0',
      },
      cellStyle: {
        padding: '0',
      },
      dragProps: {
        animation: 300,
        group: 'form',
        disabled: false,
        sort: true,
        ghostClass: 'choose',
      },
      signPanalConfig: {
        icon: 'el-icon-edit',
        id: 'field6130956963180',
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
      // const { data } = await multilevelLink.getSafetyMeasureSmiple('5');
      // this._value.tableData = data.data.map((ele, index) => {
      //   return {
      //     number: index + 1,
      //     securityMeasure: ele.securityMeasure,
      //     isRelated: '',
      //     confirmPerson: '',
      //   };
      // });
      this._value.tableData = [
        {
          number: 1,
          securityMeasure: '测试安全措施',
          isRelated: '',
          confirmPerson: '',
        },
      ];
      this._value.otherSafetyMeasure = [];
    },
    isReadonly(item) {
      return item.perm === 'R';
    },
    getMinWidth(col) {
      switch (col.name) {
        case 'DateTime':
          return '250px';
        case 'DateTimeRange':
          return '280px';
        case 'MultipleSelect':
          return '200px';
        default:
          return '150px';
      }
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
    isError(i) {
      for (let j = 0; j < this._columns.length; j++) {
        let ref = this.$refs[`${this._columns[j].id}_${i}`];
        if (ref && Array.isArray(ref) && ref.length > 0 && ref[0].isError) {
          if (ref[0].isError()) {
            return true;
          }
        }
      }
      return false;
    },
    addSafetyMeasure() {
      this._value.otherSafetyMeasure.push({
        otherMeasure: '',
        organizer: '',
        confirmPerson: '',
      });
    },
    delRow(i, row) {
      if (this.mode === 'PC') {
        this.$confirm('您确定要删除该行数据吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          console.log(this._value, this._value.length);
          this._value.splice(i, 1);
          console.log(this._value, this._value.length);
        });
      } else {
        Dialog.confirm({
          title: '提示',
          message: '您确定要删除该行数据吗？',
        }).then(() => {
          this._value.splice(i, 1);
        });
      }
    },
    addRow() {
      if (this.maxSize > 0 && this._value.length >= this.maxSize) {
        if (this.mode === 'PC') {
          this.$message.warning(`最多只能添加${this.maxSize}行`);
        } else {
          showFailToast(`最多加${this.maxSize}行`);
        }
      } else {
        let row = {};
        this.columns.forEach((col) => (row[col.id] = undefined));
        const v = Object.assign([], this._value);
        v.push(row);
        this._value = v;
      }
    },
    delItem(id) {
      this._columns.splice(id, 1);
    },
    selectItem(cp) {
      this.selectFormItem = cp;
    },
    getSelectedClass(cp) {
      return this.selectFormItem && this.selectFormItem.id === cp.id
        ? 'border-left: 4px solid #f56c6c'
        : '';
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        }
        const values = data.map((item) => Number(item[column.property]));
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          sums[index] = '...';
        }
      });

      return sums;
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
  margin-right: 10px;
  font-size: 1rem;
  color: #8c8c8c;
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
  padding: 20px;
  background: #f7f8fa;
  color: #bdb7b7;
  text-align: center;
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
</style>
