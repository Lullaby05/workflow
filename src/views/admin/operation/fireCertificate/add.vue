<template>
  <div class="container">
    <!-- <a-card class="content-card"> -->
    <div class="header">
      <span class="title"
        >{{ type === "edit" ? "编辑" : "新增" }}动火安全作业证</span
      >
    </div>
    <div class="step">
      <el-steps :active="flag" finish-status="success" align-center>
        <el-step title="基础信息" style="font-size: 12px" />
        <el-step title="相关人员/单位" style="font-size: 12px" />
        <el-step title="安全措施确认" style="font-size: 12px" />
        <el-step title="预览提交" style="font-size: 12px" />
      </el-steps>
    </div>
    <div class="add-form-render-container" v-loading="!design">
      <formRenderContent
        ref="addFormRender"
        v-if="design"
        class="form-render-content"
        :design="design"
        status="edit"
        :key="flag"
      />
      <div class="form-render-btns">
        <!-- <a-button @click="router.back()">取消</a-button>
          <a-button type="primary" @click="handleAddCertification"
            >保存</a-button
          > -->
        <Button type="primary" v-if="flag == 0" @click="next()">下一步</Button>
        <Button type="default" v-if="flag > 0" @click="back()">上一步</Button>
        <Button type="primary" v-if="flag > 0 && flag < 3" @click="next()"
          >下一步</Button
        >
        <Button type="primary" v-if="flag == 3" @click="submit()">提交</Button>
      </div>
    </div>
    <!-- </a-card> -->
  </div>
</template>
<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import formRenderContent from "../components/formRenderContent.vue";
import { onBeforeMount, ref } from "vue";
import { useCertificate } from "../composition/useCertificate";
import { cloneDeep } from "lodash";
import { Button } from "vant";
import {
  addCertificate,
  getCertificateDetail,
  getFormModel,
  getNewCertificateCode,
  normalOperation,
} from "@/api/operation/operationApi";
import { ElMessage, ElSteps, ElStep } from "element-plus";
import { getUserDepts } from "@/api/org";
import { operationTypeEnum } from "../composition/useCertificateDict";
import store from "@/store";
const Message = ElMessage;
const router = useRouter();
const route = useRoute();
const { id = "", type = "add" } = route.query;
const userStore = store.state.loginUser;
const dept = ref<any>({});
const formItemsAll = ref<any>([]);

const {
  flatObject,
  searchFormItemForAdd,
  searchFormItem,
  generateValueKeyMap,
  formItemStep,
} = useCertificate();
const design = ref<any>();
const addFormRender = ref<any>();
const flag = ref<any>(0); // 0:基础信息， 1：相关人员， 2：安全措施附件， 3：预览提交
let defaultData: any = {}; // 保存默认数据，新增的时候只需要发formData
let valueKeyMap: any = {}; // valueKey对应的真实formItemId
let saveType = "";

onBeforeMount(async () => {
  if (type === "edit") {
    // 编辑，获取所有数据
    saveType = "edit";
    const res = await getCertificateDetail(id);
    const data = res.data.data.processProgress;
    dept.value = await getUserDepts(userStore.id);
    design.value = searchFormItem(data, "apply");
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap["applyDeptId"]]:dept.value[0].name,
    };
  } else if (type === "reApply") {
    // 重新生成
    const { data } = await getFormModel(operationTypeEnum.FIRE);
    defaultData = cloneDeep(data);
    const res = await getCertificateDetail(id);
    const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
      .data;
    saveType = "reApply";
    dept.value = await getUserDepts(userStore.id);
    data.progress = flatObject(data.process);
    data.formData = res.data.processProgress.formData;
    design.value = searchFormItemForAdd(data, "apply");
    if (!design.value) {
      Message.warning("暂无数据");
      return;
    }
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      ...design.value.formData,
      [valueKeyMap["certNum"]]: newestCode,
      [valueKeyMap["applyDeptId"]]: dept.value[0].name,
    };
  } else if (type === "add") {
    // 新增，获取默认数据
    saveType = "add";
    const { data } = await getFormModel(operationTypeEnum.FIRE);
    defaultData = cloneDeep(data);
    const newestCode = (await getNewCertificateCode(operationTypeEnum.FIRE))
      .data;
    dept.value = (await getUserDepts(userStore.id)).data;
    data.progress = flatObject(data.process);
    design.value = searchFormItemForAdd(data, "apply");
    formItemsAll.value = design.value.formItems;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    if (!design.value) {
      Message.warning("暂无数据");
      return;
    }
    valueKeyMap = generateValueKeyMap(design.value.formItems);
    design.value.formData = {
      [valueKeyMap["certNum"]]: newestCode,
      [valueKeyMap["applyDeptId"]]: dept.value[0].name ,
    };
    console.log("表单数据", newestCode,dept.value[0].name);
  }
});

const handleAddCertification = () => {
  addFormRender!.value.handleSave(async (formData: any) => {
    // 调接口新增作业证
    const formParamData = {
      ...formData,
      [valueKeyMap["applyDeptId"]]: dept.value[0].id,
    };
    if (saveType === "reApply" || saveType === "add") {
      const params = {
        ...defaultData,
        formData: formParamData,
        deptId: "1486186",
        processUsers: {},
      };
      await addCertificate(
        operationTypeEnum.FIRE,
        defaultData.processDefId,
        params
      );
      Message.success("新增成功");
      router.push({
        name: "FireCertificateIndex",
      });
    } else {
      // 编辑作业证，不改变原有流程
      const params = {
        action: "agree",
        formData: formParamData,
        instanceId: design.value.instanceId,
        processKey: "apply",
        taskId: design.value.progress[design.value.progress.length - 1].taskId,
        userId: userStore.id,
        nodeId: design.value.progress[design.value.progress.length - 1].nodeId,
      };
      await normalOperation(id as string, params);
      Message.success("编辑成功");
      router.back();
    }
  });
};

const next = () => {
  addFormRender!.value.handleSave(async (formData: any) => {
    console.log("表单校验",formData);
    flag.value = flag.value + 1;
    design.value.formItems = formItemStep(formItemsAll.value, flag.value);
    console.log("表单数据", design.value);
  });
  
 
};
const back = () => {
  flag.value = flag.value - 1;
  design.value.formItems = formItemStep(formItemsAll.value, flag.value);
  console.log("表单数据", design.value);
};
const submit = () => {
  Message.success("提交成功");
  flag.value = 0;
  design.value.formItems = formItemStep(formItemsAll.value, flag.value);
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
  // padding: 0px 20px 20px 20px;
  display: flex;
  flex-direction: column;

  .form-render-content {
    height: 100%;
  }
}

.form-render-btns {
  margin-top: 16px;
  text-align: center;
  display: flex;
  margin-bottom: 5px;

  button {
    flex: 1;
  }

  button + button {
    margin-left: 12px;
  }
}

.step {
  padding: 10px;
  background: #fff;
  margin: 10px;
}

:deep(.el-step__icon) {
  font-size: 0px;
  width: 12px;
  height: 12px;
}

:deep(.el-step__title) {
  font-size: 12px;
}

:deep(.el-step){
  .is-success{
    border-color: #1f94ea;
    .el-step__icon{
      background: #1f94ea;
    }
  }
  .is-process{
    border-color: #f59a23;
    .el-step__icon{
      background: #f59a23;
    }
  }
  
}
:deep(.el-step__main){
  .is-success{
    color: #1f94ea;
  }
  .is-process{
    color: #f59a23;
  }
}
</style>

<style>
:root {
  font-size: 12px;
}
</style>
