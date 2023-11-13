<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input disabled :placeholder="placeholder" show-word-limit :rows="2" type="textarea"/>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-input v-model="_value" clearable :maxlength="255" :placeholder="placeholder" show-word-limit :rows="3" type="textarea">
        <template #append v-if="enableScan">
          <el-button v-if="enableScan" icon="el-icon-fullscreen" @click="scanCode"></el-button>
        </template>
      </el-input>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <field v-model="_value" rows="2" autosize type="textarea" maxlength="2048" :placeholder="placeholder" show-word-limit>
        <template #right-icon v-if="enableScan">
          <icon name="el-icon-fullscreen" @click="scanCode"></icon>
        </template>
      </field>
      <scan-code v-model="visible" @ok="scanOk"></scan-code>
    </div>
    <div v-else>
      {{ _value }}
    </div>
  </div>
</template>

<script>
import { Field } from 'vant'
import ScanCode from '@/components/common/ScanCode.vue'
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: 'TextareaInput',
  components: { Field, ScanCode },
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '请输入内容',
    },
    enableScan: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    _value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  data() {
    return {
      visible: false,
      popupStyle: {
        height: '100%',
        width: '100%',
        background: 'black',
        opacity: '0.5',
      },
    }
  },
  methods: {
    scanCode() {
      this.visible = true
    },
    scanOk(code) {
      this._value += code + '\n'
      showSuccessToast('扫码成功')
    },
  },
  emits: ['update:modelValue'],
}
</script>

<style scoped></style>
