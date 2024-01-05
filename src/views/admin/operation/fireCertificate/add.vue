<template>
  <div class="container">
    <!-- <a-card class="content-card"> -->
      <div class="header">
        <span class="title"
          >{{ type === 'edit' ? '编辑' : '新增' }}动火安全作业证</span
        >
      </div>
      <div class="add-form-render-container" v-loading="!design">
        <formRenderContent
          ref="addFormRender"
          v-if="design"
          class="form-render-content"
          :design="design"
          status="edit"
        />
        <div class="form-render-btns">
          <!-- <a-button @click="router.back()">取消</a-button>
          <a-button type="primary" @click="handleAddCertification"
            >保存</a-button
          > -->
        </div>
      </div>
    <!-- </a-card> -->
  </div>
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import formRenderContent from '../components/formRenderContent.vue';
  import { onBeforeMount, ref } from 'vue';
  import { useCertificate } from '../composition/useCertificate';
  import { cloneDeep } from 'lodash';
  import {
    addCertificate,
    getCertificateDetail,
    getFormModel,
    getNewCertificateCode,
    normalOperation,
  } from '@/api/operation/operationApi';
  import { ElMessage } from 'element-plus';
  import { getUserDepts } from '@/api/org';
  import { operationTypeEnum } from '../composition/useCertificateDict';
  import store from '@/store';
  const Message = ElMessage
  const router = useRouter();
  const route = useRoute();
  const { id = '', type = 'add' } = route.query;
  const userStore = store.state.loginUser;
  const dept = ref<any>({});

  const {
    flatObject,
    searchFormItemForAdd,
    searchFormItem,
    generateValueKeyMap,
  } = useCertificate();
  const design = ref<any>();
  const addFormRender = ref<any>();
  let defaultData: any = {}; // 保存默认数据，新增的时候只需要发formData
  let valueKeyMap: any = {}; // valueKey对应的真实formItemId
  let saveType = '';

  onBeforeMount(async () => {
    if (type === 'edit') {
      // 编辑，获取所有数据
      saveType = 'edit';
      const res = await getCertificateDetail(id);
      const data = res.data.processProgress;
      dept.value = await getUserDepts(userStore.id);
      design.value = searchFormItem(data, 'apply');
      valueKeyMap = generateValueKeyMap(design.value.formItems);
      design.value.formData = {
        ...design.value.formData,
        [valueKeyMap['applyDeptId']]: dept.value[0].name,
      };
    } else if (type === 'reApply') {
      // 重新生成
      const { data } = await getFormModel(operationTypeEnum.FIRE);
      defaultData = cloneDeep(data);
      const res = await getCertificateDetail(id);
      const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
        .data;
      saveType = 'reApply';
      dept.value = await getUserDepts(userStore.id);
      data.progress = flatObject(data.process);
      data.formData = res.data.processProgress.formData;
      design.value = searchFormItemForAdd(data, 'apply');
      if (!design.value) {
        Message.warning('暂无数据');
        return;
      }
      valueKeyMap = generateValueKeyMap(design.value.formItems);
      design.value.formData = {
        ...design.value.formData,
        [valueKeyMap['certNum']]: newestCode,
        [valueKeyMap['applyDeptId']]: dept.value[0].name,
      };
    } else if (type === 'add') {
      // 新增，获取默认数据
      saveType = 'add';
      const { data } = await getFormModel(operationTypeEnum.FIRE);
      defaultData = cloneDeep(data);
      const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
        .data;
      dept.value = await getUserDepts(userStore.id);
      data.progress = flatObject(data.process);
      design.value = searchFormItemForAdd(data, 'apply');
      if (!design.value) {
        Message.warning('暂无数据');
        return;
      }
      valueKeyMap = generateValueKeyMap(design.value.formItems);
      design.value.formData = {
        [valueKeyMap['certNum']]: newestCode,
        [valueKeyMap['applyDeptId']]: dept.value[0].name,
      };
    }
  });

  const handleAddCertification = () => {
    addFormRender!.value.handleSave(async (formData: any) => {
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
        Message.success('新增成功');
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
          taskId:
            design.value.progress[design.value.progress.length - 1].taskId,
          userId: userStore.id,
          nodeId:
            design.value.progress[design.value.progress.length - 1].nodeId,
        };
        await normalOperation(id as string, params);
        Message.success('编辑成功');
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
    padding: 0px 20px 20px 20px;
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
