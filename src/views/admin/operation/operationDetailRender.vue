<template>
  <component
    v-if="config"
    :is="components[activeKey as keyof typeof components]"
    v-bind.sync="config"
  />
</template>
<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getCertificateDetail } from '@/api/operation/operationApi';

const route = useRoute();
const {
  title = '作业分析',
  activeKey = 'analyse',
  id = '1742390554882338818',
  token = 'f2910a4daf4044c4afa67292d82fb4e7',
  refreshToken = 'f5c40819799d40bd8bd60b595ff61e71',
  userId = 1,
  type = 'detail',
} = route.query;

localStorage.setItem('userId', userId as string);
localStorage.setItem('wflow-token', token as string);
localStorage.setItem('refreshToken', refreshToken as string);

document.title = title as string;

const components = {
  apply: defineAsyncComponent(
    () => import('../../operation/components/basicInfo.vue')
  ),
  analyse: defineAsyncComponent(
    () => import('../../operation/components/analysisInfo.vue')
  ),
  review: defineAsyncComponent(
    () => import('../../operation/components/writtenExaminationInfo.vue')
  ),
  siteCheck: defineAsyncComponent(
    () => import('../../operation/components/siteVerificationInfo.vue')
  ),
  extraNode: defineAsyncComponent(
    () => import('../../operation/components/extraNodeInfo.vue')
  ),
  safeDisclosure: defineAsyncComponent(
    () => import('../../operation/components/securityDisclosure.vue')
  ),
  operationStart: defineAsyncComponent(
    () => import('../../operation/components/operationStartInfo.vue')
  ),
  acceptance: defineAsyncComponent(
    () => import('../../operation/components/closeInfo.vue')
  ),
};

const config = ref();

const getDetailData = () => {
  getCertificateDetail(id as string).then((res: any) => {
    config.value = {
      formProcessData: res.data.processProgress,
      activeKey,
      certificateStatus: res.data.detail.status,
      id,
      type,
    };
  });
};

getDetailData();
</script>
<style></style>
