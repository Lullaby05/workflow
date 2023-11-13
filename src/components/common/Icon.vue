<script>
import {getCurrentInstance, createVNode, resolveComponent, defineComponent } from 'vue'

const resolveArrName = (propsData, name) => {
  let icon = '', el = ''
  let i = name.findIndex(item => (item || '').indexOf('el-icon-') >= 0)
  if (i > -1){
    icon = name[i]
    name.splice(i, 1)
    el = name.join(' ')
    return () => createVNode('el-icon', {
      class: ['icon', 'el-icon', el, icon],
      style: propsData.styles
    }, [createVNode(resolveComponent(icon))])
  }
}

export default defineComponent({
  name: "Icon",
  components: {},
  props:{
    name:{
      type: [String, Array],
      default: ''
    },
    styles:{
      type: String,
      default: ''
    }
  },
  setup(props) {
    const globalProps = getCurrentInstance()?.appContext.config.globalProperties
    const propsData = globalProps.$deepCopy(props)
    if (Array.isArray(propsData.name)){
      return resolveArrName(propsData, propsData.name)
    }else {
      if (propsData.name.indexOf('el-icon-') === 0){
        let icons = propsData.name.split(' ')
        if (icons.length > 1){
          return resolveArrName(propsData, icons)
        }else {
          return () => createVNode('el-icon', {
            class: [propsData.name, 'icon', 'el-icon'],
            style: propsData.styles
          }, [createVNode(resolveComponent(propsData.name))])
        }
      }else {
        return () => createVNode('i', {
          class: [propsData.name, 'icon'],
          style: propsData.styles
        })
      }
    }
  }
})
</script>

<style scoped>

</style>
