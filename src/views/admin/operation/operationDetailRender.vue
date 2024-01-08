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
import { onUnmounted } from 'vue';
import { formatDate } from '@/utils/utils';

const route = useRoute();
const {
  title = '安全交底',
  activeKey = 'safeDisclosure',
  id = '1743577122653380609',
  token = '6975473e6a6c4d1386d4fb706e8564f0',
  refreshToken = 'dc2bad67555c4a148a204f5d823e6bd4',
  userId = 1,
  type = 'edit',
} = route.query;

localStorage.setItem('userId', userId as string);
localStorage.setItem('wflow-token', token as string);
localStorage.setItem('refreshToken', refreshToken as string);

// onUnmounted(() => {
//   localStorage.removeItem('userId');
//   localStorage.removeItem('wflow-token');
//   localStorage.removeItem('refreshToken');
// });

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
    if (res.code !== 0) return;
    res.data.processProgress.progress = res.data.processProgress.progress.map(
      (ele: any) => {
        return {
          ...ele,
          finishTime: ele.finishTime && formatDate(ele.finishTime),
          startTime: ele.startTime && formatDate(ele.startTime),
        };
      }
    );
    config.value = {
      formProcessData: res.data.processProgress,
      activeKey,
      certificateStatus: res.data.status,
      applyUserId: res.data.detail.applyUserId,
      id,
      type,
      certType: res.data.detail.certType,
      title,
    };
  });
};

getDetailData();
</script>
<style>
:root {
  font-size: 12px;
}
</style>
<style lang="less" scoped></style>
