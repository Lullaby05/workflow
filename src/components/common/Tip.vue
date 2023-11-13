<template>
  <el-tooltip
    :effect="isDark ? 'dark' : 'light'"
    :content="content"
    placement="top-start"
  >
    <span>
      <slot></slot>
      <icon name="el-icon-questionfilled" style="cursor: pointer"></icon>
    </span>
  </el-tooltip>
</template>

<script>
export default {
  install(Vue) {
    window.$vueApp.component('Tip', this)
  },
  name: 'Tip',
  components: {},
  props: {
    isDark: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped></style>
