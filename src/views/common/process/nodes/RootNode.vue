<template>
  <node
    title="发起人"
    :is-root="true"
    :content="content"
    @selected="$emit('selected')"
    @insertNode="(type) => $emit('insertNode', type)"
    placeholder="所有人"
    header-bgc="#7a939d"
    header-icon="el-icon-userfilled"
  />
</template>

<script>
import Node from './Node.vue'

export default {
  name: 'RootNode',
  components: { Node },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  computed: {
    content() {
      if (this.config.props.assignedUser.length > 0) {
        let texts = []
        this.config.props.assignedUser.forEach((org) => texts.push(org.name))
        return String(texts).replaceAll(',', '、')
      } else {
        return '所有人'
      }
    },
  },
  data() {
    return {}
  },
  methods: {},
  emits: ['selected', 'insertNode'],
}
</script>

<style scoped></style>
