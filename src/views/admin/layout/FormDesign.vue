<template>
  <el-container style="height: calc(100vh - 65px)">
    <el-aside>
      <div class="components-nav">
        <span @click="libSelect = 0">组件库</span>
      </div>
      <div>
        <div
          class="components"
          v-for="(group, i) in baseComponents"
          :key="i"
        >
          <p>{{ group.name }}</p>
          <ul>
            <draggable
              class="drag"
              :list="group.components"
              item-key="id"
              :sort="false"
              :group="{ name: 'form', pull: 'clone', put: false }"
              @start="isStart = true"
              @end="isStart = false"
              :clone="clone"
            >
              <template #item="{ element }">
                <li>
                  <icon
                    :name="element.icon"
                    style="width: 12px; height: 12px"
                  ></icon>
                  <span>{{ element.title }}</span>
                </li>
              </template>
            </draggable>
          </ul>
        </div>
      </div>
    </el-aside>

    <el-main class="layout-main">
      <div class="tool-nav">
        <div>
          <el-tooltip
            class="item"
            effect="dark"
            content="移动端"
            placement="bottom-start"
          >
            <icon
              :name="`el-icon-cellphone ${showMobile ? 'select' : ''}`"
              @click="showMobile = true"
            ></icon>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="PC端"
            placement="bottom-start"
          >
            <icon
              :name="`el-icon-monitor ${!showMobile ? 'select' : ''}`"
              @click="showMobile = false"
            ></icon>
          </el-tooltip>
        </div>
        <div>
          <el-tooltip
            class="item"
            effect="dark"
            content="预览表单"
            placement="bottom-start"
          >
            <div
              style="display: flex; align-items: center; cursor: pointer"
              @click="viewForms"
            >
              <icon name="el-icon-view"></icon>
              <span style="font-size: 13px; color: #666666">预览表单</span>
            </div>
          </el-tooltip>
        </div>
      </div>
      <div
        class="work-form"
        @click="release"
      >
        <div :class="{ mobile: showMobile, pc: !showMobile }">
          <div :class="{ bd: showMobile }">
            <div :class="{ 'form-content': showMobile }">
              <div class="form">
                <div
                  class="tip"
                  v-show="forms.length === 0 && !isStart"
                >
                  👈 请在左侧选择控件并拖至此处
                </div>
                <draggable
                  class="drag-from"
                  item-key="id"
                  v-model="forms"
                  v-bind="dragProps"
                  :component-data="{ tag: 'div', type: 'transition-group' }"
                  @start="
                    drag = true;
                    selectFormItem = null;
                  "
                  @end="drag = false"
                >
                  <template #item="{ element, index }">
                    <div
                      class="form-item"
                      @click.stop="selectItem(element)"
                      :style="getSelectedClass(element)"
                    >
                      <div class="form-header">
                        <p>
                          <span v-if="element.props.required">*</span
                          >{{ element.title }}
                        </p>
                        <div class="option">
                          <!--<icon name="el-icon-copy-document" @click="copy"></icon>-->
                          <icon
                            name="el-icon-close"
                            @click="del(index)"
                          ></icon>
                        </div>
                        <form-design-render :config="element" />
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <el-aside class="layout-param">
      <div
        class="tool-nav-r"
        v-if="selectFormItem"
      >
        <icon
          :key="selectFormItem.icon"
          :name="selectFormItem.icon"
          style="margin-right: 5px; font-size: medium"
        ></icon>
        <span>{{ selectFormItem.title }}</span>
      </div>
      <div v-if="!selectFormItem || forms.length === 0">
        <div class="title tool-nav-r">
          <icon name="el-icon-tickets"></icon>
          表单联动
        </div>
        <form-config />
      </div>
      <div
        style="text-align: left; padding: 10px"
        v-else
      >
        <form-component-config :key="selectFormItem.id" />
      </div>
    </el-aside>
    <w-dialog
      clickClose
      width="750px"
      :border="false"
      @ok="doPrint"
      title="打印预览"
      okText="打印"
      v-model="viewPrintVisible"
    >
      <div
        id="print"
        v-if="viewPrintVisible"
        v-html="printContent"
      ></div>
    </w-dialog>
    <w-dialog
      clickClose
      width="700px"
      :showFooter="false"
      :border="false"
      title="表单预览"
      v-model="viewFormVisible"
    >
      <template #title>
        <div>
          <span>表单预览</span>
          <el-radio-group
            style="margin: 0 30px"
            v-model="forViewMode"
          >
            <el-radio label="PC">电脑端</el-radio>
            <el-radio label="MOBILE">手机端（需保存才生效）</el-radio>
          </el-radio-group>
          <el-popover
            placement="bottom"
            title="手机扫码预览表单"
            width="195"
            trigger="click"
          >
            <qrcode-vue
              :value="qrCode"
              :size="170"
              level="H"
            />
            <template #reference>
              <el-link type="primary">扫码预览</el-link>
            </template>
          </el-popover>
          <el-link
            v-if="customPrint"
            style="margin-left: 30px"
            type="primary"
            @click="showPrint"
            >打印预览</el-link
          >
        </div>
      </template>
      <div v-show="forViewMode === 'PC'">
        <form-render
          ref="form"
          v-model="formData"
          :forms="formsTemp"
          mode="PC"
          :config="formConfigTemp"
        />
      </div>
      <div v-if="forViewMode === 'MOBILE'">
        <div style="display: flex; justify-content: center">
          <iframe
            width="400px"
            height="700px"
            frameborder="0"
            :src="`/#/admin/design?code=${$route.query.code}&mobilePreview=true`"
          ></iframe>
        </div>
      </div>
    </w-dialog>
  </el-container>
</template>

<script>
import QrcodeVue from 'qrcode.vue';
import draggable from 'vuedraggable';
import FormRender from '@/views/common/form/FormRender.vue';
import FormDesignRender from '@/views/admin/layout/form/FormDesignRender.vue';
import FormComponentConfig from '@/views/common/form/FormComponentConfig.vue';
import { baseComponents } from '@/views/common/form/ComponentsConfigExport';
import MobilePreview from './FormDesignMobilePreview.vue';
import Editor from '../../../components/common/Editor.vue';
import FormConfig from '../../common/form/config/FormConfig.vue';
import Print, { bindVar, getVal } from '@/utils/print';

const varExp = /\${\w+}/gi;

export default {
  name: 'FormDesign',
  components: {
    Editor,
    draggable,
    FormComponentConfig,
    FormDesignRender,
    FormRender,
    MobilePreview,
    QrcodeVue,
    FormConfig,
  },
  data() {
    return {
      formConfigTemp: {},
      formsTemp: {},
      formData: {},
      libSelect: 0,
      printContent: '',
      forViewMode: 'PC',
      viewFormVisible: false,
      viewPrintVisible: false,
      isStart: false,
      showMobile: true,
      baseComponents,
      select: null,
      drag: false,
      qrcode: null,
      dragProps: {
        animation: 300,
        group: 'form',
        disabled: false,
        sort: true,
        ghostClass: 'choose',
      },
    };
  },
  computed: {
    formConfig() {
      return this.$store.state.design.formConfig;
    },
    qrCode() {
      return window.location.href + '&mobilePreview=true';
    },
    formatFormData() {
      let val = {};
      getVal(this.formData, this.forms, val);
      return val;
    },
    forms: {
      get() {
        return this.$store.state.design.formItems;
      },
      set(val) {
        // 这里是添加到最外层的表单项
        const moduleBlockMap = [];
        // 只需要添加最外层的ModuleBlock
        val.forEach((item) => {
          if (item.name === 'ModuleBlock') {
            // 如果是新增的数据是ModuleBlock则将该表单格式化后放入ModuleBlockMap
            moduleBlockMap.push({ dictKey: item.title, dictValue: item.id });
          }
        });
        // 最后将这个map放入store中
        this.$store.commit('setCertProcessFormKeys', moduleBlockMap);
        this.$store.state.design.formItems = val;
      },
    },
    customPrint() {
      return this.$store.state.design.settings.customPrint;
    },
    printTemplate() {
      return this.$store.state.design.settings.printTemplate || '';
    },
    selectFormItem: {
      get() {
        return this.$store.state.selectFormItem;
      },
      set(val) {
        this.$store.state.selectFormItem = val;
      },
    },
    nodeMap() {
      return this.$store.state.nodeMap;
    },
  },
  methods: {
    release() {
      this.selectFormItem = null;
    },
    copy(node, index) {
      this.form.splice(index + 1, 0, Object.assign({}, node));
    },
    getId() {
      return (
        'field' +
        (Math.floor(Math.random() * (99999 - 10000)) + 10000).toString() +
        new Date().getTime().toString().substring(5)
      );
    },
    showPrint() {
      this.viewPrintVisible = true;
      let val = {};
      getVal(this.formatFormData, this.forms, val);
      this.$nextTick(() => {
        bindVar(this.printTemplate, val, 'print');
      });
    },
    del(index) {
      this.$confirm(
        '删除组件将会连带删除包含该组件的条件以及相关设置，是否继续?',
        '提示',
        {
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning',
        }
      ).then(() => {
        if (
          this.forms[index].name === 'SpanLayout' ||
          this.forms[index].name === 'ModuleBlock'
        ) {
          // 删除之前先根据id删除processFormKey中的下拉
          this.$store.commit('clearCertProcessFormKey', this.forms[index].id);
          //删除的是分栏则遍历删除分栏内所有子组件
          this.forms[index].props.items.forEach((item) => {
            this.removeFormItemAbout(item);
          });
          this.forms[index].props.items.length = 0;
        } else {
          this.removeFormItemAbout(this.forms[index]);
        }
        this.forms.splice(index, 1);
      });
    },
    async removeFormItemAbout(item) {
      this.nodeMap.forEach((node) => {
        //搜寻条件，进行移除
        if (node.type === 'CONDITION') {
          node.props.groups.forEach((group) => {
            let i = group.cids.remove(item.id);
            if (i > -1) {
              //从子条件移除
              group.conditions.splice(i, 1);
            }
          });
        }
        //搜寻权限，进行移除
        if (
          node.type === 'ROOT' ||
          node.type === 'APPROVAL' ||
          node.type === 'CC'
        ) {
          node.props.formPerms.removeByKey('id', item.id);
          if (node.props.formUser && node.props.formUser.includes(item.id)) {
            node.props.formUser = [];
          }
        }
      });
    },
    clone(obj) {
      const clone = JSON.parse(JSON.stringify(obj));
      clone.id = this.getId();
      return clone;
    },
    viewForms() {
      this.forViewMode = 'PC';
      this.viewFormVisible = true;
      this.formData = {};
      this.formsTemp = this.$deepCopy(this.forms);
      this.formConfigTemp = this.$deepCopy(this.formConfig);
    },
    selectItem(cp) {
      this.selectFormItem = cp;
    },
    getSelectedClass(cp) {
      return this.selectFormItem && this.selectFormItem.id === cp.id
        ? 'border-left: 4px solid #409eff'
        : '';
    },
    validateItem(err, titleSet, item) {
      if (
        titleSet.has(item.title) &&
        item.name !== 'SpanLayout' &&
        item.name !== 'ModuleBlock'
      ) {
        err.push(`表单 ${item.title} 名称重复`);
      }
      titleSet.add(item.title);
      if (item.name === 'SelectInput' || item.name === 'MultipleSelect') {
        if (item.props.options.length === 0) {
          err.push(`${item.title} 未设置选项`);
        }
      } else if (item.name === 'TableList') {
        if (item.props.columns.length === 0) {
          err.push(`明细表 ${item.title} 内未添加组件`);
        }
      } else if (item.name === 'SpanLayout') {
        if (item.props.items.length === 0) {
          err.push('分栏内未添加组件');
        } else {
          item.props.items.forEach((sub) =>
            this.validateItem(err, titleSet, sub)
          );
        }
      }
    },
    validate() {
      let err = [];
      if (this.forms.length > 0) {
        let titleSet = new Set();
        this.forms.forEach((item) => {
          //主要校验表格及分栏/选择器/表单名称/是否设置
          this.validateItem(err, titleSet, item);
        });
      } else {
        err.push('表单为空，请添加组件');
      }
      return err;
    },
    doPrint() {
      Print(document.getElementById('print'));
    },
  },
};
</script>

<style lang="less" scoped>
.choose {
  border: 1px dashed @theme-primary !important;
}

iframe {
  border-radius: 8px;
  box-shadow: 0 0 10px #dcdbdb;
}

.process-form {
  :deep(.el-form-item__label) {
    padding: 0 0;
  }
}

.components-nav {
  box-sizing: content-box;
  display: flex;
  align-items: center;
  margin: 12px 12px 0;
  height: 28px;
  box-shadow: 0 2px 4px 0 rgba(17, 31, 44, 0.04);
  border: 1px solid #ecedef;
  border-radius: 16px;
  background-color: #fff;

  .selected {
    color: @theme-primary;
  }

  .border {
    border-left: 1px solid #f5f6f6;
    border-right: 1px solid #f5f6f6;
  }

  span {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: rgba(17, 31, 44, 0.72);
    cursor: pointer;

    &:hover {
      color: @theme-primary;
    }
  }
}

.components {
  overflow-x: hidden;
  overflow-y: scroll;
  //margin-top: 20px;
  //padding: 0 20px;
  font-size: 12px;
  width: 100%;
  color: rgba(17, 31, 44, 0.85);

  & > p {
    padding: 0 20px;
  }

  .drag {
    margin-left: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    li {
      text-align: center;
      display: flex;
      align-items: center;
      width: 124px;
      height: 38px;
      margin-bottom: 12px;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: grab;
      background-color: #fff;

      &:hover {
        border: 1px solid @theme-primary;
        color: @theme-primary;
      }

      :deep(.icon) {
        margin: 0 12px;
      }
    }

    li:nth-child(odd) {
      margin-right: 8px;
    }
  }
}

:deep(.el-main) {
  padding: 0;
}

.layout-main {
  background-color: #feffff;

  .tool-nav {
    font-size: medium;
    padding: 8px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;

    div:first-child {
      display: inline-block;
      text-align: left;

      :deep(.icon) {
        margin-right: 10px;
      }
    }

    div:last-child {
      float: right;

      :deep(.icon) {
        margin-left: 10px;
      }
    }

    :deep(.icon) {
      color: #7a7a7a;
      cursor: pointer;

      &:hover {
        color: #4b4b4b;
      }
    }
  }

  .work-form {
    margin: 0 auto;
    height: calc(100% - 38px);
    overflow-y: auto;
    background: rgb(245, 246, 246);
    border-left: 1px solid rgb(235, 236, 238);
    border-right: 1px solid rgb(235, 236, 238);

    .pc {
      margin-top: 4%;

      .drag-from {
        height: calc(100vh - 190px);
        background-color: rgb(245, 246, 246);

        .form-item,
        li {
          cursor: grab;
          background: #ffffff;
          padding: 10px;
          border: 1px solid #ebecee;
          margin: 5px 0;
        }
      }
    }

    .mobile {
      margin-left: auto;
      margin-right: auto;
      width: 360px;
      max-height: 640px;
      margin-top: 4%;
      border-radius: 24px;
      box-shadow: 0 8px 40px 0 rgba(17, 31, 44, 0.12);

      .bd {
        border: 1px solid rgba(17, 31, 44, 0.08);
        border-radius: 24px;
        padding: 10px 10px;
        background-color: #ffffff;

        .form-content {
          padding: 3px 2px;
          border-radius: 14px;
          background-color: #f2f4f5;

          .drag-from {
            width: 100%;
            height: calc(100vh - 190px);
            min-height: 200px;
            max-height: 600px;
          }

          .form {
            overflow-y: auto;
            width: 100%;
            display: inline-block;
            max-height: 640px;

            .form-item,
            li {
              border: 1px solid #ffffff;
              list-style: none;
              background: #ffffff;
              padding: 10px;
              margin: 5px 0;
              cursor: grab;
            }
          }
        }
      }
    }

    .tip {
      //float: left;
      margin: 0 auto;
      width: 65%;
      max-width: 400px;
      padding: 35px 20px;
      border-radius: 10px;
      border: 1px dashed rgba(25, 31, 37, 0.12);
      margin-top: 50px;
      text-align: center;
      font-size: 14px;
      color: rgb(122, 122, 122);
      z-index: 9999;

      &:hover {
        border: 1px dashed @theme-primary;
      }
    }
  }
}

.layout-param {
  text-align: center;
  font-size: 14px;
  color: rgb(122, 122, 122);

  .tool-nav-r {
    display: flex;
    text-align: left;
    font-size: small;
    border-left: 1px solid #ebecee;
    padding: 9px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;
  }

  .title {
    font-style: normal;
    display: flex;
    align-items: center;

    .icon {
      margin-right: 10px;
    }
  }
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.select {
  color: #4b4b4b !important;
}

.form-header {
  font-size: small;
  color: #818181;
  text-align: left;
  position: relative;
  background-color: #fff;

  p {
    position: relative;
    margin: 0 0 10px 0;

    span {
      position: absolute;
      left: -8px;
      top: 3px;
      color: rgb(217, 0, 19);
    }
  }

  .option {
    position: absolute;
    top: -10px;
    right: -10px;

    :deep(.icon) {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;

      &:hover {
        color: #f56c6c;
      }
    }
  }
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: #f8f8f8;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #e8e8e8;
}
</style>
