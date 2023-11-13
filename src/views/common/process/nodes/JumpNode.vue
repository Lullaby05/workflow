<template>
  <node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    @selected="$emit('selected')"
    @delNode="$emit('delNode')"
    @insertNode="(type) => $emit('insertNode', type)"
    placeholder="请设置跳转节点"
    header-bgc="#696bdb"
    header-icon="el-icon-userfilled"
  />
</template>

<script>
import Node from './Node.vue'

export default {
  name: 'JumpNode',
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  components: { Node },
  data() {
    return {
      showError: false,
      errorInfo: '',
    }
  },
  computed: {
    content() {
      const config = this.config.props
    },
  },
  methods: {
    getFormItemById(id) {
      return this.$store.state.design.formItems.find((item) => item.id === id)
    },
    //校验数据配置的合法性
    validate(err) {
      try {
        return (this.showError =
          !this[`validate_${this.config.props.assignedType}`](err))
      } catch (e) {
        return true
      }
    },
  },
  emits: ['selected', 'delNode', 'insertNode'],
}
</script>

<style scoped></style>
