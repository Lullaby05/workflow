<template>
  <div>
    <div
      v-if="activeTasks.length > 1"
      style="margin-bottom: 10px"
    >
      审批节点：
      <el-select
        @change="getEnableRecallNodes"
        v-model="actionData.taskId"
        placeholder="选择要处理的节点"
      >
        <el-option
          :value="task.taskId"
          :label="task.name"
          v-for="task in activeTasks"
          :key="task.taskId"
        ></el-option>
      </el-select>
      <span style="color: #8c8c8c; margin-left: 10px">要处理哪个任务</span>
    </div>
    <div
      v-if="action === 'recall'"
      style="margin-bottom: 10px"
    >
      回退节点：
      <el-select
        v-model="actionData.targetNode"
        placeholder="选择要回退到的节点"
      >
        <el-option
          :value="node.nodeId"
          :label="node.nodeName"
          v-for="node in recallNodes"
          :key="node.nodeId"
        ></el-option>
      </el-select>
      <span
        v-show="recallNodes.length === 0"
        style="color: #8c8c8c; margin-left: 10px"
        >暂无可回退节点😅</span
      >
    </div>
    <div
      v-if="
        action === 'transfer' || action === 'beforeAdd' || action === 'afterAdd'
      "
      style="margin-bottom: 10px"
    >
      <span v-if="action === 'transfer'">转交给谁：</span>
      <span v-else>给谁加签：</span>
      <el-button
        style="margin-right: 20px"
        size="small"
        icon="el-icon-user"
        @click="selectUser"
        >选择人员</el-button
      >
      <el-tag
        size="small"
        v-if="actionData.targetUser"
        >{{ actionData.targetUser.name }}</el-tag
      >
    </div>
    <el-input
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 6 }"
      maxlength="255"
      show-word-limit
      :placeholder="actionDesc.tip"
      v-model="actionData.comment.text"
    ></el-input>
    <div class="action-content">
      <image-upload
        class="image-upload"
        v-model="imageList"
        placeholder="添加图片"
        :max-size="10"
        :max-number="10"
        :mode="isMobile ? 'MOBILE' : 'PC'"
      />
      <file-upload
        v-model="fileList"
        placeholder="添加附件"
        :max-size="100"
        :max-number="5"
        :mode="isMobile ? 'MOBILE' : 'PC'"
      />
    </div>
    <div v-if="showSignCt">
      <el-divider>签字</el-divider>
      <div class="sign">
        <el-button
          @click="showSignPanel"
          icon="el-icon-edit"
          >点击签名</el-button
        >
        <img
          v-show="actionData.signature.length > 0"
          :src="actionData.signature"
          @click="showSignPanel"
        />
      </div>
      <w-dialog
        title="请使用鼠标签字"
        width="700px"
        v-model="signVisible"
        @ok="signOk"
      >
        <canvas
          id="signPanel"
          width="650px"
          height="300px"
        ></canvas>
      </w-dialog>
      <div>
        <el-button
          type="text"
          style="margin-right: 30px"
          @click="loadBeforeSign"
          >使用上次签名</el-button
        >
        <el-checkbox v-model="actionData.updateSign">保存本次签名</el-checkbox>
      </div>
    </div>
    <org-picker
      :pc-mode="!isMobile"
      title="选择要转交的人员"
      type="user"
      ref="orgPicker"
      :selected="actionData.targetUser ? [actionData.targetUser] : []"
      @ok="selected"
    />
  </div>
</template>

<script>
import {
  approvalTask,
  getEnableRecallNodes,
  getTaskNodeSettings,
} from '@/api/processTask';
import SignaturePad from 'signature_pad';
import { getModelById } from '@/api/modelGroup';
import OrgPicker from '@/components/common/OrgPicker.vue';
import ImageUpload from '../../common/form/components/ImageUpload.vue';
import FileUpload from '../../common/form/components/FileUpload.vue';
import { getUserSign } from '@/api/org';
import { compressBase64Image } from '@/utils/imageUtil';

export default {
  name: 'ProcessAction',
  components: { OrgPicker, ImageUpload, FileUpload },
  props: {
    action: {
      type: String,
      default: 'agree',
    },
    instance: {
      type: Object,
      required: true,
    },
    showSign: {
      type: Boolean,
      default: false,
    },
    activeTasks: {
      type: Array,
      default: () => {
        return [];
      },
    },
    actionDesc: {
      type: Object,
      default: () => {
        return {};
      },
    },
    formData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      visible: false,
      hasSign: false,
      signVisible: false,
      signaturePad: null,
      imageList: [],
      fileList: [],
      showSign: false,
      recallNodes: [],
      actionData: {
        taskId: null,
        signature: '',
        targetNode: null,
        targetUser: null,
        updateSign: false,
        comment: {
          text: '',
          attachments: [],
        },
      },
    };
  },
  computed: {
    loginUser() {
      return this.$store.state.loginUser;
    },
    isMobile() {
      return window.screen.width < 450;
    },
    showSignCt() {
      return (
        this.showSign && (this.action === 'refuse' || this.action === 'agree')
      );
    },
    //暂不使用本地取
    _recallNodes() {
      //去重，处理最后一个包含退回节点的后续的节点
      let lastIndex = 0;
      this.instance.progress.forEach((p, i) => {
        if (p.result === 'recall') {
          lastIndex = i;
        }
      });
      return this.instance.progress
        .filter((node, i) => {
          return (
            node.nodeType === 'APPROVAL' && node.finishTime && i > lastIndex
          );
        })
        .map((node) => {
          return { name: node.name, nodeId: node.nodeId };
        });
    },
  },
  mounted() {
    if (this.action === 'recall') {
      this.getEnableRecallNodes();
    }
    if (this.activeTasks.length > 0) {
      this.actionData.taskId = this.activeTasks[0].taskId;
    }
  },
  methods: {
    show() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    showSignPanel() {
      this.signVisible = true;
      this.$nextTick(() => {
        this.initSign();
      });
    },
    loadFormInfo(id) {
      getModelById(id)
        .then((rsp) => {
          let form = rsp.data;
          form.logo = JSON.parse(form.logo);
          this.form = form;
        })
        .catch((err) => {
          this.$err(err, '获取流程模型失败');
        });
    },
    selectUser() {
      this.$refs.orgPicker.show();
    },
    selected(users) {
      if (users[0].id === this.loginUser.id) {
        this.$message.warning('不允许加签本人');
      } else {
        this.actionData.targetUser = users[0];
      }
    },
    initSign() {
      if (this.signaturePad) {
        this.signaturePad.clear();
      } else {
        let canvas = document.getElementById('signPanel');
        if (this.mode === 'MOBILE') {
          canvas.setAttribute('height', '200px');
        } else {
          canvas.setAttribute('width', '650px');
          canvas.setAttribute('height', '300px');
        }
        this.signaturePad = new SignaturePad(canvas, {
          penColor: this.color,
          minWidth: this.thickness,
          maxWidth: this.thickness + 2,
        });
        if (this.mode === 'MOBILE') {
          canvas.width = document.body.clientWidth;
        }
      }
    },
    loadBeforeSign() {
      getUserSign().then((rsp) => {
        if (rsp.data === '') {
          this.$message.warning('您还没有保存过的签名');
        } else {
          this.actionData.signature = rsp.data;
        }
      });
    },
    getTask() {
      if (this.$isNotEmpty(this.actionData.taskId)) {
        return this.actionData.taskId;
      } else if (this.activeTasks.length > 0) {
        return this.activeTasks[0].taskId;
      } else if (this.action === 'cancel') {
        const pg = this.instance.progress || [];
        for (let i = 0; i < pg.length; i++) {
          if (pg[i].users) {
            for (let j = 0; j < pg[i].users.length; j++) {
              if (!this.$isNotEmpty(pg[i].users[j].finishTime)) {
                return pg[i].users[j].taskId;
              }
            }
          } else {
            if (!this.$isNotEmpty(pg[i].finishTime)) {
              return pg[i].taskId;
            }
          }
        }
      }
      return null;
    },
    getEnableRecallNodes() {
      getEnableRecallNodes(this.instance.instanceId, this.getTask())
        .then((rsp) => {
          this.recallNodes = rsp.data;
        })
        .catch((err) => {
          this.$err(err, '获取可回退节点失败');
        });
    },
    submitAction() {
      let params = {
        instanceId: this.instance.instanceId,
        taskId: this.getTask(),
        comment: {
          text: this.actionData.comment.text,
          attachments: this.imageList.concat(this.fileList),
        },
        formData: this.formData,
        signature: this.actionData.signature,
        action: this.action,
        updateSign: this.actionData.updateSign,
        targetNode: this.actionData.targetNode,
        targetUser: this.actionData.targetUser
          ? this.actionData.targetUser.id
          : null,
      };
      if (
        (this.action === 'beforeAdd' ||
          this.action === 'afterAdd' ||
          this.action === 'transfer') &&
        !params.targetUser
      ) {
        this.$message.warning('请设置人员');
        return;
      } else if (
        this.action === 'recall' &&
        !this.$isNotEmpty(this.actionData.targetNode)
      ) {
        this.$message.warning('请选择回退到哪个节点');
        return;
      } else if (this.showSignCt) {
        if (!this.$isNotEmpty(this.actionData.signature)) {
          this.$message.warning('请签字后再提交');
          return;
        }
      }
      approvalTask(params)
        .then((rsp) => {
          this.$emit('success');
          this.$ok(rsp, '处理任务成功');
          this.close();
        })
        .catch((err) => {
          this.$err(err, '处理任务失败');
        });
    },
    signOk() {
      this.signVisible = false;
      if (this.signaturePad.isEmpty()) {
        this.actionData.signature = '';
      } else {
        //把签名压缩一下
        compressBase64Image(this.signaturePad.toDataURL(), 0.33).then((res) => {
          this.actionData.signature = res;
        });
      }
    },
  },
  watch: {
    'actionData.taskId'() {
      getTaskNodeSettings(this.actionData.taskId)
        .then((rsp) => {
          this.showSign = rsp.data.enableSign || false;
        })
        .catch((e) => {});
    },
  },
  emits: ['success'],
};
</script>

<style lang="less" scoped>
.action-content {
  margin-top: 20px;
  img {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 20px;
    &:hover {
      border: 1px dashed @theme-primary;
    }
  }

  :deep(.image-upload) {
    margin-bottom: 20px;
    .el-upload-list__item,
    .el-upload--picture-card {
      height: 65px;
      width: 65px;
    }
    .el-upload--picture-card {
      line-height: 70px;
    }
  }
}
canvas {
  border: 1px dashed #666666;
}

.sign {
  display: flex;
  align-items: center;
  img {
    width: 40%;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 20px;
    &:hover {
      border: 1px dashed @theme-primary;
    }
  }
}
</style>
