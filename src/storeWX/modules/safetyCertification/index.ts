import { operationTypeEnum } from '@/views/operation/composition/useCertificateDict';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const useRiskStore = defineStore('safetyCertificationStore', () => {
  const currentOperationType = ref<string>('');
  const setCurrentOperationType = (type: string) => {
    currentOperationType.value = type;
  };

  const needAnalysis = computed(() => {
    // 需要分析的作业字典值
    return [
      operationTypeEnum.CONFINEDSPACE,
      operationTypeEnum.FIRE,
      operationTypeEnum.TEMPELECTRICITY,
    ].includes(currentOperationType.value as operationTypeEnum);
  });

  return {
    currentOperationType,
    setCurrentOperationType,
    needAnalysis,
  };
});

export default useRiskStore;
