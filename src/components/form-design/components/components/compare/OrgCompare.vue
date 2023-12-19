<template>
  <span>
    <el-button type="primary" round @click="showPicker"
      >选择人员/部门</el-button
    >
    <!-- <org-items v-model="modelValue.compareVal"/> -->
    <org-picker
      ref="orgPicker"
      :multiple="modelValue.compare === 'IN'"
      title="选择要比较的人员/部门"
      :selected="modelValue.compareVal"
      @ok="selected"
    />
  </span>
</template>
<script>
  import OrgPicker from '@/components/common/OrgPicker.vue';
  // import OrgItems from "../../../process/OrgItems.vue";

  export default {
    name: 'OrgCompare',
    components: { OrgPicker },
    props: {
      modelValue: {
        require: true,
        type: Object,
      },
    },
    methods: {
      showPicker() {
        this.$refs.orgPicker.show();
      },
      selected(orgs) {
        this.context.compareVal = orgs;
      },
    },
  };
</script>
