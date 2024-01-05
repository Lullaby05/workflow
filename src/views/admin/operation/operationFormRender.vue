<template>
  <div class="container">
    <div class="header">
      <!-- <icon-left @click="router.back()" /> -->
      <span class="title"
        >{{ type === 'edit' ? '编辑' : '新增' }}动火安全作业证</span
      >
    </div>
    <div
      class="add-form-render-container"
      v-loading="!design"
    >
      <formRenderContent
        ref="addFormRender"
        v-if="design"
        :design="design"
        status="edit"
      />
      <div class="form-render-btns">
        <el-button @click="router.back()">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddCertification"
          >保存</el-button
        >
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';
import formRenderContent from '../../operation/components/formRenderContent.vue';
import { onBeforeMount, ref,onRenderTracked } from 'vue';
import { useCertificate } from '../../operation/composition/useCertificate';
import { cloneDeep } from 'lodash';
// import { useUserStore } from '@/store';
import { useSafetyCertificationStore } from '../../../storeWX';
import {
  addCertificate,
  getCertificateDetail,
  getFormModel,
  getNewCertificateCode,
  normalOperation,
} from '@/api/operation/operationApi';
import { ElMessage, ElCard, ElButton } from 'element-plus';
import { getUserDepts } from '@/api/org';
import { operationTypeEnum } from '../../operation/composition/useCertificateDict';

const store = useSafetyCertificationStore();
const router = useRouter();
const route = useRoute();
const { id = '', type = 'add' } = route.query;
// const userStore = useUserStore();
const dept = ref({});

const {
  flatObject,
  searchFormItemForAdd,
  searchFormItem,
  generateValueKeyMap,
} = useCertificate();
const design = ref();
const addFormRender = ref();
let defaultData = {}; // 保存默认数据，新增的时候只需要发formData
let valueKeyMap = {}; // valueKey对应的真实formItemId
let saveType = '';
store.setCurrentOperationType(operationTypeEnum.BLINDPLATE);

onBeforeMount(async () => {
  if (type === 'edit') {
    // 编辑，获取所有数据
    saveType = 'edit';
    const res = await getCertificateDetail(id);
    const data = res.data.processProgress;
    dept.value = await getUserDepts('1');
    design.value = searchFormItem(data, 'apply');
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap['applyDeptId']]: dept.value.data[0].name,
    };
  } else if (type === 'reApply') {
    // 重新生成
    const { data } = await getFormModel(operationTypeEnum.FIRE);
    defaultData = cloneDeep(data);
    const res = await getCertificateDetail(id);
    const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
      .data;
    saveType = 'reApply';
    dept.value = await getUserDepts('1');
    data.progress = flatObject(data.process);
    data.formData = res.data.processProgress.formData;
    design.value = searchFormItemForAdd(data, 'apply');
    if (!design.value) {
      ElMessage.warning('暂无数据');
      return;
    }
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap['certNum']]: newestCode,
      [valueKeyMap['applyDeptId']]: dept.value.data[0].name,
    };
  } else if (type === 'add') {
    // 新增，获取默认数据
    saveType = 'add';
    const { data } = await getFormModel(operationTypeEnum.FIRE);
    defaultData = cloneDeep(data);
    const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
      .data;
    dept.value = await getUserDepts('1');
    data.progress = flatObject(data.process);
    design.value = searchFormItemForAdd(data, 'apply');
    if (!design.value) {
      ElMessage.warning('暂无数据');
      return;
    }
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      [valueKeyMap['certNum']]: newestCode,
      [valueKeyMap['applyDeptId']]: dept.value.data[0].name,
    };
  }
});

const handleAddCertification = () => {
  addFormRender.value.handleSave(async (formData) => {
    // 调接口新增作业证
    const formParamData = {
      ...formData,
      [valueKeyMap['applyDeptId']]: dept.value[0].id,
    };
    if (saveType === 'reApply' || saveType === 'add') {
      const params = {
        ...defaultData,
        formData: formParamData,
        deptId: '1486186',
        processUsers: {},
      };
      await addCertificate(
        operationTypeEnum.FIRE,
        defaultData.processDefId,
        params
      );
      ElMessage.success('新增成功');
      router.push({
        name: 'FireCertificateIndex',
      });
    } else {
      // 编辑作业证，不改变原有流程
      const params = {
        action: 'agree',
        formData: formParamData,
        instanceId: design.value.instanceId,
        processKey: 'apply',
        taskId: design.value.progress[design.value.progress.length - 1].taskId,
        userId: userStore.userId,
        nodeId: design.value.progress[design.value.progress.length - 1].nodeId,
      };
      await normalOperation(id, params);
      ElMessage.success('编辑成功');
      router.back();
    }
  });
};

</script>
<style lang="less" scoped>
.header {
  font-size: 18px;
  margin-bottom: 30px;

  .title {
    margin-left: 8px;
  }
}

.add-form-render-container {
  display: flex;
  flex-direction: column;

  .form-render-content {
    height: 100%;
  }
}

.form-render-btns {
  margin-top: 16px;
  text-align: center;

  button + button {
    margin-left: 12px;
  }
}
</style>
