<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <icon name="iconfont icon-weizhi"></icon>
      <span> {{ placeholder }}</span>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <div v-if="$isNotEmpty(_value)">
        <img :src="_value" @click="showSignPanel" width="40%" />
        <div>点击签名重签</div>
      </div>
      <el-button
        size="default"
        v-else
        icon="el-icon-edit"
        @click="showSignPanel"
        >点击签字</el-button
      >
      <w-dialog
        title="请使用鼠标签字"
        width="700px"
        v-model="visible"
        @ok="signOk"
        @cancel="handleCancel"
      >
        <canvas ref="signPanelRef" id="signPanel"></canvas>
      </w-dialog>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly" class="m-sign">
      <div v-if="$isNotEmpty(_value)">
        <img :src="_value" @click="showSignPanel" style="width: 40%" />
        <div>点击签名重签</div>
      </div>
      <field v-else readonly @click="showSignPanel" :placeholder="placeholder">
        <template #right-icon>
          <icon name="el-icon-edit"></icon>
        </template>
      </field>
      <popup
        v-model:show="visible"
        :style="popupStyle"
        position="left"
        lazy-render
        safe-area-inset-bottom
      >
        <sign @autographConfirm="autographConfirm" @close="close"></sign>
      </popup>
    </div>
    <div v-else>
      <img :src="_value" width="40%" />
    </div>
  </div>
</template>

<script>
import { Field, Popup, NavBar, Button } from "vant";
import componentMinxins from "../ComponentMinxins";
import SignaturePad from "signature_pad";
import sign from "./sign.vue";

export default {
  name: "Location",
  mixins: [componentMinxins],
  components: { Field, Popup, NavBar, Button, sign },
  props: {
    modelValue: {
      default: null,
    },
    placeholder: {
      type: String,
      default: "请签字",
    },
    thickness: {
      type: Number,
      default: 2,
    },
    color: {
      type: String,
      default: "#000",
    },
  },
  data() {
    return {
      visible: false,
      signImg: "",
      hasSign: false,
      signaturePad: null,
      popupStyle: {
        height: "100%",
        width: "100%",
        background: "#FFFFFF",
      },
    };
  },
  mounted() {},
  methods: {
    initSign() {
      this.hasSign = false;
      if (this.signaturePad) {
        this.signaturePad.clear();
      } else {
        let canvas = document.getElementById("signPanel");
        if (this.mode === "MOBILE") {
          // // canvas.setAttribute('height', '200px');
          // // this.$refs.signPanelRef.setAttribute('width', '650px');
          // const html = document.getElementsByTagName("html")[0];
          // const width = html.clientWidth;
          // const height = html.clientHeight;
          // // console.log("width:", width, "height:", height);
          // this.$refs.signPanelRef.setAttribute("height", height);
          // this.$refs.signPanelRef.setAttribute("width", width);
        } else {
          // canvas.setAttribute('width', '650px');
          // canvas.setAttribute('height', '300px');
          this.$refs.signPanelRef.setAttribute("width", "650px");
          this.$refs.signPanelRef.setAttribute("height", "300px");
          console.log(this.$refs);
          this.signaturePad = new SignaturePad(this.$refs.signPanelRef, {
            penColor: this.color,
            minWidth: this.thickness,
            maxWidth: this.thickness + 2,
          });

          this.signaturePad.onEnd = () => {
            this.hasSign = true;
            //this._value = this.signaturePad.toDataURL()
          };
        }

        // if (this.mode === "MOBILE") {
        //   //canvas.height = 300 ;
        //   canvas.width = document.body.clientWidth;
        // }
        //this.resizeCanvas(canvas)
      }
    },
    handleCancel() {
      this.visible = false;
      this.signaturePad = null;
    },
    resizeCanvas(canvas) {
      var ratio = Math.max(window.devicePixelRatio, 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      this.signaturePad.clear();
    },
    showSignPanel() {
      // if(this.disabled){
      //   return;
      // }
      this.visible = true;
      this.$nextTick(() => {
        this.initSign();
      });
      // this.forceLandscapeScreenHandle();
    },
    signOk() {
      this.visible = false;
      this._value = this.signaturePad.toDataURL();
      this.signaturePad = null;
      /*imgZip(this.signaturePad.toDataURL("image/jpeg"), this.signaturePad, base64 => {
      this._value = base64
    })*/
      //this._value = canvas.toDataURL("image/jpeg", 0.5)
    },
    autographConfirm(e){
      this.visible = false;
      this._value = e.baseCode;
    },
    close(e){
      this.visible = false;
    }
  },
  emits: ["update:modelValue"],
};
</script>

<style lang="less" scoped>
canvas {
  border: 1px dashed #666666;
}
img {
  cursor: pointer;
  border: 1px solid white;
  width: 40% !important;
  &:hover {
    border: 1px dashed @theme-primary;
  }
}
.m-sign-panel {
  // margin: 40px 0;
  background: @theme-aside-bgc;
  canvas {
    border: 1px;
  }
}
</style>
