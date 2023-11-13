<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <icon name="iconfont icon-weizhi"></icon>
      <span> {{ placeholder }}</span>
    </div>
    <div v-else-if="mode === 'PC' && !readonly">
      <el-input :disabled="!enableEdit" clearable v-model="_value" :placeholder="placeholder">
        <template #append>
          <el-button icon="el-icon-maplocation" @click="visible = true"></el-button>
        </template>
      </el-input>
      <w-dialog :title="'点击地图选择位置：' + position.addr" v-model="visible" @ok="selectOk">
        <div class="v-map" v-if="visible">
          <el-amap :center="center" :zoom="zoom" @click="clickMap" @init="init">
            <el-amap-marker :visible="true" :position="center"/>
            <el-amap-search-box @select="selectPoi"/>
            <el-amap-control-geolocation :visible="true" @complete="getLocation"/>
          </el-amap>
        </div>
      </w-dialog>
    </div>
    <div v-else-if="mode === 'MOBILE' && !readonly" class="m-v-map">
      <field v-model="_value" :readonly="!enableEdit" clearable :placeholder="placeholder">
        <template #right-icon>
          <icon name="el-icon-maplocation" @click="selectPosition"></icon>
        </template>
      </field>
      <popup v-model:show="visible" :style="popupStyle" position="left" lazy-render safe-area-inset-bottom>
        <nav-bar placeholder :title="$isNotEmpty(position.addr) ? position.addr : '请选择位置'" left-text="返回"
          right-text="确定" left-arrow @click-left="visible = false" @click-right="selectOk"/>
        <el-amap :center="center" :zoom="zoom" @click="clickMap" @init="init">
          <el-amap-marker :visible="true" :position="center"/>
          <el-amap-search-box @select="selectPoi"/>
          <el-amap-control-geolocation :visible="true" @complete="getLocation"/>
        </el-amap>
      </popup>
    </div>
    <div v-else>
      {{ _value }}
    </div>
  </div>
</template>

<script>
import { Field, Popup, NavBar } from 'vant'
import { lazyAMapApiLoaderInstance } from '@vuemap/vue-amap';
import componentMinxins from '../ComponentMinxins'

export default {
  name: 'Location',
  mixins: [componentMinxins],
  components: { Field, Popup, NavBar },
  props: {
    modelValue: {
      default: null,
    },
    placeholder: {
      type: String,
      default: '请选择地理位置',
    },
    enableEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const _this = this
    return {
      visible: false,
      center: [121.59996, 31.197646],
      zoom: 14,
      position: {
        addr: '',
        zb: [117.120098, 36.6512],
      },
      popupStyle: {
        height: '100%',
        width: '100%',
        background: '#f7f7f9',
      },
      geocoder: null
    }
  },
  methods: {
    selectPoi(e){
      console.log(e)
      this.center = [e.poi.location.lng, e.poi.location.lat]
      this.position.zb = this.center
      this.resolveAddr(this.position.zb)
    },
    init(map) {
      console.log(AMap)
      map.plugin('AMap.Geocoder', () => {
        this.geocoder = new AMap.Geocoder();
        //map.addControl(this.geocoder);
      })
    },
    getLocation(e){
      console.log(e)
    },
    clickMap(e){
      let { lng, lat } = e.lnglat
      this.center = [lng, lat]
      console.log(e)
      this.position.zb = [lng, lat]
      this.resolveAddr(this.position.zb)
    },
    resolveAddr(pos){
      this.geocoder.getAddress(pos, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          if (result && result.regeocode) {
            this.position.addr = result.regeocode.formattedAddress
            console.log('获取到位置', result.regeocode.formattedAddress)
          }
        }
      })
    },
    toLocation() {
      if (this.$isNotEmpty(this._value)) {
        var MSearch = new AMap.PlaceSearch(this.searchOption) //构造PlaceSearch类
        AMap.event.addListener(MSearch, 'complete', (val) => {
          if (val.poiList.count > 0) {
            let center = val.poiList.pois[0]
            this.center = [center.location.lng, center.location.lat]
            this.position.zb = [center.location.lng, center.location.lat]
          }
        }) //返回结果
        MSearch.search(this._value) //关键字查询
      } else {
        this.getPosition()
      }
    },
    getPosition() {
      var geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        position: 'RB',
        panToLocation: true,
        showCircle: true,
        buttonOffset: new AMap.Pixel(10, 20),
        zoomToAccuracy: true,
      })
      geolocation.getCurrentPosition(function (status, result) {
        if (status !== 'error') {
          let lng = result.position.lng
          let lat = result.position.lat
          this.position.zb = [lng, lat]
          this.center = [lng, lat]
        } else {
          console.log('定位失败，需要https环境')
        }
      })
    },
    onSearchResult(pois) {
      if (pois.length > 0) {
        let center = pois[0]
        this.position.addr = center.name
        this.center = [center.lng, center.lat]
        this.position.zb = [center.lng, center.lat]
      }
    },
    selectOk() {
      this._value = this.position.addr
      this.visible = false
    },
    selectPosition() {
      this.visible = true
    },
  },
  emits: ['update:modelValue'],
}
</script>

<style lang="less" scoped>
.v-map {
  width: 100%;
  height: 400px;
  position: relative;
}
</style>
