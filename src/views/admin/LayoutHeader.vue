<template>
  <div>
    <div class="header">
      <el-menu :default-active="modelValue" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="baseSetting" @click="to('baseSetting')">① 基础信息</el-menu-item>
        <el-menu-item index="formSetting" @click="to('formSetting')">② 审批表单</el-menu-item>
        <el-menu-item index="processDesign" @click="to('processDesign')">③ 审批流程</el-menu-item>
        <el-menu-item index="proSetting" @click="to('proSetting')">④ 扩展设置</el-menu-item>
      </el-menu>
      <div class="publish">
        <el-button size="default" @click="getFormData">获取表单数据</el-button>
        <el-button size="default" @click="save">
          <icon name="el-icon-folderchecked"></icon>
          &nbsp;&nbsp;保存
        </el-button>
        <el-button size="default" type="primary" @click="publish">
          <icon name="el-icon-promotion"></icon>
          &nbsp;&nbsp;发布
        </el-button>
      </div>
      <div class="back">
        <el-button @click="exit" icon="el-icon-arrowleft" circle></el-button>
        <icon :key="setup.logo.icon" :name="setup.logo.icon" :style="'background:' + setup.logo.background"></icon>
        <span>{{ setup.formName }}</span>
      </div>
    </div>

    <el-dialog title="请使用手机扫码预览" v-model="viewCode" width="300px" :close-on-click-modal="false" center>
      <img src="../../assets/image/code.png" width="250" height="250" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'LayoutHeader',
  props: {
    modelValue: {
      type: String,
      default: 'baseSetup',
    },
  },
  data() {
    return {
      viewCode: false,
    };
  },
  computed: {
    setup() {
      return this.$store.state.design;
    },
  },
  created() {
    this.check();
  },
  mounted() {
    console.log(document.body.offsetWidth);
    if (document.body.offsetWidth <= 970) {
      this.$msgbox.alert(
        '本设计器未适配中小屏幕，建议您在PC电脑端浏览器进行操作'
      );
    }
    this.listener();
  },
  methods: {
    getFormData() {
      console.log('@', this.setup);
    },
    publish() {
      this.$emit('publish');
    },
    save() {
      this.$emit('save');
    },
    exit() {
      this.$confirm('未发布的内容将不会被保存，是否直接退出 ?', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        //window.location.reload()
        //this.$store.commit('clearTemplate')
        if (this.$route.name.includes('ForOperation')) {
          this.$router.push('/workspace/formsPanel');
        }

      });
    },
    to(path) {
      this.$emit('update:modelValue', path);
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    listener() {
      window.onunload = this.closeBefore();
      window.onbeforeunload = this.closeBefore();
      //window.on('beforeunload',this.closeBefore())
    },
    closeBefore() {
      //alert("您将要离开本页")
      return false;
    },
    check() {
      if (this.$store.state.isEdit === null) {
        //this.$router.push("/workPanel");
      }
    },
  },
  emits: ['update:modelValue', 'publish', 'save'],
};
</script>

<style lang="less" scoped>
:deep(.header) {
  min-width: 980px;
  position: relative;

  .el-menu {
    top: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    width: 100%;

    .el-menu-item.is-active {
      color: @theme-primary;
    }
  }

  .publish {
    position: absolute;
    top: 15px;
    right: 20px;
    z-index: 1000;

    :deep(.icon) {
      margin-right: 6px;
    }

    button {
      border-radius: 15px;
    }
  }
}

.back {
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 20px;
  font-size: small;

  :deep(.icon) {
    border-radius: 10px;
    padding: 7.8px;
    font-size: 20px;
    color: #ffffff;
    margin: 0 10px;
  }
}
</style>
