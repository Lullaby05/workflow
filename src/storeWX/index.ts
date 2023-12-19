import { createPinia } from 'pinia';
import useSafetyCertificationStore from './modules/safetyCertification';

const pinia = createPinia();

export {
  useSafetyCertificationStore,
};
export default pinia;
