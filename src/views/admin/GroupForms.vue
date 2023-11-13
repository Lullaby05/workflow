<template>
  <draggable class="group-items" :sort="true" item-key="id" v-model="_value" group="from" @end="groupModelsSort(group)"
             :component-data="{tag: 'div', type: 'transition-group'}"
             v-show="!groupsSort" filter=".undrag" v-bind="formDragOptions">
    <template #item="{element}">
      <div :class="{'form-group-item':true, 'undrag': element.isStop}">
        <el-row :gutter="20">
          <el-col :span="6" class="w-h-center">
            <icon :name="`${element.logo.icon} w-h-center`" :style="`background: ${element.logo.background}`"></icon>
            <ellipsis class="item-title" hover-tip :content="element.formName"/>
          </el-col>
          <el-col :span="1" class="w-t-center">
            <el-tag size="small" type="success">v{{ element.version }}</el-tag>
          </el-col>
          <el-col :span="5" class="w-t-center">
            <ellipsis class="w-desc-text" :content="element.remark || '...'"/>
          </el-col>
          <el-col :span="6" class="w-t-center">
            <ellipsis class="w-desc-text" :content="'更新于：' + element.updated"/>
          </el-col>
          <el-col :span="6" class="w-t-right">
            <el-button type="primary" link v-if="!element.isStop" icon="el-icon-edit" size="small"
                       @click="editModel(element, group)">编辑
            </el-button>
            <el-button type="primary" link :icon="element.isStop ? 'el-icon-check':'el-icon-close'" size="small"
                       @click="stopModel(element)">
              {{ element.isStop ? '启用' : '停用' }}
            </el-button>
            <el-button type="primary" link icon="el-icon-delete" size="small" @click="delModel(element)"
                       v-if="element.isStop">
              删除
            </el-button>
            <el-popover placement="left" trigger="click" width="400" style="margin-left: 10px"
                        @show="moveSelect === null" v-else>
              <el-radio-group v-model="moveSelect" size="small">
                <el-radio :label="g.id" border v-for="g in groups" :key="g.id" v-show="g.id > 1"
                          :disabled="g.id === group.id" style="margin: 10px;">{{ g.name }}
                </el-radio>
              </el-radio-group>
              <div style="text-align: right; margin: 0">
                <el-button type="primary" size="small" @click="moveModel(element)">提交</el-button>
              </div>
              <template #reference>
                <el-button type="primary" link icon="el-icon-promotion" size="small">移动</el-button>
              </template>
            </el-popover>
          </el-col>
        </el-row>
      </div>
    </template>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import modelGroupApi from '@/api/modelGroup'

export default {
  name: "GroupForms",
  components: {draggable},
  props: {
    modelValue: {
      type: Array,
      default: () => {
        return []
      }
    },
    group: {
      type: Object,
      default: () => {
        return {}
      }
    },
    groups: {
      type: Object,
      default: () => {
        return {}
      }
    },
    groupsSort: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    formDragOptions: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    _value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  data() {
    return {
      moveSelect: '',
    }
  },
  methods: {
    groupModelsSort(group) {
      //判断是在分组内还是移出了分组
      this.loading = true
      modelGroupApi.modelsSort(group.id,
          group.items.map((item) => item.formId)).then((rsp) => {
        this.loading = false
        this.$emit('refresh')
        this.$ok(rsp, '排序成功')
      }).catch((err) => {
        this.loading = false
        this.$err(err, '排序失败')
      })
    },
    editModel(item, group) {
      window.open(`/#/admin/design?code=${item.formId}&groupId=${item.groupId}`, '_blank')
    },
    stopModel(item) {
      let tip = item.isStop
          ? ' 启用后将会进入 “其他” 分组，是否继续？'
          : ' 停用后将会被转移到 “已停用” 分组，您可以再次启用或者删除它，是否继续?'
      this.$confirm(item.formName + tip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        modelGroupApi.enOrDisModel(item.formId, !item.isStop).then((rsp) => {
          this.loading = false
          this.$emit('refresh')
          this.$ok(rsp, '操作成功')
        }).catch((err) => {
          this.loading = false
          this.$err(err, '操作失败')
        })
      })
    },
    delModel(item) {
      this.$confirm('您确定要删除表单 ' + item.name + ' 吗，删除后无法恢复，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(() => {
        this.loading = true
        modelGroupApi.deleteModel(item.formId).then((rsp) => {
          this.loading = false
          this.$ok(rsp, '删除成功')
          this.$emit('refresh')
        }).catch((err) => {
          this.loading = false
          this.$err(err, '删除失败')
        })
      })
    },
    moveModel(item) {
      if (this.moveSelect === null || this.moveSelect === '') {
        this.$message.error('请选择分组')
        return
      }
      this.loading = true
      modelGroupApi.modelMoveToGroup(item.formId, this.moveSelect).then((rsp) => {
        this.loading = false
        this.$ok(rsp, '移动到新分组成功')
        this.$emit('refresh')
        this.moveSelect = null
      }).catch((err) => {
        this.loading = false
        this.$err(err, '移动位置失败')
      })
    },
  }
}
</script>

<style lang="less" scoped>
.group-items {
  padding: 0 20px;
  min-height: 10px;
}

.form-group-item {
  font-size: small;
  padding: 5px 10px;
  margin: 2px 0;
  height: 40px;
  background: white;
  line-height: 40px;
  border: 1px solid white;
  border-radius: 5px;

  :deep(.icon) {
    border-radius: 10px;
    padding: 7px;
    height: 20px;
    width: 20px;
    font-size: 20px;
    color: #ffffff;
    margin-right: 10px;
  }

  .item-title {
    color: #303133;
    display: inline-block;
  }
}

.choose {
  cursor: move;
  border: 1px dashed @theme-primary !important;
}

.undrag {
  background: #ebecee !important;
}

</style>
