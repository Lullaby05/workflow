<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select
        class="max-fill"
        v-if="!expanding"
        multiple
        v-model="_value"
        disabled
        :placeholder="placeholder"
      />
      <el-checkbox-group v-else v-model="_value">
        <el-checkbox
          class="w-row-text"
          disabled
          v-for="(op, index) in options"
          :key="index"
          :label="op"
          >{{ op }}</el-checkbox
        >
      </el-checkbox-group>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <div v-if="!expanding">
        <el-select
          class="max-fill"
          v-if="isNeedApi"
          v-model="_value"
          multiple
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
          multiple
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
      <el-checkbox-group v-else v-model="_value">
        <el-checkbox
          class="w-row-text"
          style="margin: 5px"
          v-for="(op, index) in options"
          :key="index"
          :label="op"
          >{{ op }}</el-checkbox
        >
      </el-checkbox-group>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <!--      <div v-if="!expanding">
          <field right-icon="arrow" readonly clickable :value="_value" :placeholder="placeholder" @click="showPicker = true"/>
          <popup v-model:show="showPicker" position="bottom">
            <picker :title="placeholder" show-toolbar :columns="options" @confirm="onConfirm" @cancel="showPicker = false"></picker>
          </popup>
        </div>-->
      <checkbox-group v-model="_value" direction="horizontal">
        <checkbox
          style="margin: 5px"
          :name="op"
          shape="square"
          v-for="(op, index) in options"
          :key="index"
          >{{ op }}</checkbox
        >
      </checkbox-group>
    </div>
    <div v-else>
      {{ formatterText() }}
    </div>
  </div>
</template>

<script>
  import { Checkbox, CheckboxGroup, Picker, Field, Popup } from 'vant';
  import componentMinxins from '../ComponentMinxins';

  export default {
    mixins: [componentMinxins],
    name: 'MultipleSelect',
    components: { Checkbox, CheckboxGroup, Picker, Field, Popup },
    props: {
      placeholder: {
        type: String,
        default: '请选择选项',
      },
      modelValue: {
        type: Array,
        default: () => {
          return [];
        },
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
    computed: {},
    data() {
      return {
        showPicker: false,
        checks: [],
      };
    },
    methods: {
      formatterText() {
        if (this.isNeedApi && this.readonly) {
          let val = '';
          for (const item of this.options) {
            if (this._value.includes(item.value)) {
              val += `${item.label} `;
            }
          }
          return val;
        } else {
          return this._value.join(',');
        }
      },
    },
    emits: ['update:modelValue'],
  };
</script>

<style lang="less" scoped>
  :deep(.el-checkbox-group) {
    line-height: 10px;
  }
</style>
