<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select
        class="max-fill"
        v-if="!expanding"
        v-model="_value"
        disabled
        :placeholder="placeholder"
      />
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
        <el-select
          class="max-fill"
          v-if="isNeedApi"
          v-model="_value"
          clearable
          :placeholder="placeholder"
        >
          <el-option
            v-for="(op, index) in options"
            :key="index"
            :value="op.value"
            :label="op.label"
          ></el-option>
        </el-select>
        <el-select
          class="max-fill"
          v-if="!isNeedApi"
          v-model="_value"
          clearable
          :placeholder="placeholder"
        >
          <el-option
            v-for="(op, index) in options"
            :key="index"
            :value="op"
            :label="op"
          ></el-option>
        </el-select>
      </div>
      <el-radio-group
        v-model="_value"
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
      <!--      <div v-if="!expanding">
          <field right-icon="arrow" readonly clickable :value="_value" :placeholder="placeholder" @click="showPicker = true"/>
          <popup v-model="showPicker" position="bottom">
            <picker :title="placeholder" show-toolbar :columns="options" @confirm="onConfirm" @cancel="showPicker = false"></picker>
          </popup>
        </div>-->
      <Field
        :disabled="disabled"
        v-model="formatValue"
        v-if="isNeedApi"
        is-link
        readonly
        label=""
        :placeholder="placeholder"
        @click="openPopup(i)"
      />
      <Popup
        v-model:show="showPicker"
        position="bottom"
        v-if="isNeedApi"
      >
        <Picker
          :columns="options"
          :columns-field-names="{ text: 'label', value: 'value' }"
          @cancel="showPicker = false"
          @confirm="onConfirm"
        />
      </Popup>
      <radio-group
        :disabled="disabled"
        v-model="_value"
        v-if="!isNeedApi"
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
      {{ formatterText() }}
    </div>
  </div>
</template>

<script>
import { Field, Popup, Picker, Radio, RadioGroup } from 'vant';
import componentMinxins from '../ComponentMinxins';

export default {
  mixins: [componentMinxins],
  name: 'SelectInput',
  components: { Radio, RadioGroup, Picker, Field, Popup },
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '请选择选项',
    },
    expanding: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    isNeedApi: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showPicker: false,
    };
  },
  computed: {
    formatValue() {
      if (this.isNeedApi) {
        const val = this.options.find((ele) => ele.value === this._value);
        return val ? val.label : '';
      }
      return this._value;
    },
  },
  methods: {
    onConfirm(val) {
      this.showPicker = false;
      this._value = val.selectedValues[0];
    },
    formatterText() {
      if (this.isNeedApi && this.readonly) {
        let val = '';
        const tempVal = this.options.find((ele) => ele.value === this._value);
        if (tempVal) {
          val = tempVal.label;
        }
        return val;
      } else {
        return this._value;
      }
    },
    test() {
      console.log('prpos', this.disabled);
    },
    openPopup(i) {
      this.showPicker = true;
    },
  },
  emits: ['update:modelValue'],
  mounted() {
    this.test();
  },
};
</script>

<style scoped></style>
