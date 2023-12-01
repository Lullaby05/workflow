<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div v-if="!expanding">
        <el-select
          class="max-fill"
          v-model="_value[0]"
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
            v-for="ele in _valuePc"
          >
            <el-select
              v-model="ele[currentOptions.fields[index]]"
              v-for="(item, index) in currentOptions.options"
              class="multi-link-select"
              :key="currentOptions.fields[index]"
              clearable
              :placeholder="'请选择' + currentOptions.placeholder[index]"
              @change="(val) => changeLink(val, index)"
            >
              <el-option
                v-for="(op, i) in item"
                :key="i"
                :value="op.value"
                :label="op.key"
              ></el-option>
            </el-select>
          </div>
        </div>
        <el-button
          @click="addLink"
          type="primary"
          >添加</el-button
        >
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
      <radio-group
        v-model="_valuePc"
        direction="horizontal"
      >
        <radio
          style="margin: 5px"
          v-for="(op, index) in options"
          :key="index"
          :name="op"
          >{{ op }}</radio
        >
      </radio-group>
    </div>
    <div v-else>
      {{ _valuePc }}
    </div>
  </div>
</template>

<script>
import { Radio, RadioGroup } from 'vant';
import componentMinxins from '../ComponentMinxins';
import multilevelLinkApi from '@/api/multilevelLink';

export default {
  mixins: [componentMinxins],
  name: 'MultilevelLink',
  components: { Radio, RadioGroup },
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
        return {
          key: '0',
          options: [],
        };
      },
    },
  },
  created() {
    if (this.modelValue.length - 1) {
      this.allOptionsMap = new Array(this.currentOptions.columns).fill(
        new Map()
      );
      for (let i = 0; i < this.modelValue.length; i++) {
        this.changeLink(
          this.modelValue[i][this.currentOptions.fields[0]],
          i,
          0,
          !this.readonly
        );
      }
    }
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
      allOptionsMap: [],
    };
  },
  methods: {
    addLink() {
      this._valuePc.push({});
    },
    async changeLink(val, index) {
      if (val) {
        // 清空后续下拉框的数据以及_valuePc对应字段的数据
        for (let i = index + 1; i < this.currentOptions.options.length; i++) {
          this._valuePc[this.currentOptions.fields[i]] = '';
          this.currentOptions.options[i] = [];
        }
        // 将值放到对应的字段中
        this._valuePc[this.currentOptions.fields[index]] = val;
        this.$emit('update:modelValue', this._valuePc);
        if (index >= this.currentOptions.columns - 1) {
          this.$emit('update:currentOptions', this.currentOptions);
          return;
        }
        // 请求下一个下拉框的数据
        const { data } = await multilevelLinkApi.getMultilevelLink(
          this.currentOptions.apis[index + 1],
          val
        );
        // 把选择的值和下一个下拉框的数据保存到Map中
        if (!this.allOptionsMap[index + 1].get(val)) {
          this.allOptionsMap[index + 1].set(
            val,
            this.currentOptions.options[index + 1]
          );
        }
        console.log('@', this.allOptionsMap);
        let dataArr = data.data;
        // 后台返回值可能是Map，需要转换成数组
        if (Object.prototype.toString.call(dataArr) === '[object Object]') {
          this.currentOptions.options[index + 1] = Object.keys(dataArr).map(
            (key) => ({
              key: dataArr[key],
              value: key,
            })
          );
        } else {
          this.currentOptions.options[index + 1] = dataArr.map((ele) => ({
            key: ele.name,
            value: ele.id,
          }));
        }
        this.$emit('update:currentOptions', this.currentOptions);
      } else {
        // 清空后续下拉框的数据以及_valuePc对应字段的数据
        for (let i = index + 1; i < this.currentOptions.options.length; i++) {
          this._valuePc[this.currentOptions.fields[i]] = '';
          this.currentOptions.options[i] = [];
        }
      }
    },
  },
  emits: ['update:modelValue', 'update:currentOptions'],
};
</script>

<style scoped lang="less">
.multi-link-select + .multi-link-select {
  margin-left: 9px;
}
</style>
