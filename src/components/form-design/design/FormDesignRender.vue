<template>
  <component
    v-bind="config.props"
    v-model:items="config.props.items"
    v-model:columns="config.props.columns"
    :disabled="config.props.disabled"
    ref="form"
    :index="index"
    :formData="formData"
    :readonly="readonly"
    :is="config.name"
    :mode="mode"
    style="width: 100%"
    v-model="_value"
  />
</template>

<script>
  import components from '@/components/form-design/components/ComponentExport';

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
          return {};
        },
      },
      index: {
        type: Number,
        default: 0,
      },
      formData: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    computed: {
      _value: {
        get() {
          return this.modelValue;
        },
        set(val) {
          this.$emit('update:modelValue', val);
        },
      },
    },
    data() {
      return {};
    },
    methods: {
      validate(call) {
        debugger;
        if (this.$refs.form.validate) {
          this.$refs.form.validate(call);
        } else {
          call(true);
        }
      },
      validate_m(call) {
        // debugger;
        if (this.$refs.form.validate_m) {
          this.$refs.form.validate_m(call);
        } else {
          call(true);
        }
      },
    },
    mounted() { 
      // console.log("config",this.config.name)
      // console.log("config",this.config.props)
    },
    emits: ['update:modelValue'],
  };
</script>

<style lang="less" scoped></style>
