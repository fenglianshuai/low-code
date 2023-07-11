import { computed, defineComponent, inject, ref } from 'vue'
import './editor.scss'
import EditorBlocks from './editor-blocks'
import deepcopy from 'deepcopy'
import { useMenuDragger } from '../utils/useMenuDragger.js'
import { useFocus } from '../utils/useFocus'
import { useBlockDragger } from '../utils/useBlockDragger'
export default defineComponent({
  props: {
    modelValue: { type: Object }
  },

  emits: ['update:modelValue'],

  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })

    const containerStyle = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))

    const config = inject('config')

    const containerRef = ref(null) // 目标元素
    // 1. 菜单拖拽功能
    const { dragstart } = useMenuDragger(data, containerRef)
    // 2. 获取焦点 选中后可进行拖拽
    const { containerMousedown, blockMousedown, focusData } = useFocus(data, (e) => {
      mousedown(e)
    })
    // 内容区拖拽
    const { mousedown } = useBlockDragger(focusData)

    // 3. 拖拽多个元素

    return () => (
      <div class="editor">
        {/* 左侧组件物料区 */}
        <div class="editor-left">
          {/* 根据注册列表渲染对应的内容 */}
          {config.componentList.map((component) => (
            <div class="editor-left-item" draggable onDragstart={(e) => dragstart(e, component)}>
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">工具区</div>
        <div class="editor-right">属性区</div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 负责产生内容 */}
            <div
              className="editor-container-canvas_content"
              style={containerStyle.value}
              onMousedown={containerMousedown}
              ref={containerRef}
            >
              {data.value.blocks.map((block) => (
                <EditorBlocks
                  block={block}
                  class={block.focus ? 'editor-block-focus' : ''}
                  onMousedown={(e) => blockMousedown(e, block)}
                ></EditorBlocks>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
