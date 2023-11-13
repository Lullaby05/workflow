
export default {
  props: {
    mode: {
      type: String,
      default: 'DESIGN',
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
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
  emits: ['update:modelValue'],
}
