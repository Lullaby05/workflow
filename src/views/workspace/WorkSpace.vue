<template>
  <el-container>
    <el-aside
      :class="{ 'aside-menu': true }"
      v-show="showMenu"
    >
      <div class="logo">
        <img src="../../assets/image/logo.png" />
        <span v-show="!isCollapse">wflow-pro</span>
      </div>
      <el-menu
        router
        class="el-menu-vertical"
        :default-active="active"
        :collapse="isCollapse"
      >
        <el-menu-item index="/workspace/forms">
          <icon name="el-icon-list"></icon>
          <template #title>审批列表</template>
        </el-menu-item>
        <el-menu-item index="/workspace/unfinished">
          <icon name="el-icon-stamp"></icon>
          <template #title>待我处理</template>
        </el-menu-item>
        <el-menu-item index="/workspace/unfinishedForOperation">
          <icon name="el-icon-stamp"></icon>
          <template #title>待我处理(作业用)</template>
        </el-menu-item>
        <el-menu-item index="/workspace/finished">
          <icon name="el-icon-avatar"></icon>
          <span slot="title">已处理的</span>
        </el-menu-item>
        <el-menu-item index="/workspace/submit">
          <icon name="el-icon-checked"></icon>
          <template #title>我发起的</template>
        </el-menu-item>
        <el-menu-item index="/workspace/cc">
          <icon name="el-icon-promotion"></icon>
          <template #title>关于我的</template>
        </el-menu-item>
        <div v-if="!isMobile">
          <el-divider></el-divider>
          <el-menu-item index="/workspace/instances">
            <icon name="el-icon-piechart"></icon>
            <template #title>数据管理</template>
          </el-menu-item>
        </div>
        <div v-if="!isMobile">
          <el-menu-item index="/workspace/formsPanel">
            <icon name="el-icon-setting"></icon>
            <template #title>流程管理</template>
          </el-menu-item>
          <el-menu-item index="/workspace/formsPanelForOperation">
            <icon name="el-icon-setting"></icon>
            <template #title>流程管理(作业用)</template>
          </el-menu-item>
          <el-menu-item index="/web-view/formRender">
            <icon name="el-icon-setting"></icon>
            <template #title>表单管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/operationWebView">
            <icon name="el-icon-setting"></icon>
            <template #title>作业表单管理</template>
          </el-menu-item>
          <el-menu-item index="/pitfall/check">
            <icon name="el-icon-setting"></icon>
            <template #title>排查详情</template>
          </el-menu-item>
          <el-menu-item index="/pitfall/sign">
            <icon name="el-icon-setting"></icon>
            <template #title>签名测试</template>
          </el-menu-item>
          <el-menu-item index="/operation/add">
            <icon name="el-icon-setting"></icon>
            <template #title>动火新增</template>
          </el-menu-item>
          <el-menu-item index="/operation/operationDetailRender">
            <icon name="el-icon-setting"></icon>
            <template #title>作业详情</template>
          </el-menu-item>
          <el-menu-item index="/operation/print">
            <icon name="el-icon-setting"></icon>
            <template #title>作业打印</template>
          </el-menu-item>
        </div>
      </el-menu>
    </el-aside>
    <el-container class="container">
      <el-header height="80px">
        <div class="action">
          <icon
            :name="isCollapse ? 'el-icon-arrowright' : 'el-icon-arrowleft'"
            @click="isCollapse = !isCollapse"
          ></icon>
        </div>
        <div
          class="message"
          v-show="!showMenu || !isMobile"
        >
          <el-popover
            placement="bottom-end"
            width="300"
            trigger="click"
          >
            <div class="notify">
              <el-empty
                :image-size="50"
                description="暂无消息 😁"
                v-if="notify.total === 0"
              ></el-empty>
              <div
                v-for="msg in notify.records"
                :key="msg.id"
                class="notify-item"
              >
                <el-row>
                  <el-col :span="2">
                    <div class="notify-item-type-icon">
                      <icon
                        name="el-icon-successfilled"
                        v-if="msg.type === 'SUCCESS'"
                        style="color: #02b068"
                      ></icon>
                      <icon
                        name="el-icon-warningfilled"
                        v-else-if="msg.type === 'WARNING'"
                        style="color: #f78f5f"
                      ></icon>
                      <icon
                        name="el-icon-circleclosefilled"
                        v-else-if="msg.type === 'ERROR'"
                        style="color: #f25643"
                      ></icon>
                      <icon
                        name="el-icon-infofilled"
                        v-else
                        style="color: #8c8c8c"
                      ></icon>
                    </div>
                  </el-col>
                  <el-col :span="22">
                    <div
                      class="notify-item-title"
                      @click="toNotify(msg)"
                    >
                      {{ msg.title }}
                    </div>
                    <ellipsis
                      hoverTip
                      class="notify-item-content"
                      :content="msg.content"
                    />
                  </el-col>
                </el-row>
                <span class="notify-item-time">{{
                  msg.createTime.substring(5, 16)
                }}</span>
                <el-button
                  type="primary"
                  link
                  class="notify-btn"
                  @click="readNotify(msg.id)"
                  >已读</el-button
                >
              </div>
            </div>
            <div
              class="notify-action"
              v-show="notify.total > 0"
            >
              <el-button
                type="primary"
                link
                @click="--params.pageNo"
                :disabled="params.pageNo <= 1"
                >上一页</el-button
              >
              <el-button
                type="primary"
                link
                @click="readNotify(null)"
                >本页已读</el-button
              >
              <el-button
                type="primary"
                link
                @click="++params.pageNo"
                :disabled="notify.total <= params.pageSize * notify.current"
                >下一页
              </el-button>
            </div>
            <template #reference>
              <el-badge
                :hidden="notify.total === 0"
                :value="notify.total"
              >
                <icon name="el-icon-bell"></icon>
              </el-badge>
            </template>
          </el-popover>
        </div>
        <el-dropdown class="user-avatar">
          <avatar
            :src="user.avatar"
            :name="user.name"
          ></avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="switchUser">
                <icon name="el-icon-sort"></icon>
                切换账号
              </el-dropdown-item>
              <el-dropdown-item @click="showUserCenter">
                <icon name="el-icon-user"></icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item>
                <icon name="el-icon-close"></icon>
                注销登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
    <el-drawer
      :size="isMobile ? '100%' : '500px'"
      direction="rtl"
      title="审批详情"
      v-model="processVisible"
    >
      <instance-preview
        v-if="processVisible"
        :instance-id="selectInstance"
        @handler-after="processVisible = false"
      />
    </el-drawer>
    <org-picker
      title="请选择要切换的用户"
      :pc-mode="!isMobile"
      type="user"
      ref="orgPicker"
      :selected="nowSelected"
      @ok="selected"
    />
    <w-dialog
      title="个人中心"
      v-model="userCenterVisible"
      @ok="userCenterOk"
    >
      <el-tabs
        defaultActive="userInfo"
        v-if="userCenterVisible"
        v-model="activeTab"
        tab-position="left"
        style="height: 220px"
      >
        <el-tab-pane
          name="userInfo"
          label="个人信息"
        >
          <user-info />
        </el-tab-pane>
        <el-tab-pane
          name="approvalAgent"
          label="审批代理"
        >
          <approval-agent ref="agent" />
        </el-tab-pane>
        <el-tab-pane
          name="other"
          label="其他设置"
          >暂无</el-tab-pane
        >
      </el-tabs>
    </w-dialog>
  </el-container>
</template>

<script>
import { login } from '@/api/sys';
import UserInfo from './my/UserInfo.vue';
import ApprovalAgent from './my/ApprovalAgent.vue';
import { getUserNotify, readNotify } from '@/api/notify';
import OrgPicker from '../../components/common/OrgPicker.vue';
import InstancePreview from './approval/ProcessInstancePreview.vue';

export default {
  name: 'workSpace',
  components: { OrgPicker, InstancePreview, UserInfo, ApprovalAgent },
  data() {
    return {
      isCollapse: false,
      timer: null,
      params: {
        pageSize: 5,
        pageNo: 1,
      },
      notify: {
        records: [],
      },
      activeTab: 'userInfo',
      selectInstance: null,
      processVisible: false,
      userCenterVisible: false,
    };
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  mounted() {
    if (this.isMobile) {
      this.isCollapse = true;
    }
    if (!this.loginUser || !this.loginUser.id) {
      this.$alert(
        '无法识别您的身份，请点击右上角头像选择当前体验人员',
        '嘿嘿嘿',
        {
          confirmButtonText: '朕知道了',
          callback: (action) => {
            this.switchUser();
          },
        }
      );
    } else {
      this.getUserNotify();
      this.timerGetNotify(5);
    }
  },
  computed: {
    loginUser() {
      return this.$store.state.loginUser;
    },
    isMobile() {
      return window.screen.width < 450;
    },
    showMenu() {
      if (this.isMobile) {
        return !this.isCollapse;
      }
      return true;
    },
    user() {
      return this.$store.state.loginUser;
    },
    nowSelected() {
      if (this.user.id) {
        return [this.user];
      } else {
        return [];
      }
    },
    active() {
      if (this.$route.path === '/workspace') {
        return this.$router.push('/workspace/forms');
      }
      return this.$route.path;
    },
  },
  methods: {
    getUserNotify() {
      getUserNotify(this.params)
        .then((res) => {
          this.notify = res.data;
        })
        .catch((err) => {
          if (this.timer) {
            clearInterval(this.timer);
          }
          this.$err(err, '获取通知消息失败');
        });
    },
    userCenterOk() {
      if (this.activeTab === 'approvalAgent') {
        this.$confirm(
          '在代理时间内您的所有审批任务都将转交给审批代理人，确定要提交设置吗?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
          this.$refs.agent.setUserAgent(() => {
            this.userCenterVisible = false;
          });
        });
      }
    },
    showUserCenter() {
      this.userCenterVisible = true;
    },
    switchUser() {
      this.$refs.orgPicker.show();
    },
    toNotify(msg) {
      if (this.$isNotEmpty(msg.instanceId)) {
        this.selectInstance = msg.instanceId;
        this.processVisible = true;
      }
    },
    readNotify(id) {
      let list = id ? [id] : this.notify.records.map((n) => n.id);
      readNotify(list)
        .then((rsp) => {
          this.$ok(rsp, '已读成功');
          this.getUserNotify();
        })
        .catch((err) => {
          this.$err(err, '已读失败');
        });
    },
    timerGetNotify(cycle) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      // this.timer = setInterval(() => this.getUserNotify(), cycle * 1000);
    },
    selected(user) {
      if (user.length > 0) {
        login(user[0].id)
          .then((rsp) => {
            let user = {
              id: rsp.data.userId,
              name: rsp.data.userName,
              avatar: rsp.data.avatar,
              position: rsp.data.position,
              type: 'user',
            };
            this.$store.state.loginUser = user;
            localStorage.setItem('loginUser', JSON.stringify(user));
            localStorage.setItem('wflow-token', rsp.data.token);
            window.navigation.reload();
          })
          .catch((e) => {
            this.$err(err, '登录失败');
          });
      }
    },
  },
  watch: {
    params: {
      deep: true,
      handler() {
        // this.getUserNotify();
      },
    },
  },
};
</script>

<style lang="less" scoped>
@header-height: 80px;

.notify {
  max-height: 200px;
  background: @theme-aside-bgc;
  overflow-y: auto;

  .notify-item:last-child {
    border-bottom: 2px solid @theme-aside-bgc;
  }

  .notify-item {
    border-top: 2px solid @theme-aside-bgc;
    padding: 5px;
    background: white;
    position: relative;
    border-radius: 5px;

    .notify-item-title {
      cursor: pointer;
      color: #3b3b3b;

      &:hover {
        color: @theme-primary;
      }
    }

    .notify-item-content {
      color: #8c8c8c;
      padding: 5px 0;
      font-size: smaller;
    }

    .notify-item-time {
      position: absolute;
      right: 45px;
      top: 7px;
      font-size: 12px;
      color: #8c8c8c;
    }

    .notify-btn {
      position: absolute;
      right: 5px;
      top: 8px;
    }

    .notify-item-type-icon {
      font-size: 18px;
    }
  }
}

.notify-action {
  display: flex;
  padding-top: 5px;
  justify-content: space-between;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  //min-height: 400px;
}

.m-aside-menu {
  position: fixed;
  z-index: 999;
  height: 100vh;
}

:deep(.el-menu-item) .icon {
  color: #909399;
}

:deep(.el-menu-item.is-active) .icon {
  color: @theme-primary;
}

.aside-menu {
  background: @theme-aside-bgc;
  width: auto !important;

  :deep(.icon) {
    font-size: large;
    margin-right: 5px;
  }

  .logo {
    height: @header-height;
    line-height: @header-height;
    display: flex;
    align-items: center;
    margin-left: 30px;

    img {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      background: white;
      padding: 5px;
      border-radius: 12px;
      box-shadow: 0 0 8px 0px #e4e4e4;
    }

    span {
      font-size: 14px;
      font-weight: bold;
      color: black;
    }
  }

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 16px;
  }
}

:deep(.el-menu) {
  padding: 0 10px;
  background: @theme-aside-bgc;

  .el-menu-item {
    height: 40px;
    line-height: 40px;
    margin: 4px 0;
    border-radius: 7px;
  }

  .el-divider--horizontal {
    margin: 12px 0;
  }

  .el-menu-item.is-active {
    background: #e6f1fc;
  }
}

:deep(.el-badge) {
  line-height: normal;
}

:deep(.container) {
  background: white;
  height: 100vh;

  .el-header {
    position: relative;
    line-height: @header-height;
    // border-bottom: 1px solid #eeeeee;

    .action {
      position: absolute;
      height: @header-height;
      line-height: @header-height;

      :deep(.icon) {
        cursor: pointer;
        padding: 5px;
      }
    }
  }

  .user-avatar {
    cursor: pointer;
    position: absolute;
    right: 30px;
    height: 60px;
  }

  .message {
    position: absolute;
    right: 170px;

    .icon {
      font-size: 18px;
      color: #a2a4a8;
      padding: 1px;
      cursor: pointer;

      &:hover {
        color: #6d6e70;
      }
    }
  }
}

@media screen and (max-width: 800px) {
  :deep(.el-main) {
    padding: 10px;

    .group {
      margin: 0 0 15px 0px !important;
    }
  }
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: white;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #e8e8e8;
}
</style>
