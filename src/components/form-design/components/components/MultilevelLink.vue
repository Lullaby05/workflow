<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div v-if="!expanding">
        <el-select
          class="max-fill"
          v-model="_value"
          v-for="(item, index) in currentOptions.columns"
          :key="index"
          disabled
          :placeholder="'请选择' + currentOptions.placeholder[index]"
        />
      </div>
      <el-radio-group
        v-model="_value"
        v-else
      >
        <el-radio
          class="w-row-text"
          style="margin: 5px"
          disabled
          v-for="(op, index) in options"
          :key="index"
          :label="op"
          >{{ op }}</el-radio
        >
      </el-radio-group>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <div v-if="!expanding">
        <div class="link-list">
          <div
            class="link-list-item"
            v-for="(ele, i) in _valuePc"
            :key="i + key"
          >
            <el-select
              v-model="_valuePc[i][currentOptions.fields[index]]"
              v-for="(item, index) in currentOptions.options"
              class="multi-link-select"
              :key="currentOptions.fields[index]"
              clearable
              :placeholder="'请选择' + currentOptions.placeholder[index]"
              @change="(val) => changeLink(val, i, index)"
            >
              <el-option
                v-if="index === 0"
                v-for="(op, sort) in allOptionsMap[index]"
                :key="sort"
                :value="op.value"
                :label="op.key"
              ></el-option>
              <el-option
                v-else
                v-for="(op, sort) in mapToArray(
                  index,
                  _valuePc[i][currentOptions.fields[index - 1]]
                )"
                key="other"
                :value="op.value"
                :label="op.key"
              ></el-option>
            </el-select>
            <el-button
              v-if="i === 0"
              style="margin-left: 12px"
              @click="addLink"
              type="primary"
              >添加</el-button
            >
            <el-button
              v-else
              style="margin-left: 12px"
              @click="removeLink(i)"
              type="danger"
              >删除</el-button
            >
          </div>
        </div>
      </div>
      <el-radio-group
        v-model="_valuePc"
        v-else
      >
        <el-radio
          class="w-row-text"
          style="margin: 5px"
          v-for="(op, index) in options"
          :key="index"
          :label="op"
          >{{ op }}</el-radio
        >
      </el-radio-group>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <collapse
        v-model="actives"
        v-if="_valuePc.length > 0"
      >
        <collapse-item
          :lazy-render="false"
          style="background: #f7f8fa"
          :name="i"
          :key="i + key"
          v-for="(row, i) in _valuePc"
        >
          <template #title>
            <span>第 {{ i + 1 }} 项 </span>
            <span
              class="del-row"
              @click.stop="removeLink(i)"
              v-if="!readonly && i > 0"
              >删除</span
            >
          </template>
          <div
            class="other_from"
            v-for="(item, index) in currentOptions.options"
          >
            <div class="other_title">
              {{ currentOptions.placeholder[index] }}
            </div>
            <div
              class="other_content"
              v-if="show_v[i]"
            >
              <Field
                v-model="show_v[i][index]"
                :key="currentOptions.fields[index]"
                clearable
                :placeholder="'请选择' + currentOptions.placeholder[index]"
                label=""
                :readonly="true"
                @click="showClick(i, index)"
              />
              <Popup
                v-if="currentOptions.show[i]"
                v-model:show="currentOptions.show[i][index]"
                round
                position="bottom"
              >
                <Picker
                  v-if="index === 0"
                  :title="'选择' + currentOptions.placeholder[index]"
                  :columns="allOptionsMap[0]"
                  :columns-field-names="customFieldName"
                  @confirm="(val) => changeLink_m(val, i, index)"
                  @cancel="showCancel(i, index)"
                  :key="currentOptions.fields[index]"
                />
                <Picker
                  v-else
                  :title="'选择' + currentOptions.placeholder[index]"
                  :columns="
                    mapToArray(
                      index,
                      _valuePc[i][currentOptions.fields[index - 1]]
                    )
                  "
                  :columns-field-names="customFieldName"
                  @confirm="(val) => changeLink_m(val, i, index)"
                  @cancel="showCancel(i, index)"
                  :key="i + currentOptions.fields[index]"
                />
              </Popup>
            </div>
          </div>
        </collapse-item>
      </collapse>
      <div
        class="m-tb-empty"
        v-if="!readonly"
      >
        <Button
          type="primary"
          size="small"
          @click="addLink"
          >添加数据</Button
        >
      </div>
    </div>
    <div v-else>
      <el-table
        :data="_valuePc"
        :border="true"
        :cell-style="cellStyle"
        :header-cell-style="tbCellStyle"
      >
        <el-table-column
          type="index"
          label="序号"
          width="60"
        ></el-table-column>
        <el-table-column
          v-for="(item, index) in currentOptions.placeholder"
          :key="index"
          :label="item"
          :prop="currentOptions.fields[index]"
          ><template #default="scoped">
            {{ formatValue(scoped.row, index) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  Radio,
  RadioGroup,
  Collapse,
  CollapseItem,
  Field,
  Popup,
  Picker,
  Button,
} from 'vant';
import componentMinxins from '../ComponentMinxins';
import multilevelLinkApi from '@/api/multilevelLink';
import { cloneDeep } from 'lodash';

export default {
  mixins: [componentMinxins],
  name: 'MultilevelLink',
  components: {
    Radio,
    RadioGroup,
    Collapse,
    CollapseItem,
    Field,
    Popup,
    Picker,
    Button,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => [{}],
    },
    expanding: {
      type: Boolean,
      default: false,
    },
    currentOptions: {
      type: Object,
      default: () => {
        return [
          {
            key: '0',
            options: [],
          },
        ];
      },
    },
  },
  async created() {
    this.allOptionsMap = this.currentOptions.options.map((item, index) => {
      if (index === 0) {
        return item;
      }
      return new Map();
    });
    let show = new Array(this.currentOptions.options.length).fill([]);
    this.currentOptions.options.forEach((e, index) => {
      show[index].push(false);
    });
    this.currentOptions.show = show;
    if (this.modelValue.length) {
      this.readonlyVal = cloneDeep(this.modelValue);
      for (let i = 0; i < this.modelValue.length; i++) {
        this.actives.push(i);
        await this.changeLink(
          this.modelValue[i][this.currentOptions.fields[0]],
          i,
          0,
          false
        );
        let type = '';
        let num = '';
        if (this.currentOptions.options[0]) {
          this.currentOptions.options[0].map((item) => {
            let v = this.modelValue[i][this.currentOptions.fields[0]];
            if (v == item.value) {
              type = item;
            }
          });
        }

        if (this.currentOptions.options[1]) {
          let lastV = this.modelValue[i][this.currentOptions.fields[0]];
          let v = this.modelValue[i][this.currentOptions.fields[1]];
          const options = this.allOptionsMap[1].get(lastV);
          const item = options && options.find((ele) => ele.value === v);
          num = item || {};
        }
        this.show_v[i] = [type.key, num.key];
      }
    }
    console.log('modelValue:', this.currentOptions.options);
  },
  computed: {
    _valuePc: {
      get() {
        if (this.$isNotEmpty(this.modelValue)) {
          return this.modelValue;
        }
        return [{}];
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  data() {
    return {
      showPicker: false,
      readonlyVal: [],
      tbCellStyle: {
        background: '#e8e8e8',
        padding: '10px 0',
      },
      cellStyle: {
        padding: '0',
        height: '40px',
      },
      allOptionsMap: [],
      key: 1,
      actives: [],
      customFieldName: {
        text: 'key',
        value: 'value',
      },
      show_v: [],
    };
  },
  methods: {
    mapToArray(index, val) {
      return this.allOptionsMap[index].get(val);
    },
    addLink() {
      this._valuePc.push({ certNum: '' });
      this.currentOptions.show.push([]);
      this.show_v.push([]);
      this.actives.push(this._valuePc.length - 1);
      this.key++;
      console.log('新增:', this._valuePc);
    },
    removeLink(i) {
      this._valuePc.splice(i, 1);
      this.key++;
    },
    formatValue(row, index) {
      let result = undefined;
      if (index === 0) {
        result = this.allOptionsMap[index].find(
          (item) => item.value === row[this.currentOptions.fields[index]]
        );
      } else {
        const arr = this.mapToArray(
          index,
          row[this.currentOptions.fields[index - 1]]
        );
        if (arr) {
          result = arr.find(
            (item) => item.value === row[this.currentOptions.fields[index]]
          );
        }
      }
      return result ? result.key : '';
    },
    async changeLink(val, currentIndex, index, needClear = true) {
      if (val) {
        // 清空后续下拉框的数据以及_valuePc对应字段的数据
        for (let i = index + 1; i < this.currentOptions.options.length; i++) {
          if (needClear) {
            this._valuePc[currentIndex][this.currentOptions.fields[i]] = '';
            this.show_v[currentIndex] = [];
          }
          this.currentOptions.options[i] = [];
        }
        // 将值放到对应的字段中
        this._valuePc[currentIndex][this.currentOptions.fields[index]] = val;
        this.$emit('update:modelValue', this._valuePc);
        if (index >= this.currentOptions.columns - 1) {
          this.$emit('update:currentOptions', this.currentOptions);
          return;
        }
        // 请求下一个下拉框的数据，如果map里有直接从map拿
        if (!this.allOptionsMap[index + 1].has(val)) {
          const { data } = await multilevelLinkApi.getMultilevelLink(
            this.currentOptions.apis[index + 1],
            val
          );
          let dataArr = data.data;
          // 后台返回值可能是Map，需要转换成数组
          if (Object.prototype.toString.call(dataArr) === '[object Object]') {
            this.currentOptions.options[index + 1] = Object.keys(dataArr).map(
              (key) => ({
                key,
                value: dataArr[key],
              })
            );
          } else {
            this.currentOptions.options[index + 1] = dataArr.map((ele) => ({
              key: ele.name,
              value: ele.id,
            }));
          }
          // 把选择的值和下一个下拉框的数据保存到Map中
          this.allOptionsMap[index + 1].set(
            val,
            this.currentOptions.options[index + 1]
          );
        }
        this.$emit('update:currentOptions', this.currentOptions);
      } else {
        // 清空后续下拉框的数据以及_valuePc对应字段的数据
        for (let i = index + 1; i < this.currentOptions.options.length; i++) {
          this._valuePc[currentIndex][this.currentOptions.fields[i]] = '';
          this.currentOptions.options[i] = [];
        }
      }
    },
    showCancel(i, index) {
      this.currentOptions.show[i] = new Array(
        this.currentOptions.options.length
      ).fill(false);
    },
    showClick(i, index) {
      this.currentOptions.show[i] = new Array(
        this.currentOptions.options.length
      ).fill(false);
      this.currentOptions.show[i][index] = true;
    },
    changeLink_m(val, currentIndex, index, needClear = true) {
      // debugger;
      this.changeLink(val.selectedValues[0], currentIndex, index, needClear);
      this.currentOptions.show[currentIndex][index] = false;
      this.show_v[currentIndex][index] =
        val.selectedOptions[0] && val.selectedOptions[0].key;
      this._valuePc[currentIndex][this.currentOptions.fields[index]] =
        val.selectedValues[0];
    },
  },
  emits: ['update:modelValue', 'update:currentOptions'],
};
</script>

<style scoped lang="less">
.multi-link-select + .multi-link-select {
  margin-left: 9px;
}
.link-list-item + .link-list-item {
  margin-top: 10px;
}
.del-row {
  float: right;
  margin-right: 20px;
  font-size: 1rem;
  color: #d43030;
}
.other_from {
  position: relative;
  // padding: 10px 10px 20px 10px;
  // background: white;
  margin-bottom: 10px;
  .other_title {
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: #545456;
  }
  .other_content {
  }
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
</style>
