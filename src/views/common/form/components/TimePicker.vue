<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-time-picker disabled :placeholder="placeholder"></el-time-picker>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-time-picker v-model="_value" :value-format="format" :placeholder="placeholder"/>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field readonly right-icon="arrow" clickable name="datetimePicker" v-model="_value" :placeholder="placeholder" @click="showPicker = true"/>
      <popup v-model:show="showPicker" position="bottom">
        <v-time-picker v-model="timeVal" :formatter="formatter" :columns-type="columnsType" title="选择时间" type="time" @confirm="onConfirm" @cancel="showPicker = false"/>
      </popup>
    </div>
    <div v-else>
      {{ _value }}
    </div>
  </div>
</template>

<script>
import { Field, Popup, TimePicker } from 'vant'
import componentMinxins from '../ComponentMinxins'
const vTimePicker = TimePicker
const date = '2022-01-01 '
export default {
  mixins: [componentMinxins],
  name: 'TimePicker',
  components: { Field, Popup, vTimePicker },
  props: {
    modelValue: {
      default: null,
    },
    format: {
      type: String,
      default: 'HH:mm:ss',
    },
    placeholder: {
      type: String,
      default: '请选择时间',
    },
  },
  computed: {
    timeVal: {
      get() {
        return (this.modelValue || '').split(':')
      },
      set(val) {
        this.timeVals = val
      },
    },
    columnsType(){
      const result = []
      if (this.format.indexOf('HH')){
        result.push('hour')
      }else if(this.format.indexOf('mm')){
        result.push('minute')
      }else if(this.format.indexOf('ss')){
        result.push('second')
      }
    }
  },
  data() {
    return {
      timeVals: [],
      showPicker: false,
    }
  },
  methods: {
    onConfirm(val) {
      this.showPicker = false
      this._value = (val.selectedValues || []).join(':')
    },
    formatter(type, option) {
      switch (type){
        case 'hour': option.text += ' 时'; break;
        case 'minute': option.text += ' 分'; break;
        case 'second': option.text += ' 秒'; break;
      }
      return option;
    },
  },
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
