<template>
  <el-main ref="design">
    <div class="scale">
      <el-button icon="el-icon-plus" @click="scale += 10" :disabled="scale >= 150" circle></el-button>
      <span>{{ scale }}%</span>
      <el-button icon="el-icon-minus" @click="scale -= 10" :disabled="scale <= 40" circle></el-button>
      <!--      <el-button @click="validate">校验流程</el-button>-->
    </div>
    <div class="design" :style="'transform: scale(' + scale / 100 + ');'">
      <process-tree ref="process-tree" @selectedNode="nodeSelected" />
    </div>
    <el-drawer :title="selectedNode.name" v-model="showConfig" :modal-append-to-body="false" :size="drawerSize" direction="rtl" destroy-on-close>
      <template #header>
        <div>
          <el-input v-model="selectedNode.name" v-show="showInput" style="width: 300px" @blur="showInput = false"></el-input>
          <el-link v-show="!showInput" @click="showInput = true" style="font-size: medium">
            <icon name="el-icon-edit" style="margin-right: 10px"></icon>
            {{ selectedNode.name }}
          </el-link>
        </div>
      </template>
      <div class="node-config-content">
        <node-config />
      </div>
    </el-drawer>
  </el-main>
</template>

<script>
import ProcessTree from './process/ProcessTree.vue';
import NodeConfig from '../../common/process/config/NodeConfig.vue';

export default {
  name: 'ProcessDesign',
  components: { ProcessTree, NodeConfig },
  data() {
    return {
      scale: 100,
      selected: {},
      showInput: false,
      showConfig: false,
      showProcListConfig: false,
      processDom: null,
    };
  },
  computed: {
    selectedNode() {
      return this.$store.state.selectedNode;
    },
    drawerSize() {
      if (this.selectedNode.type) {
        switch (this.selectedNode.type) {
          case 'INCLUSIVE':
          case 'CONDITION':
            return '600px';
          default:
            return '500px';
        }
      }
    },
  },
  mounted() {
    this.initDragPageMove();
  },
  methods: {
    validate() {
      return this.$refs['process-tree'].validateProcess();
    },
    nodeSelected(node) {
      console.log('配置节点', node);
      this.showConfig = true;
    },
    initDragPageMove() {
      let isDragging = false;
      let startX, startY, scrollLeft, scrollTop;
      this.processDom = this.$refs.design.$el;
      this.processDom.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollLeft = this.processDom.scrollLeft;
        scrollTop = document.documentElement.scrollTop;
        //this.processDom.style.cursor = 'grabbing'
        //e.preventDefault();// 防止默认选中文本行为
      });
      this.processDom.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        // 更新滚动位置
        this.processDom.scrollLeft = scrollLeft - deltaX;
        document.documentElement.scrollTop = scrollTop - deltaY;
      });
      this.processDom.addEventListener('mouseup', () => {
        isDragging = false;
        this.processDom.style.cursor = 'default';
      });
    },
  },
};
</script>

<style lang="less" scoped>
.design {
  margin-top: 100px;
  display: flex;
  transform-origin: 50% 0px 0px;
}

.scale {
  z-index: 999;
  position: fixed;
  top: 80px;
  right: 40px;

  span {
    margin: 0 10px;
    font-size: 15px;
    color: #7a7a7a;
    width: 50px;
  }
}

.node-config-content {
  padding: 0 20px 20px;
}

:deep(.el-drawer__body) {
  overflow-y: auto;
}
</style>
