<template>
  <div
    class="form-render-container"
    :style="formStyle"
  >
    <form-render
      class="form-render-content"
      ref="formRender"
      mode="MOBILE"
      v-model="formData"
      :forms="formsTemp"
      :config="formConfigTemp"
    />
  </div>
</template>
<script lang="ts" setup>
import { getDeptsList } from '@/api/operation/operationApi';
import FormRender from '@/components/form-design/components/FormRender.vue';
import { useFormRender } from '@/views/operation/wxHooks/useFormRender';
import { cloneDeep } from 'lodash';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// 参数为表单数据和表单字段以及状态（是否readOnly）,key为表单对应tab的key值，决定显示哪一个表单
const props = defineProps({
  design: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: 'detail',
  },
});
const emits = defineEmits(['handleAddCertification']);
const router = useRouter();
const formRender = ref<any>(null);

let design = props.design;
const deptList = ref<any[]>([]); // 部门列表下拉

const formStyle = computed<any>(() => {
  return {
    flexDirection: props.status === 'edit' ? 'column' : 'row',
  };
});

// 特殊处理，如果valueKey为applyDeptId（作业申请单位），则需要把对应的值显示为名称而不是id
const handleValueKey = (formItems: any[]) => {
  for (const formItem of formItems) {
    if (
      formItem.name === 'TextInput' &&
      formItem.props.valueKey === 'applyDeptId'
    ) {
      const result = deptList.value.find(
        (item: any) => item.id == design.formData[formItem.id]
      );
      design.formData[formItem.id] = result
        ? result.name
        : design.formData[formItem.id];
      break;
    }
    if (
      (formItem.name === 'SpanLayout' || formItem.name === 'ModuleBlock') &&
      formItem.props.items.length
    ) {
      handleValueKey(formItem.props.items);
    }
  }
};

// 递归把所有表单项的状态设置为编辑或只读
const handleFormStatus = (formItems: any[], status: string) => {
  for (let i = 0; i < formItems.length; i++) {
    formItems[i].perm = status === 'edit' ? 'E' : 'R';
    if (
      (formItems[i].name === 'SpanLayout' ||
        formItems[i].name === 'ModuleBlock') &&
      formItems[i].props.items.length
    ) {
      handleFormStatus(formItems[i].props.items, status);
    }
  }
};

//获取所有部门列表的下拉
if (props.status === 'detail') {
  getDeptsList().then((res) => {
    deptList.value = res.data;
    handleValueKey(design.formItems);
  });
}

handleFormStatus(design.formItems, props.status);

const { formData, formConfigTemp, formsTemp } = useFormRender(design);

// 父组件使用
const handleSave = (callback: (formData: any) => void) => {
  formRender.value!.validate((valid: boolean) => {
    if (valid) {
      callback(formData);
    }
  });
};

defineExpose({
  handleSave,
});
</script>
<style lang="less">
.form-render-container {
  display: flex;

  .process-form {
    & > div {
      padding: 0 10px;
    }
    .el-row {
      flex-wrap: nowrap;
      align-items: center;
    }

    .el-form-item__label {
      min-width: 120px;
      justify-content: flex-end;
    }
  }
}

.form-render-content {
  flex-basis: 90%;
}

.operation-btns {
  flex: 1;

  button + button {
    margin-left: 12px;
  }
}

.align-center {
  text-align: center;
}
</style>
