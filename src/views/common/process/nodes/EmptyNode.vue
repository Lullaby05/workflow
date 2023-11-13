<template>
  <node
    :show="false"
    :merge-type="config.parentType"
    @insertNode="(type) => $emit('insertNode', type)"
  />
</template>

<script>
import Node from './Node.vue'

export default {
  name: 'EmptyNode',
  components: { Node },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  methods: {},
  emits: ['insertNode'],
}
</script>

<style scoped></style>
