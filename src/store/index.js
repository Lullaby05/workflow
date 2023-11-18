import * as Vuex from 'vuex';

export default Vuex.createStore({
  state: {
    nodeMap: new Map(),
    isEdit: null,
    loginUser: JSON.parse(localStorage.getItem('loginUser') || '{}'),
    selectedNode: {},
    selectFormItem: null,
    design: {},
    certValueKeys: [],
    certProcessKeys: [],
    certProcessFormKeys: [],
  },
  mutations: {
    selectedNode(state, val) {
      state.selectedNode = val;
    },
    loadForm(state, val) {
      state.design = val;
    },
    setIsEdit(state, val) {
      state.isEdit = val;
    },
    setCertValueKeys(state, val) {
      state.certValueKeys = val;
    },
    setCertProcessKeys(state, val) {
      state.certProcessKeys = val;
    },
    setCertProcessKeyDisabled(state, { newVal, oldVal }) {
      // 如果修改了processKey，则需要禁用新值，放开旧值
      state.certProcessKeys = state.certProcessKeys.map((item) => {
        if (item.dictValue === oldVal) {
          item.disabled = false
        }
        if (item.dictValue === newVal) {
          item.disabled = true;
        }
        return item;
      });
    },
    setCertProcessFormKeys(state, val) {
      // key为moduleBlock的名称，value为moduleBlock的id（fieldId）
      state.certProcessFormKeys = val;
    },
    setCertProcessFormKeysName(state, val) {
      // 通过moduleBlock的id获取moduleBlock的title
      const currentKey = state.certProcessFormKeys.find((item) => {
        return item.dictValue === val.id;
      });
      // 变更对应的title
      if (currentKey) {
        currentKey.dictKey = val.title
      }
    },
    clearCertProcessFormKey(state, val) {
      // 如果modulelBlock组件少了一个，就需要从下拉选择中删除掉这条数据
      // 通过id进行删除
      state.certProcessFormKeys = state.certProcessFormKeys.filter((item) => {
        return item.dictValue !== val;
      });
    },
    setCertProcessFormKeyDisabled(state, { newVal, oldVal }) {
      // 如果修改了certProcessFormKeys，则需要禁用新值，放开旧值
      state.certProcessFormKeys = state.certProcessFormKeys.map((item) => {
        if (item.dictValue === oldVal) {
          item.disabled = false
        }
        if (item.dictValue === newVal) {
          item.disabled = true;
        }
        return item;
      });
    },
  },
  getters: {},
  actions: {},
  modules: {},
});
