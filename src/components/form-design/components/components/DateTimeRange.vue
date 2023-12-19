<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-date-picker
        style="width: 95%"
        disabled
        :type="type"
        :start-placeholder="placeholder[0]"
        :end-placeholder="placeholder[1]"
      />
      <div v-if="showLength" class="length">
        <span>时长：</span>
        <span>{{ timeLength() }}</span>
      </div>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-date-picker
        v-model="_value"
        clearable
        :value-format="format"
        :format="format"
        :type="type"
        :start-placeholder="placeholder[0]"
        :end-placeholder="placeholder[1]"
      />
      <div v-if="showLength" class="length">
        <span>时长：</span>
        <span>{{ timeLength() }}</span>
      </div>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field
        right-icon="arrow"
        readonly
        clickable
        name="datetimePicker"
        v-model="_value[0]"
        :placeholder="placeholder[0]"
        @click="loadTime(0)"
      />
      <field
        right-icon="arrow"
        readonly
        clickable
        name="datetimePicker"
        v-model="_value[1]"
        :placeholder="placeholder[1]"
        @click="loadTime(1)"
      />
      <div v-if="showLength" class="length">
        <span>时长：</span>
        <span>{{ timeLength() }}</span>
      </div>
      <popup v-model:show="showPicker" position="bottom">
        <picker-group
          :title="desc"
          :tabs="['选择日期', '选择时间']"
          @confirm="onConfirm"
        >
          <date-picker :formatter="formatter" v-model="currentDate" />
          <time-picker
            v-if="format.indexOf('HH') > 0"
            :formatter="formatter"
            v-model="currentTime"
          />
        </picker-group>
      </popup>
    </div>
    <div v-else>{{ _value[0] }} ~ {{ _value[1] }}</div>
  </div>
</template>

<script>
  import {
    DatePicker,
    Field,
    PickerGroup,
    Popup,
    showFailToast,
    TimePicker,
  } from 'vant';
  import componentMinxins from '../ComponentMinxins';
  import moment from 'moment';

  export default {
    mixins: [componentMinxins],
    name: 'DateTimeRange',
    components: { DatePicker, TimePicker, PickerGroup, Field, Popup },
    props: {
      modelValue: {
        type: Array,
        default: () => {
          return [];
        },
      },
      format: {
        type: String,
        default: 'YYYY-MM-DD HH:mm',
      },
      placeholder: {
        type: Array,
        default: () => {
          return ['开始时间', '结束时间'];
        },
      },
      showLength: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      type() {
        switch (this.format) {
          case 'YYYY-MM-DD':
            return 'daterange';
          case 'YYYY-MM-DD HH:mm':
            return 'datetimerange';
          default:
            return 'daterange';
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
    },
    data() {
      return {
        showPicker: false,
        valIndex: 0,
        currentDate: [],
        currentTime: [],
        timeVal: [new Date(), new Date()],
      };
    },
    methods: {
      loadTime(index) {
        this.showPicker = true;
        this.valIndex = index;
        if (this.$isNotEmpty(this.modelValue[index])) {
          const time = this.modelValue[index].split(' ');
          this.currentDate = time[0].split('-');
          this.currentTime = time[1].split(':');
        } else {
          this.currentDate = [];
          this.currentTime = [];
        }
      },
      getFormatVal(val) {
        return `${val[0].selectedValues.join('-')} ${val[1].selectedValues.join(
          ':'
        )}`;
      },
      timeLength() {
        //求时长算法
        if (Array.isArray(this.modelValue) && this.modelValue.length > 0) {
          let start = moment(this.modelValue[0]).format(
            this.format.replaceAll('dd', 'DD')
          );
          let end = moment(this.modelValue[1]).format(
            this.format.replaceAll('dd', 'DD')
          );
          if (start === end || this.modelValue[0] === this.modelValue[1]) {
            return '0 （时长为0，请确认）';
          }
          let mstart = moment(start);
          let mend = moment(end);
          let years = mend.diff(start, 'years');
          let months = mend.diff(start, 'months');
          let days = mend.diff(start, 'days');
          let hours = mend.diff(start, 'hours');
          let minutes = mend.diff(start, 'minutes');
          minutes = minutes % 60;
          hours = hours % 24;
          months = months % 12;
          //因为每月天不固定，所以天要特殊动态处理
          if (mstart.date() < mend.date()) {
            days = mend.date() - mstart.date();
            if (minutes > 0 || hours > 0) {
              days--;
            }
          } else if (mstart.date() === mend.date()) {
            //日且开始时间大于结束时间的话，日要归零
            const s = moment(moment(start).format('HH:mm:ss'));
            const e = moment(moment(end).format('HH:mm:ss'));
            if (e.isBefore(s) || s._i === e._i) {
              days = 0;
            }
          }
          //处理超过俩月且天超过31
          if (days > 31 && mend.month() - mstart.month() >= 2) {
            //将日期推至上月求差
            days = mend.diff(
              mstart.add(mend.month() - mstart.month() - 1, 'month'),
              'days'
            );
          }
          return `${years > 0 ? years + '年 ' : ' '}${
            months > 0 ? months + '个月 ' : ' '
          }
              ${days > 0 ? days + '天 ' : ' '}${
            hours > 0 ? hours + '小时 ' : ' '
          }
              ${minutes > 0 ? minutes + '分钟 ' : ' '}`;
        } else {
          return '先选择时间哦';
        }
      },
      onConfirm(val) {
        this.showPicker = false;
        this._value[this.valIndex] = this.getFormatVal(val);
        if (this._value[0] && this._value[1]) {
          if (!moment(this._value[0]).isBefore(moment(this._value[1]))) {
            this._value[this.valIndex] = undefined;
            showFailToast('开始时间必须小于结束时间');
          } else {
            this.$emit('update:modelValue', this._value);
          }
        }
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
    },
    emits: ['update:modelValue'],
  };
</script>

<style scoped>
  .length {
    margin-top: 5px;
  }
  .length:nth-child(2) {
    color: #8c8c8c;
  }
  :deep(.el-date-editor--datetimerange .el-input__inner) {
    width: 100%;
    max-width: 400px;
  }
</style>
