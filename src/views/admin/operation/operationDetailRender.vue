<template>
  <component
    v-if="config"
    :is="components[activeKey as keyof typeof components]"
    v-bind.sync="config"
    @jumpToEditApply="jumpToEditApply"
    @jumpToApplyInfo="jumpToApplyInfo"
    @jumpToHandle="jumpToHandle"
  />
</template>
<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  getCertificateBaseDetail,
  getCertificateDetail,
} from '@/api/operation/operationApi';
import { onUnmounted } from 'vue';
import { formatDate } from '@/utils/utils';
import { inject } from 'vue';
import { getBtnPermission } from '@/api/operation';
import { operationTypeEnum } from '../forOperation/enum/enum';
const wx: any = inject('wx');

const route = useRoute();
const {
  title = '作业实施信息',
  activeKey = 'operationStart',
  id = '1743577122653380609',
  token = '',
  refreshToken = '',
  userId = 1,
  type = 'edit',
  backStep = 1,
} = route.query;

localStorage.setItem('userId', userId as string);
localStorage.setItem('wflow-token', token as string);
localStorage.setItem('refreshToken', refreshToken as string);

onUnmounted(() => {
  localStorage.removeItem('userId');
  localStorage.removeItem('wflow-token');
  localStorage.removeItem('refreshToken');
});

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
  preview: defineAsyncComponent(
    () => import('../../operation/components/operationInfoView.vue')
  ),
};

const config = ref();

const cerTypeEnum = {
  [operationTypeEnum.BLINDPLATE]: 'BlindPlateCertificate',
  [operationTypeEnum.CONFINEDSPACE]: 'ConfinedSpaceCertificate',
  [operationTypeEnum.GROUND]: 'GroundCertificate',
  [operationTypeEnum.HIGHALTITUDE]: 'HighAltitudeCertificate',
  [operationTypeEnum.FIRE]: 'FireCertificate',
  [operationTypeEnum.HOIST]: 'HoistCertificate',
  [operationTypeEnum.BROKENROAD]: 'BrokenRoadCertificate',
  [operationTypeEnum.TEMPELECTRICITY]: 'TempElectricityCertificate',
};

const getDetailData = async () => {
  const {
    data: { data: detail },
  } = await getCertificateBaseDetail(id as string);
  const {
    data: { data: btn },
  } = await getBtnPermission();
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
    const certTypeStr = cerTypeEnum[detail.certType as operationTypeEnum];
    config.value = {
      formProcessData: res.data.processProgress,
      originalProgress: res.data.originalProgress,
      activeKey,
      certificateStatus: detail.status,
      applyUserId: detail.applyUserId,
      detail: detail,
      id,
      type,
      certType: detail.certType,
      btnPermission: btn
        .filter((ele: string) => ele.includes(certTypeStr))
        .map((ele: string) => ele.replace(certTypeStr, '')),
      title,
      backStep,
    };
  });
};

getDetailData();

const jumpToEditApply = () => {
  wx.miniProgram.redirectTo({
    url: `/mainFeaturePage/pages/workplace/operation/components/operationAdd/index?certType=${config.value.certType}&id=${config.value.id}&type=edit`,
  });
};

const jumpToApplyInfo = () => {
  wx.miniProgram.navigateTo({
    url: `/mainFeaturePage/pages/workplace/operation/fireOperation/handle/index?processKey=preview&id=${config.value.id}&type=detail`,
  });
};
const jumpToHandle = (processKey: any) => {
  wx.miniProgram.navigateTo({
    url: `/mainFeaturePage/pages/workplace/operation/fireOperation/handle/index?processKey=${processKey}&id=${
      config.value.id
    }&type=edit&backStep=2&name=${title?.slice(0, -2)}`,
  });
};
</script>
<style>
:root {
  font-size: 12px;
}
</style>
<style lang="less" scoped></style>
