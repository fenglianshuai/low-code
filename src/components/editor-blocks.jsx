import { computed, defineComponent, inject, ref, onMounted } from 'vue'
import BlockResize from './block-resize'
export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object }
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
      const RenderComponent = component.render({
        size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
        props: props.block.props,
        // model: props.block.model => {default: 'username' }
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          // 为输入框增加一个双向绑定字段
          let propName = props.block.model[modelName]
          prev[modelName] = {
            modelValue: props.formData[propName],
            'onUpdate:modelValue': (v) => (props.formData[propName] = v)
          }
          return prev
        }, {})
      })
      return (
        <div class="editor-block" style={blockStyle.value} ref={blockRef}>
          {RenderComponent}
          {/* 传递block目的是为了修改block的宽高 component中存放了是修改高度还是宽度 */}
          {props.block.focus && <BlockResize block={props.block} component={component} />}
        </div>
      )
    }
  }
})
