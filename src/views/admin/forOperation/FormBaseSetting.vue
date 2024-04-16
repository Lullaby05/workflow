<template>
  <div
    class="base-setup"
    @click="showIconSelect = false"
  >
    <el-form
      ref="baseSetting"
      :model="setup"
      label-position="top"
      label-width="80px"
    >
      <el-form-item label="表单图标">
        <icon
          :key="setup.logo.icon"
          :name="setup.logo.icon"
          :style="'background:' + setup.logo.background"
        ></icon>
        <span class="change-icon">
          <span>
            <span>选择背景色</span>
            <el-color-picker
              v-model="setup.logo.background"
              show-alpha
              size="default"
              :predefine="colors"
            ></el-color-picker>
          </span>
          <span>
            <span>选择图标</span>
            <el-popover
              placement="bottom-start"
              width="402"
              trigger="click"
            >
              <div class="icon-select">
                <icon
                  :name="i"
                  v-for="(i, id) in icons"
                  :key="id"
                  @click="setup.logo.icon = i"
                ></icon>
              </div>
              <template #reference>
                <icon
                  :key="setup.logo.icon"
                  :name="setup.logo.icon"
                ></icon>
              </template>
            </el-popover>
            <!--<icon :name="setup.icon" @click.stop="showIconSelect = true"></icon>-->
          </span>
        </span>
      </el-form-item>
      <el-form-item
        label="表单名称"
        :rules="getRule('请输入表单名称')"
        prop="formName"
      >
        <el-input
          v-model="setup.formName"
          size="default"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="作业类型"
        :rules="getRule('请选择作业类型')"
        prop="operationType"
      >
        <el-select
          v-model="setup.operationType"
          filterable
        >
          <el-option
            v-for="item in operationTypes"
            :key="item.dictValue"
            :label="item.dictKey"
            :value="item.dictValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="企业名称"
        :rules="getRule('请输入企业名称')"
        prop="companyName"
      >
        <el-select
          disabled
          v-model="setup.companyName"
          placeholder="请选择企业名称"
          clearable
          filterable
          size="default"
        >
          <el-option value="1">1</el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="所在分组"
        class="group"
        prop="groupId"
      >
        <el-select
          v-model="setup.groupId"
          disabled
          size="default"
          placeholder="请选择分组"
        >
          <el-option
            v-for="(op, index) in fromGroup"
            :key="index"
            :label="op.groupName"
            :value="op.groupId"
          ></el-option>
        </el-select>
        <el-popover
          placement="bottom-end"
          title="新建表单分组"
          width="300"
          trigger="click"
        >
          <el-input
            v-model="newGroup"
            size="default"
            placeholder="请输入新的分组名"
          >
            <template #append>
              <el-button
                type="primary"
                @click="addGroup"
                >提交</el-button
              >
            </template>
          </el-input>
          <template #reference>
            <el-button
              icon="el-icon-plus"
              size="default"
              type="primary"
              >新建分组</el-button
            >
          </template>
        </el-popover>
      </el-form-item>
      <el-form-item label="表单说明">
        <el-input
          placeholder="请输入表单说明"
          v-model="setup.remark"
          size="default"
          type="textarea"
          show-word-limit
          :autosize="{ minRows: 2, maxRows: 5 }"
          maxlength="500"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="消息通知方式"
        :rules="getRule('请选择消息通知方式')"
      >
        <el-select
          v-model="setup.settings.notify.types"
          size="default"
          placeholder="选择消息通知方式"
          style="width: 30%"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="(wc, index) in notifyTypes"
            :label="wc.name"
            :key="index"
            :value="wc.type"
          ></el-option>
        </el-select>
        <el-input
          v-model="setup.settings.notify.title"
          size="default"
          style="width: 68%; float: right"
          placeholder="消息通知标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="谁可以管理此表单">
        <el-select
          v-model="setup.settings.admin"
          size="default"
          @click="selectUser('admin')"
          value-key="name"
          class="select-u"
          placeholder="请选择可以管理此表单的人员"
          clearable
          multiple
        >
          <el-option
            v-for="(wc, index) in setup.settings.admin"
            :label="wc.name"
            :key="index"
            :value="wc"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <org-picker
      title="请选择可以管理此表单的人员"
      multiple
      ref="orgPicker"
      :selected="select"
      @ok="selected"
    ></org-picker>
  </div>
</template>

<script>
import OrgPicker from '@/components/common/OrgPicker.vue';
import { getModelGroups, createModelGroup } from '@/api/modelGroup';
import { getValueKeyEnum, getProcessKeyEnum } from '@/api/operation';
import iconfont from '@/assets/iconfont/iconfont.json';
import { operationTypeEnum } from './enum/enum.ts';

export default {
  name: 'FormBaseSetting',
  components: { OrgPicker },
  data() {
    return {
      nowUserSelect: null,
      showIconSelect: false,
      select: [],
      newGroup: '',
      fromGroup: [],
      notifyTypes: [
        { type: 'APP', name: '应用内通知' },
        { type: 'EMAIL', name: '邮件通知' },
        { type: 'SMS', name: '短信通知' },
        { type: 'WX', name: '微信通知' },
        { type: 'DING', name: '钉钉通知' },
      ],
      operationTypes: [
        { dictKey: '盲板抽堵', dictValue: operationTypeEnum.BLINDPLATE },
        { dictKey: '受限空间', dictValue: operationTypeEnum.CONFINEDSPACE },
        { dictKey: '动土', dictValue: operationTypeEnum.GROUND },
        { dictKey: '高处', dictValue: operationTypeEnum.HIGHALTITUDE },
        { dictKey: '动火', dictValue: operationTypeEnum.FIRE },
        { dictKey: '吊装', dictValue: operationTypeEnum.HOIST },
        { dictKey: '断路', dictValue: operationTypeEnum.BROKENROAD },
        { dictKey: '临时用电', dictValue: operationTypeEnum.TEMPELECTRICITY },
      ],
      colors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577',
      ],
      icons: [
        'el-icon-deletefilled',
        'el-icon-tools',
        'el-icon-goods',
        'el-icon-warning',
        'el-icon-circleplus',
        'el-icon-camerafilled',
        'el-icon-promotion',
        'el-icon-briefcase',
        'el-icon-platform',
        'el-icon-avatar',
        'el-icon-histogram',
        'el-icon-stamp',
        'el-icon-checked',
      ],
      rules: {
        formName: [{}],
        groupId: [],
      },
    };
  },
  computed: {
    setup() {
      const setup = this.$store.state.design;
      const { companyName } = this.$store.state.loginUser;
      setup.companyName = companyName;
      if (setup.operationType) {
        // 初始化
        this.handleChangeOperationType(setup.operationType);
      }
      return setup;
    },
  },
  created() {
    this.loadIconfont();
  },
  mounted() {
    this.getGroups();
  },
  methods: {
    handleChangeOperationType(operationType) {
      // if (operationType) {
      //   this.$confirm(
      //     '您确定要修改作业类型吗',
      //     '修改作业类型可能会导致数据丢失，请谨慎操作！',
      //     {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消',
      //       type: 'warning',
      //     }
      //   )
      //     .then(() => {

      //     })
      // }
      const clearProcessKey = (treeData) => {
        treeData.props.processKey = '';
        if (Object.keys(treeData.children).length) {
          clearProcessKey(treeData.children);
        }
        return treeData;
      };
      clearProcessKey(this.setup.process);
      const type = operationType || this.setup.operationType;
      getValueKeyEnum(type).then((res) => {
        const dataMap = [];
        Object.keys(res.data.data).forEach((key) => {
          dataMap.push({
            dictKey: res.data.data[key],
            dictValue: key,
          });
        });
        this.$store.commit('setCertValueKeys', dataMap);
      });
      getProcessKeyEnum(type).then((res) => {
        const dataMap = [];
        Object.keys(res.data.data).forEach((key) => {
          dataMap.push({
            dictKey: res.data.data[key],
            dictValue: key,
          });
        });
        this.$store.commit('setCertProcessKeys', dataMap);
      });
    },
    getRule(msg) {
      return [{ required: true, message: msg, trigger: 'change' }];
    },
    loadIconfont() {
      if (iconfont && iconfont.id) {
        iconfont.glyphs.forEach((icon) => {
          this.icons.push(
            `${iconfont.font_family} ${iconfont.css_prefix_text}${icon.font_class}`
          );
        });
      }
    },
    getGroups() {
      getModelGroups()
        .then((rsp) => {
          this.fromGroup = rsp.data;
        })
        .catch((err) => this.$err(err, '获取分组异常'));
    },
    addGroup() {
      if (this.newGroup.trim() !== '') {
        createModelGroup({ name: this.newGroup.trim() })
          .then((rsp) => {
            this.$ok(rsp, '新增分组成功');
            this.getGroups();
          })
          .catch((err) => this.$err(err, '新增分组失败'));
      }
    },
    selected(select) {
      this.setup.settings[this.nowUserSelect] = select;
      //this.setup[this.nowUserSelect] = select
    },
    selectUser(key) {
      this.select = this.setup.settings[key];
      this.nowUserSelect = key;
      this.$refs.orgPicker.show();
    },
    validate() {
      this.$refs.baseSetting.validate();
      let err = [];
      if (!this.$isNotEmpty(this.setup.formName)) {
        err.push('表单名称未设置');
      }
      if (!this.$isNotEmpty(this.setup.operationType)) {
        err.push('表单名称未设置');
      }
      if (!this.$isNotEmpty(this.setup.groupId)) {
        err.push('表单分组未设置');
      }
      if (!this.$isNotEmpty(this.setup.companyName)) {
        err.push('企业名称未设置');
      }
      if (this.setup.settings.notify.types.length === 0) {
        err.push('审批消息通知方式未设置');
      }
      return err;
    },
  },
};
</script>

<style lang="less" scoped>
:deep(.el-select-dropdown) {
  display: none;
}

.icon-select {
  display: flex;
  flex-wrap: wrap;

  :deep(.icon) {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 20px;
    width: 20px;
    height: 20px;
    padding: 10px;
    max-width: 38px !important;

    &:hover {
      box-shadow: 0 0 10px 2px #c2c2c2;
    }
  }
}

:deep(.select-u) {
  width: 100%;
}

.base-setup {
  overflow: auto;
  margin: 0 auto;
  width: 600px;
  height: calc(100vh - 105px);
  background: #ffffff;
  margin-top: 10px;
  padding: 15px 20px;

  :deep(.icon):first-child {
    position: relative;
    cursor: pointer;
    font-size: xx-large;
    color: #ffffff;
    border-radius: 10px;
    padding: 10px;
  }

  .change-icon {
    margin-left: 20px;

    span {
      font-size: small;
      color: #7a7a7a;
      margin-right: 15px;
    }

    :deep(.icon) {
      cursor: pointer;
      color: #7a7a7a;
      font-size: x-large;
    }
  }

  :deep(.el-form-item__label) {
    padding: 0;
    font-weight: bold;
  }
}

:deep(.group) {
  .el-select {
    width: calc(100% - 130px);
  }

  .el-button {
    margin-left: 10px;
    width: 120px;
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
