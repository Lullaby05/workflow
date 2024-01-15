<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-date-picker
        disabled
        :type="type"
        :placeholder="placeholder"
      ></el-date-picker>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-date-picker
        v-model="_value"
        :value-format="format"
        :format="format"
        clearable
        :type="type"
        :placeholder="placeholder"
      ></el-date-picker>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field
        :disabled="disabled"
        readonly
        right-icon="arrow"
        clickable
        name="datetimePicker"
        :model-value="_value"
        :placeholder="placeholder"
        @click="openPopup"
      />
      <popup
        v-model:show="showPicker"
        position="bottom"
      >
        <picker-group
          :title="desc"
          :tabs="['选择日期', '选择时间']"
          @confirm="onConfirm"
          @cancel="showPicker = false"
        >
          <date-picker
            :formatter="formatter"
            v-model="currentDate"
          />
          <time-picker
            :formatter="formatter"
            v-model="currentTime"
          />
        </picker-group>
      </popup>
    </div>
    <div v-else>
      {{ _value }}
    </div>
  </div>
</template>

<script>
import { Field, Popup, DatePicker, TimePicker, PickerGroup } from 'vant';
import componentMinxins from '../ComponentMinxins';
import moment from 'moment';
import wx from 'weixin-js-sdk';

export default {
  mixins: [componentMinxins],
  name: 'DateTime',
  components: { Field, Popup, DatePicker, TimePicker, PickerGroup },
  props: {
    modelValue: {
      default: null,
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm',
    },
    placeholder: {
      type: String,
      default: '请选择日期时间',
    },
  },
  computed: {
    type() {
      switch (this.format) {
        case 'YYYY':
          return 'year';
        case 'YYYY-MM':
          return 'month';
        case 'YYYY-MM-DD':
          return 'date';
        case 'YYYY-MM-DD HH:mm':
          return 'datetime';
        default:
          return 'datetime';
      }
    },
    desc() {
      switch (this.format) {
        case 'YYYY':
          return '选择年份';
        case 'YYYY-MM':
          return '选择年-月';
        case 'YYYY-MM-DD':
          return '选择年-月-日';
        case 'YYYY-MM-DD HH:mm':
          return '选择年-月-日 时:分';
        default:
          return '选择年-月-日 时:分';
      }
    },
    timeVal: {
      get() {
        if (this.$isNotEmpty(this.modelValue)) {
          return moment(this.modelValue);
        } else {
          return new Date();
        }
      },
      set(val) {
        this.$emit('update:modelValue', this.getFormatVal(val));
      },
    },
  },
  data() {
    return {
      showPicker: false,
      currentDate: [],
      currentTime: [],
    };
  },
  methods: {
    openPopup() {
      if (!this.disabled) {
        this.showPicker = true;
        if (!this.modelValue) {
          // 默认当前时间
          this.currentDate = new Date().toLocaleDateString().split('/');
          this.currentTime = new Date()
            .toLocaleTimeString()
            .split(':')
            .slice(0, 2);
          wx.miniProgram.getEnv((res) => {
            if (res.miniprogram) {
              this.currentDate = new Date().toLocaleDateString().split('/');
              this.currentTime = new Date()
                .toLocaleTimeString('chinese', { hour12: false })
                .split(':')
                .slice(0, 2);
            }
          });
        } else {
          this.currentDate = this.modelValue.split(' ')[0].split('-');
          this.currentTime = this.modelValue.split(' ')[1].split(':');
        }
      }
    },
    onConfirm(val) {
      this.showPicker = false;
      this._value = this.getFormatVal(val);
      console.log(
        this._value,
        `${val[0].selectedValues.join('-')} ${val[1].selectedValues.join(':')}`
      );
    },
    getFormatVal(val) {
      return `${val[0].selectedValues.join('-')} ${val[1].selectedValues.join(
        ':'
      )}`;
    },
    formatter(type, option) {
      switch (type) {
        case 'year':
          option.text += ' 年';
          break;
        case 'month':
          option.text += ' 月';
          break;
        case 'day':
          option.text += ' 日';
          break;
        case 'hour':
          option.text += ' 时';
          break;
        case 'minute':
          option.text += ' 分';
          break;
      }
      return option;
    },
    filter(type, options) {
      /*if (type === 'minute') {
      return options.filter((option) => option % 5 === 0);
    }*/
      return options;
    },
  },
};
</script>

<style scoped></style>
