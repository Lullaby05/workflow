<template>
  <div
    class="from-panel"
    ref="panel"
    v-loading="loading"
  >
    <div class="from-title">
      <div>
        <span
          >📢 长按流程可拖拽排序，拖拽分组名右侧
          <icon name="el-icon-rank"></icon> 可对分组排序
        </span>
      </div>
      <div>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="newProcess(null)"
          round
          >新建表单</el-button
        >
        <el-button
          icon="el-icon-plus"
          @click="addGroup"
          size="small"
          round
          >新建分组</el-button
        >
      </div>
    </div>
    <draggable
      v-model="groups"
      item-key="id"
      group="group"
      handle=".el-icon-rank"
      filter=".undrag"
      :component-data="{ tag: 'div', type: 'transition-group' }"
      @start="groupsSort = true"
      v-bind="groupDragOptions"
      @end="doGroupSort"
    >
      <template #item="{ element }">
        <div
          :class="{
            'form-group': true,
            undrag: element.id === 0 || element.id === undefined,
          }"
          v-show="element.id > 1 || element.items.length > 0"
        >
          <div class="form-group-title">
            <span>{{ element.name }}</span>
            <span>({{ element.items.length }})</span>
            <icon
              name="el-icon-rank"
              title="长按拖动可对分组排序"
            ></icon>
            <div v-if="!(element.id === 0 || element.id === undefined)">
              <el-button
                type="primary"
                link
                icon="el-icon-edit"
                size="small"
                @click="editGroup(element)"
                >修改</el-button
              >
              <el-button
                type="primary"
                link
                icon="el-icon-delete"
                size="small"
                @click="delGroup(element)"
                >删除</el-button
              >
            </div>
          </div>
          <group-forms
            :group="element"
            :group-sort="groupsSort"
            :groups="groups"
            :sort="true"
            :form-drag-options="formDragOptions"
            v-model="element.items"
            @refresh="getGroupModels"
          />
          <div
            style="text-align: center"
            v-if="element.items === undefined || element.items.length === 0"
          >
            <el-button
              style="padding-top: 0"
              link
              icon="el-icon-plus"
              @click="newProcess(element.id)"
              >创建新表单</el-button
            >
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import modelGroupApi from '@/api/modelGroup';
import GroupForms from '../GroupForms.vue';

export default {
  name: 'FormsPanel',
  components: { GroupForms, draggable },
  data() {
    return {
      visible: false,
      loading: false,
      groupsSort: false,
      groups: [],
      groupDragOptions: {
        animation: 300,
        group: 'form',
        disabled: false,
        sort: true,
        scroll: true,
        ghostClass: 'choose',
      },
      formDragOptions: {
        animation: 300,
        delay: 200,
        chosenClass: 'choose',
        scroll: true,
        sort: true,
      },
    };
  },
  mounted() {
    this.getGroupModels();
  },
  methods: {
    getGroupModels() {
      this.loading = true;
      modelGroupApi
        .getGroupModels()
        .then((rsp) => {
          this.loading = false;
          this.groups = rsp.data;
          this.groups.forEach((group) => {
            group.items.forEach((item) => {
              item.logo = JSON.parse(item.logo);
            });
          });
        })
        .catch((err) => {
          this.loading = false;
          this.$err(err, '获取分组异常');
        });
    },
    newProcess(groupId) {
      this.$store.commit('setIsEdit', false);
      window.open(
        `/wflow/#/admin/designForOperation${
          +this.$isNotEmpty(groupId) ? '&groupId=' + groupId : ''
        }`,
        '_blank'
      );
    },
    doGroupSort(group) {
      console.log('分组结束', group);
      this.groupsSort = false;
      this.loading = true;
      modelGroupApi
        .modelGroupsSort(this.groups.map((g) => g.id))
        .then((rsp) => {
          this.loading = false;
          this.$ok(rsp, '分组排序成功');
          this.getGroupModels();
        })
        .catch((err) => {
          this.loading = false;
          this.getGroupModels();
          this.$err(err, '分组排序失败');
        });
    },
    addGroup() {
      this.$prompt('请输入要添加的组名', '新的分组名', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9\\-]{1,30}$/,
        inputErrorMessage: '分组名不能为空且长度小于30',
        inputPlaceholder: '请输入分组名',
      }).then(({ value }) => {
        modelGroupApi
          .createModelGroup({ name: value })
          .then((rsp) => {
            this.$ok(rsp, '添加分组成功');
            this.getGroupModels();
          })
          .catch((err) => this.$err(err, '添加分组失败'));
      });
    },
    delGroup(group) {
      this.$confirm(
        '删除分组并不会删除表单，表单将会被转移到 “其他” 分组，确定要删除分组 ' +
          group.name +
          '?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        this.loading = true;
        modelGroupApi
          .deleteModelGroup(group.id)
          .then((rsp) => {
            this.loading = false;
            this.$ok(rsp, '删除分组成功');
            this.getGroupModels();
          })
          .catch((err) => {
            this.loading = false;
            this.$err(err, '删除分组失败');
          });
      });
    },
    editGroup(group) {
      this.$prompt('请输入新的组名', '修改分组名', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9\\-]{1,30}$/,
        inputErrorMessage: '分组名不能为空且长度小于30',
        inputPlaceholder: '请输入分组名',
        inputValue: group.name,
      }).then(({ value }) => {
        this.loading = true;
        modelGroupApi
          .updateModelGroupName(group.id, { name: value })
          .then((rsp) => {
            this.loading = false;
            this.$ok(rsp, '修改成功');
            this.getGroupModels();
          })
          .catch((err) => {
            this.loading = false;
            this.$err(err, '修改失败');
          });
      });
    },
  },
};
</script>

<style lang="less" scoped>
body {
  background: #ffffff !important;
}

.undrag {
  background: #ebecee !important;
}

.from-panel {
  min-width: 500px;
  background: #ffffff;

  :deep(.from-title) {
    position: relative;
    margin-bottom: 10px;
    height: 30px;

    & > div:first-child {
      position: absolute;
      left: 0;
      font-size: 13px;
      color: @theme-warning;
    }

    & > div:last-child {
      position: absolute;
      right: 0;
      top: -5px;

      .el-button {
        border-radius: 15px;
      }
    }
  }

  //height: 100vh;
}

.choose {
  cursor: move;
  border: 1px dashed @theme-primary !important;
}

.form-group {
  margin-bottom: 20px;
  padding: 0 0 15px 0;
  border-radius: 10px;
  background: @theme-aside-bgc;
  border: 1px solid @theme-aside-bgc;

  .form-group-title {
    padding: 5px 20px;
    height: 40px;
    line-height: 40px;

    .el-icon-rank {
      margin-left: 10px;
      display: none;
      cursor: move;
    }

    &:hover {
      .el-icon-rank {
        display: inline-block;
      }
    }

    & > span:nth-child(2) {
      margin-left: 5px;
      color: #8c8c8c;
      font-size: smaller;
    }

    & > div {
      float: right;

      button {
        color: #8c8c8c;
      }
    }
  }
}

@media screen and (max-width: 1000px) {
  .desp {
    display: none !important;
  }
}

@media screen and (max-width: 800px) {
  .from-panel {
    padding: 50px 10px;
  }
}
</style>
