<template>
  <component v-bind="config.props"
             v-model:items="config.props.items"
             v-model:columns="config.props.columns"
             ref="form" :index="index"
             :formData="formData"
             :readonly="readonly"
             :is="config.name"
             :mode="mode"
             style="width: 100%"
             v-model="_value"/>
</template>

<script>
import components from '@/views/common/form/ComponentExport'

export default {
  name: 'FormRender',
  components: components,
  props: {
    mode: {
      type: String,
      default: 'DESIGN',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      default: undefined,
    },
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
    index: {
      type: Number,
      default: 0,
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      },
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
  methods: {
    validate(call) {
      if (this.$refs.form.validate) {
        this.$refs.form.validate(call)
      } else {
        call(true)
      }
    },
  },
  emits: ['update:modelValue'],
}
</script>

<style lang="less" scoped></style>
