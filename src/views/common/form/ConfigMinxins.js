export default {
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  emits: ['update:modelValue'],
}
