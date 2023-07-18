import { computed, defineComponent, inject, ref, onMounted } from 'vue'
export default defineComponent({
  props: {
    block: { type: Object }
  },
  setup(props) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }))

    const config = inject('config')

    const blockRef = ref(null)
    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value
      // 只有是拖拽松手的时候渲染的时候才居中，其他的默认渲染到页面上的内容不居中
      if (props.block.alignCenter) {
        props.block.top = props.block.top - offsetHeight / 2
        props.block.left = props.block.left - offsetWidth / 2
        props.block.alignCenter = false
      }
      props.block.width = offsetWidth
      props.block.height = offsetHeight
    })

    return () => {
      // 通过block的key属性获取对应的组件
      const component = config.componentMap[props.block.key]
      // 获取render函数
      const RenderComponent = component.render()
      return (
        <div class="editor-block" style={blockStyle.value} ref={blockRef}>
          {RenderComponent}
        </div>
      )
    }
  }
})
