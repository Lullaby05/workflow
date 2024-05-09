<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <div class="design">
        <icon name="el-icon-plus"></icon>
      </div>
      <p>{{ placeholder }} {{ sizeTip }}</p>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-upload
        :file-list="fileList"
        action="#"
        :limit="maxNumber"
        accept="image/*,video/*"
        :data="uploadParams"
        with-credentials
        :multiple="maxNumber > 1"
        :on-success="uploadSuccess"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-exceed="overLimit"
        :on-error="uploadFail"
        list-type="picture-card"
        auto-upload
        :before-upload="beforeUpload"
        :http-request="uploadFile"
      >
        <template #default>
          <icon name="el-icon-plus"></icon>
        </template>
        <template #tip>
          <div class="el-upload__tip">{{ placeholder }} {{ sizeTip }}</div>
        </template>
      </el-upload>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly">
      <uploader
        :disabled="disabled"
        v-model="fileList"
        accept="image/*,video/*"
        :multiple="maxNumber > 1"
        :max-count="maxNumber > 0 ? maxNumber : 99"
        :deletable="!disabled"
        :before-delete="handleRemove"
        :before-read="beforeUpload"
        upload-text="选择图片"
        :after-read="afterRead"
        :previewFullImage="false"
        :max-size="maxSize * 1024 * 1024"
        @oversize="onOversize"
        @click-preview="handlePreview"
      >
      </uploader>
      <div style="color: #9b9595">{{ placeholder }} {{ sizeTip }}</div>
    </div>
    <div
      v-else
      class="img-preview"
    >
      <div class="img-preview-pc">
        <el-image
          :alt="img.name"
          :src="$getRes(img.url)"
          v-for="img in _value"
          :preview-src-list="pcImgList"
        />
      </div>
    </div>
    <div class="mobile-img-preview">
      <ImagePreview
        v-model:show="show"
        :loop="false"
        :images="previewList"
        :startPosition="startIndex"
        :closeOnClickImage="false"
      >
        <template #image="{ src }">
          <video
            v-if="!src.isImage"
            style="width: 100%"
            muted
            autoplay
            controls
            :src="src.url"
          />
          <img
            v-else
            style="width: 100%"
            :src="src.url"
          />
        </template>
      </ImagePreview>
    </div>
  </div>
</template>

<script>
import { Uploader, showSuccessToast, showFailToast, ImagePreview } from 'vant';
import componentMinxins from '../ComponentMinxins';
// import Axios from '@/api/interceptor';
import requestOpeartion from '@/api/requestForOperation.js';

export default {
  mixins: [componentMinxins],
  name: 'ImageUpload',
  components: { Uploader, ImagePreview },
  props: {
    modelValue: {
      type: Array,
      default: () => {
        return [];
      },
    },
    placeholder: {
      type: String,
      default: '请选择图片',
    },
    maxSize: {
      type: Number,
      default: 5,
    },
    videoMaxSize: {
      type: Number,
      default: 100,
    },
    maxNumber: {
      type: Number,
      default: 9,
    },
    enableZip: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    sizeTip() {
      return this.maxSize > 0 ? `| 每张图不超过${this.maxSize}MB` : '';
    },
    pcImgList() {
      return this._value.map((v) => this.$getRes(v.url));
    },
    fileList() {
      return this._value.map((f) => {
        return {
          name: f.name,
          url: f.url,
          sourceUrl: f.sourceUrl,
          isImage: true,
          status: 'success',
        };
      });
    },
    previewList() {
      return this._value.map((v) => {
        return {
          url: v.sourceUrl,
          isImage: v.fileType === 'image',
        };
      });
    },
  },
  data() {
    return {
      loading: false,
      uploadUrl: `/business/upload/upload-video`,
      uploadParams: { isImg: true },
      catchList: [],
      alows: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'video/mp4'],
      show: false,
      startIndex: 0,
    };
  },
  methods: {
    beforeUpload(file) {
      this.catchList.length = 0;
      if (Array.isArray(file)) {
        for (let i = 0; i < file.length; i++) {
          if (!this.validImage(file[i])) {
            return false;
          }
        }
        return true;
      } else {
        return this.validImage(file);
      }
    },
    validImage(img) {
      const imageType = img.type.includes('image') ? 'image' : 'video';
      if (this.alows.indexOf(img.type) === -1) {
        showFailToast('存在不支持的格式');
      } else if (
        imageType === 'image' &&
        this.maxSize > 0 &&
        img.size / 1024 / 1024 > this.maxSize
      ) {
        showFailToast(`单张图片最大不超过 ${this.maxSize}MB`);
      } else if (
        imageType === 'video' &&
        this.videoMaxSize > 0 &&
        img.size / 1024 / 1024 > this.videoMaxSize
      ) {
        showFailToast(`单个视频最大不超过 ${this.videoMaxSize}MB`);
      } else {
        this.loading = true;
        return true;
      }
      return false;
    },
    removeFile(fileName) {
      requestOpeartion({
        url: `/business/upload/remove?fileName=${fileName}`,
        method: 'post',
      }).then((rsp) => {
        // this.$message.success('移除文件成功');
      });
    },
    uploadSuccess(response, file, fileList) {
      this.loading = false;
      this.catchList.push(response);
      let ft = fileList.filter((f) => f.size !== undefined);
      if (this.catchList.length === ft.length) {
        this._value.push(...this.catchList);
        this.$emit('update:modelValue', this._value);
      }
      // this.$message.success(response.name + '上传成功');
    },
    uploadFail(err) {
      this.loading = false;
      // this.$message.error('图片上传失败 ' + err);
    },
    afterRead(file) {
      if (Array.isArray(file)) {
        file.forEach((fl) => {
          this.uploadFile(fl);
        });
      } else {
        this.uploadFile(file);
      }
    },
    handlePreview(file, arg) {
      this.show = true;
      this.startIndex = arg.index;
    },
    uploadFile(file) {
      //上传文件
      const imageType = file.file.type.includes('image') ? 'image' : 'video';
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('isImg', imageType === 'image');
      requestOpeartion({
        url: this.uploadUrl,
        data: formData,
        method: 'post',
        headers: { 'Content-type': 'multipart/form-data' },
      }).then(
        (res) => {
          if (imageType === 'video') {
            this._value.push({
              name: res.data.data[0].fileName,
              url: res.data.data[0].coverUrl,
              sourceUrl: res.data.data[0].filePath,
              fileType: 'video',
            });
          } else {
            this._value.push({
              name: res.data.data[0].fileName,
              url: res.data.data[0].filePath,
              sourceUrl: res.data.data[0].filePath,
              fileType: 'image',
            });
          }
          this.$emit('update:modelValue', this._value);
          showSuccessToast('上传成功');
        },
        (err) => {
          showFailToast('上传失败');
          console.log(err);
        }
      );
    },
    overLimit() {
      if (this.mode === 'PC') {
        this.$message.warning('最多只能上传' + this.maxNumber + '张图片');
      } else {
        showFailToast('数量超出限制');
      }
    },
    onOversize(file) {
      showFailToast('图片过大');
    },
    handleRemove(file, fileList) {
      let i = this._value.findIndex((v) => v.name === file.name);
      if (i > -1) {
        this.removeFile(this._value[i].name);
        this._value.splice(i, 1);
        this.$emit('update:modelValue', this._value);
      }
      console.log('删除文件', file);
    },
    handlePictureCardPreview(file) {
      console.log(file);
    },
    handleDownload(file) {
      console.log(file);
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style lang="less" scoped>
.design {
  :deep(.icon) {
    padding: 10px;
    font-size: xx-large;
    background: white;
    border: 1px dashed #8c8c8c;
  }
}
:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
  line-height: 87px;
}
:deep(.el-upload-list__item) {
  width: 80px;
  height: 80px;
  transition: none;
  .el-upload-list__item-actions {
    & > span + span {
      margin: 1px;
    }
  }
}
:deep(.el-upload-list__item-preview) {
  display: none !important;
}
.img-preview {
  :deep(.img-preview-pc) {
    .el-image {
      width: 80px;
      height: 80px;
      margin: 5px;
    }
  }
}
</style>
