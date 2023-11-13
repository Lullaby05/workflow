<template>
  <el-dialog
    :class="{ 'custom-dialog': true, border: border, fullscreen: fullscreen }"
    :width="width"
    :title="title"
    append-to-body
    :close-on-click-modal="clickClose"
    @opened="$emit('opened')"
    @closed="$emit('closed')"
    :destroy-on-close="closeFree"
    v-model="_value"
  >
    <template #header>
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <div v-if="showFooter">
        <el-button size="default" @click="_value = false; $emit('cancel')">{{ cancelText }}</el-button>
        <el-button size="default" type="primary" @click="$emit('ok')">{{okText}}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'WDialog',
  install(Vue) {
    window.$vueApp.component('WDialog', this)
  },
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50%',
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    clickClose: {
      type: Boolean,
      default: false,
    },
    closeFree: {
      type: Boolean,
      default: false,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    cancelText: {
      type: String,
      default: '取 消',
    },
    okText: {
      type: String,
      default: '确 定',
    },
    border: {
      type: Boolean,
      default: true,
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
    return {}
  },
  methods: {},
  emits: ['opened', 'closed', 'cancel', 'ok', 'update:modelValue'],
}
</script>

<style lang="less">
.custom-dialog {
  .el-dialog__header {
    .el-dialog__title {
      font-size: 17px;
    }
    .el-dialog__headerbtn {
      top: -5px;
      .i {
        font-size: large;
      }
    }
  }

  .el-dialog__footer, .el-dialog__header {
    padding: 5px 20px;
  }
}
.border {
  .el-dialog__header {
    border-bottom: 1px solid #e8e8e8;
  }
  .el-dialog__footer {
    border-top: 1px solid #e8e8e8;
  }
  .el-dialog__footer, .el-dialog__header {
    padding: 10px 20px !important;
  }
}
.fullscreen {
  overflow: hidden;
  margin-top: 0 !important;
  width: 100% !important;
  .el-dialog__body {
    padding: 0;
    height: calc(100vh - 94px);
  }
}
</style>
