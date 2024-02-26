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
      <el-checkbox-group
        v-else
        v-model="_value"
      >
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
      <el-checkbox-group
        v-else
        v-model="_value"
      >
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
      <div v-if="!expanding">
        <field
          right-icon="arrow"
          readonly
          clickable
          v-model="formatValue"
          :placeholder="placeholder"
          @click="openModal"
        />
        <popup
          v-model:show="showPicker"
          closeable
          position="bottom"
        >
          <div class="popup-container">
            <div class="title">{{ placeholder }}</div>
            <div class="select-list">
              <div
                class="select-item"
                :class="{
                  'select-item-active': tempSelectList.includes(item.value),
                }"
                v-for="(item, index) in options"
                :key="index"
                @click="selectItem(item)"
              >
                <div class="select-label">{{ item.label }}</div>
              </div>
            </div>
            <div class="bottom-btn">
              <Button
                type="default"
                size="small"
                @click="showPicker = false"
                >取消</Button
              >
              <Button
                type="primary"
                size="small"
                @click="onConfirm"
                >确定</Button
              >
            </div>
          </div>

          <!-- <picker
            :title="placeholder"
            show-toolbar
            :columns="options"
            :columns-field-names="{ text: 'label', value: 'value' }"
            @confirm="onConfirm"
            @cancel="showPicker = false"
          ></picker> -->
        </popup>
      </div>
      <!-- <checkbox-group
        v-model="_value"
        v-if="isNeedApi"
        direction="horizontal"
        :disabled="disabled"
      >
        <checkbox
          style="margin: 5px"
          :name="op.value"
          shape="square"
          v-for="(op, index) in options"
          :key="index"
          >{{ op.label }}</checkbox
        >
      </checkbox-group>
      <checkbox-group
        v-model="_value"
        v-if="!isNeedApi"
        direction="horizontal"
        :disabled="disabled"
      >
        <checkbox
          style="margin: 5px"
          :name="op"
          shape="square"
          v-for="(op, index) in options"
          :key="index"
          >{{ op }}</checkbox
        >
      </checkbox-group> -->
    </div>
    <div v-else>
      {{ formatterText() }}
    </div>
  </div>
</template>

<script>
import { Checkbox, CheckboxGroup, Picker, Field, Popup, Button } from 'vant';
import componentMinxins from '../ComponentMinxins';

export default {
  mixins: [componentMinxins],
  name: 'MultipleSelect',
  components: { Checkbox, CheckboxGroup, Picker, Field, Popup, Button },
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
  computed: {
    formatValue() {
      if (this.isNeedApi) {
        let val = '';
        for (const item of this.options) {
          if (this._value.includes(item.value)) {
            val += `${item.label}、`;
          }
        }
        val = val.substr(0, val.length - 1);
        return val;
      } else {
        return this._value.join('、');
      }
    },
  },
  data() {
    return {
      showPicker: false,
      checks: [],
      tempSelectList: [],
    };
  },
  methods: {
    formatterText() {
      if (this.isNeedApi && this.readonly) {
        let val = '';
        for (const item of this.options) {
          if (this._value.includes(item.value)) {
            val += `${item.label}、`;
          }
        }
        val = val.substr(0, val.length - 1);
        return val;
      } else {
        return this._value.join('、');
      }
    },
    openModal() {
      this.showPicker = true;
      this.tempSelectList = JSON.parse(JSON.stringify(this._value));
    },
    selectItem(item) {
      if (this.tempSelectList.includes(item.value)) {
        this.tempSelectList = this.tempSelectList.filter(
          (ele) => ele !== item.value
        );
      } else {
        this.tempSelectList.push(item.value);
      }
    },
    onConfirm() {
      this._value = this.tempSelectList;
      this.showPicker = false;
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style lang="less" scoped>
:deep(.el-checkbox-group) {
  line-height: 10px;
}
.van-popup {
  --van-popup-close-icon-margin: 20px;
  --van-popup-close-icon-size: 18px;
  border-radius: 20px 20px 0px 0px;
}
.popup-container {
  display: flex;
  flex-direction: column;
  .title {
    text-align: center;
    line-height: 56px;
    font-size: 16px;
  }
  .bottom-btn {
    text-align: center;
    padding: 10px 16px;
    margin-top: 20px;
    box-shadow: 0px -2px 8px 1px #e5e5ea;
    button {
      height: 40px;
      border-radius: 25px;
      --van-button-primary-background: #165dff;
      --van-button-default-background: #fbfbfb;
      --van-button-default-border-color: #cccccc;
    }
    button:nth-child(1) {
      width: 36vw;
    }
    button:nth-child(2) {
      width: 52vw;
    }
    button + button {
      margin-left: 10px;
    }
  }
}
.select-list {
  padding: 0 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  gap: 16px 8px;
  .select-item {
    color: #4e5969;
    padding: 13px 20px;
    flex: 0 0 auto;
    min-width: calc((100% - 20px) / 3);
    box-sizing: border-box;
    text-align: center;
    border-radius: 4px;
    background: #fafafa;
  }
  .select-item-active {
    color: #165dff;
    background-color: #ecf8fe;
    outline: 0.5px solid #165dff;
    border-radius: 4px;
    background: #f5faff;
  }
}
</style>
