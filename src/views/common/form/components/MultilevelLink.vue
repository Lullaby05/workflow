<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div v-if="!expanding">
        <el-select class="max-fill" v-model="_value" v-for="(item, index) in currentOptions.columns" :key="index" disabled :placeholder="'请选择' + currentOptions.placeholder[index]" />
      </div>
      <el-radio-group v-model="_value" v-else>
        <el-radio class="w-row-text" style="margin: 5px" disabled v-for="(op, index) in options" :key="index" :label="op">{{ op }}</el-radio>
      </el-radio-group>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <div v-if="!expanding">
        <el-select v-model="_valuePc[currentOptions.fields[index]]" v-for="(item, index) in currentOptions.options" class="multi-link-select" :key="currentOptions.fields[index]" :disabled="!item.length" clearable :placeholder="'请选择' + currentOptions.placeholder[index]"
          @change="(val) => changeLink(val, index)">
          <el-option v-for="(op, i) in item" :key="i" :value="op.value" :label="op.key"></el-option>
        </el-select>
      </div>
      <el-radio-group v-model="_valuePc" v-else>
        <el-radio class="w-row-text" style="margin: 5px" v-for="(op, index) in options" :key="index" :label="op">{{ op }}</el-radio>
      </el-radio-group>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <radio-group v-model="_valuePc" direction="horizontal">
        <radio style="margin: 5px" v-for="(op, index) in options" :key="index" :name="op">{{ op }}</radio>
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
      type: String,
      default: null,
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
  created() { },
  computed: {
    _valuePc: {
      get() {
        if (this.$isNotEmpty(this.modelValue)) {
          return this.modelValue;
        }
        const fields = this.currentOptions.fields;
        const obj = {}
        fields.map((v) => {
          obj[v] = '';
        })
        return obj
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  data() {
    return {
      showPicker: false,
    };
  },
  methods: {
    async changeLink(val, index) {
      if (val) {
        // 清空后续下拉框的数据以及_valuePc对应字段的数据
        for (let i = index + 1; i < this.currentOptions.options.length; i++) {
          this._valuePc[this.currentOptions.fields[i]] = ''
          this.currentOptions.options[i] = [];
        }
        // 将值放到对应的字段中
        this._valuePc[this.currentOptions.fields[index]] = val;
        if (index >= this.currentOptions.columns - 1) {
          this.$emit('update:currentOptions', this.currentOptions);
          return
        }
        // 请求下一个下拉框的数据
        const { data } = await multilevelLinkApi[
          this.currentOptions.apis[index + 1]
        ](val);
        this.currentOptions.options[index + 1] = data.map((ele) => ({
          key: ele.name,
          value: ele.id,
        }));
        this.$emit('update:currentOptions', this.currentOptions);
      } else {
        this._valuePc[this.currentOptions.fields[index]] = '';
        this.currentOptions.options[index + 1] = [];
      }
    },
  },
  emits: ['update:modelValue', 'update:currentOptions'],
};
</script>

<style scoped lang="less">
.multi-link-select+.multi-link-select {
  margin-left: 9px;
}
</style>
