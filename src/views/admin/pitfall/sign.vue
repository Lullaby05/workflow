<template>
  <div class="signName" :style="{ top: 0, left: differ + 'px' }">
    <!-- <div class="close" @click="close"><img src="../assets/images/close.png" alt=""></div> -->
    <div class="autographBox">
      <div ref="canvasHW">
        <canvas
          @touchstart="touchStart($event)"
          @touchmove="touchMove($event)"
          @touchend="touchEnd($event)"
          ref="canvasF"
        ></canvas>
      </div>
      <p v-if="!isDraw">若你已确定填写信息无误，请在下方空白处签名</p>
    </div>
    <div class="autographBtn">
      <div @click="blcak">返回</div>
      <div @click="overwrite">重签</div>
      <div @click="seaveImages">确定</div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { Toast } from "vant";
export default {
  name: "index",
  setup(props, cxt) {
    var differ = ref(document.documentElement.clientWidth);
    var canvasF = ref(null);
    var canvasHW = ref(null);
    var canvasTxt = null; //画布
    var points = []; // 记录点
    var isDraw = ref(false); //签名标记
    var startX = 0; //开始坐标x
    var startY = 0; //开始坐标y
    var moveY = 0;
    var moveX = 0;
    var strDataURI = ""; // 保存的canvas图像
    onMounted(() => {
      let canvas = canvasF.value;
      canvas.height = canvasHW.value.offsetHeight - 10;
      canvas.width = canvasHW.value.offsetWidth - 10;
      canvasTxt = canvas.getContext("2d");
      canvasTxt.strokeStyle = "#333";
      canvasTxt.lineWidth = "3";
    });
    const touchStart = (ev) => {
      ev = ev || event;
      ev.preventDefault();
      if (ev.touches.length == 1) {
        isDraw.value = true; //签名标记
        let obj = {
          x: ev.targetTouches[0].clientY,
          y: differ.value - ev.targetTouches[0].clientX,
        }; //y的计算值中：document.body.offsetHeight*0.5代表的是除了整个画板signatureBox剩余的高，this.$refs.canvasHW.offsetHeight*0.1是画板中标题的高
        startX = obj.x;
        startY = obj.y;
        canvasTxt.beginPath(); //开始作画
        points.push(obj); //记录点
      }
    };
    const touchMove = (ev) => {
      ev = ev || event;
      ev.preventDefault();
      if (ev.touches.length == 1) {
        let obj = {
          x: ev.targetTouches[0].clientY,
          y: differ.value - ev.targetTouches[0].clientX,
        };
        moveY = obj.y;
        moveX = obj.x;
        canvasTxt.moveTo(startX, startY); //移动画笔
        canvasTxt.lineTo(obj.x, obj.y); //创建线条
        canvasTxt.stroke(); //画线
        startY = obj.y;
        startX = obj.x;
        points.push(obj); //记录点
      }
    };
    const touchEnd = (ev) => {
      ev = ev || event;
      ev.preventDefault();
      if (ev.touches.length == 1) {
        let obj = {
          x: ev.targetTouches[0].clientY,
          y: differ.value - ev.targetTouches[0].clientX,
        };
        points.push(obj); //记录点
        points.push({ x: -1, y: -1 }); //记录点
        canvasTxt.closePath(); //收笔
        canvasTxt.fill();
      }
    };
    const overwrite = () => {
      canvasTxt.clearRect(0, 0, canvasF.value.width, canvasF.value.height);
      points = [];
      isDraw.value = false; //签名标记
    };
    function seaveImages() {
      if (isDraw.value) {
        strDataURI = canvasF.value.toDataURL("image/png");
        console.log(strDataURI);
        cxt.emit("autographConfirm", {
          baseCode: strDataURI,
        });
      } else {
        console.log(Toast);
        Toast("您还没有签名");
      }
    }
    function close() {
      cxt.emit("close", {
        closeFlag: false,
      });
    }
    return {
      differ,
      canvasF,
      canvasHW,
      isDraw,
      touchStart,
      touchMove,
      touchEnd,
      overwrite,
      seaveImages,
      close,
    };
  },
};
</script>
<style>
:root {
  font-size: 12px;
}
</style>
<style scoped>
.signName {
  position: fixed;
  height: 100vw;
  width: 100vh;
  background-color: #fff;
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  transform-origin: left top;
  z-index: 1000;
  /* top:0;
  left: 0; */
}
.close {
  width: 100%;
  height: 10%;
  padding-left: 2.5rem;
  padding-top: 1.2rem;
}
.close img {
  width: 2rem;
}
.autographBox {
  width: 100%;
  height: 100%;
  position: relative;
}
.autographBox div {
  width: 100%;
  height: 100%;
}
.autographBox canvas {
  width: 100%;
  height: 100%;
}
.signName p {
  position: absolute;
  top: 0%;
  left: 28%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: #141414;
  opacity: 0.5;
}
.autographBtn {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: end;
  align-items: center;
  position: absolute;
  top: 90%;
  z-index: 99999;
}
.autographBtn div {
  width: 15%;
  height: 100%;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
  margin-right: 1rem;
}
.autographBtn div:first-child {
  color: #000;
  border: 1px solid #cbcbcb;
  border-radius: 5px;
}
.autographBtn div:nth-child(2) {
  opacity: 0.4;
  background: -webkit-linear-gradient(top, #728cfd 0%, #5c7efe 100%);
  border-radius: 5px;
}
.autographBtn div:last-child {
  background: -webkit-linear-gradient(top, #728cfd 0%, #5c7efe 100%);
  border-radius: 5px;
  margin-right: 5px;
}
</style>
