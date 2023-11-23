<template>
  <div v-loading="loading">
    <!--    <div style="text-align: right">
        <el-select size="small" filterable placeholder="筛选表单" v-model="params.code">
          <el-option :value="form.id" :label="form.formName" v-for="form in formList" :key="form.id"></el-option>
        </el-select>
      </div>-->
    <el-table :data="dataList" :header-cell-style="{ background: '#e8e8e8' }" style="width: 100%; margin: 20px 0" @row-click="showProcess">
      <el-table-column fixed prop="processDefName" label="审批类型" show-overflow-tooltip></el-table-column>
      <el-table-column prop="staterUser" show-overflow-tooltip label="发起人" min-width="100px">
        <template v-slot="scope">
          <avatar :size="35" :name="scope.row.staterUser.name" :src="scope.row.staterUser.avatar" />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="startTime" label="提交时间" min-width="120px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="finishTime" label="结束时间" min-width="120px"></el-table-column>
      <el-table-column show-overflow-tooltip prop="taskName" label="当前节点">
      </el-table-column>
      <el-table-column prop="status" label="审批状态">
        <template v-slot="scope">
          <el-tag :type="getProcTag(scope.row.result)">{{
            scope.row.status
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="duration" label="已耗时" min-width="120px">
        <template v-slot="scope">
          {{ getDuration(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column>
        <template v-slot="scope">
          <el-button type="text" @click.stop="delRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <!--      <el-table-column fixed="right" label="操作" min-width="90">
          <template slot-scope="scope">
            <el-button type="text">撤回</el-button>
          </template>
        </el-table-column>-->
    </el-table>
    <div style="text-align: right">
      <el-pagination hide-on-single-page background layout="prev, pager, next" :total="total" :page-size="params.pageSize" v-model:current-page="params.pageNo"></el-pagination>
    </div>
    <el-drawer :size="isMobile ? '100%' : '500px'" direction="rtl" title="审批详情" v-model="processVisible">
      <instance-preview v-if="processVisible" :instance-id="selectInstance" @handler-after="handlerAfter"></instance-preview>
    </el-drawer>
  </div>
</template>

<script>
import taskApi from '@/api/processTask';
import processApi from '@/api/process';
import moment from 'moment';
import InstancePreview from '../workspace/approval/ProcessInstancePreview.vue';
import { getProcTag } from '@/utils/ProcessUtil.js';

export default {
  name: 'ProcessInstancePreview',
  components: { InstancePreview },
  data() {
    return {
      total: 0,
      params: {
        pageSize: 10,
        pageNo: 1,
        finished: null,
        code: '',
      },
      selectInstance: '',
      loading: false,
      processVisible: false,
      formList: [],
      dataList: [],
    };
  },
  mounted() {
    this.getSubmittedList();
  },
  computed: {
    isMobile() {
      return window.screen.width < 450;
    },
  },
  methods: {
    getProcTag,
    getSubmittedList() {
      this.loading = true;
      taskApi
        .getSubmittedList(this.params)
        .then((rsp) => {
          this.loading = false;
          this.total = rsp.data.total;
          this.dataList = rsp.data.records;
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    showProcess(row) {
      this.processVisible = true;
      this.selectInstance = row.instanceId;
    },
    getDuration(row) {
      let end = this.$isNotEmpty(row.finishTime)
        ? row.finishTime
        : moment().format('YYYY-MM-DD HH:mm:ss');
      return this.$timeCoverStr(row.startTime, end);
    },
    handlerAfter() {
      this.processVisible = false;
      this.getSubmittedList();
    },
    delRow(row) {
      processApi.delProcessInst(row.instanceId).then((res) => {
        this.$message.success('删除成功');
        this.getSubmittedList()
      });
    },
  },
  watch: {
    params: {
      deep: true,
      handler() {
        this.getSubmittedList();
      },
    },
  },
};
</script>

<style scoped></style>
