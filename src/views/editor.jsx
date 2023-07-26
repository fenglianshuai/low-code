import { computed, defineComponent, inject, ref } from 'vue'
import './editor.scss'
import EditorBlocks from '../components/editor-blocks'
import deepcopy from 'deepcopy'
import { useMenuDragger } from '../utils/useMenuDragger.js'
import { useFocus } from '../utils/useFocus'
import { useBlockDragger } from '../utils/useBlockDragger'
import { useCommand } from '../utils/useCommand'
import { $dialog } from '../components/Dialog'
import { $dropDown, DropdownItem } from '../components/DropDown'
import EditorOperator from '../components/editor-operator'
export default defineComponent({
  props: {
    modelValue: { type: Object },
    formData: { type: Object }
  },

  emits: ['update:modelValue'],

  setup(props, ctx) {
    // 预览的时候内容不能操作，可以点击输入内容 方便查看效果
    const previewRef = ref(false)

    // 画布内容json
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        // 修改值将数据抛出，达到跟新数据的目的
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })
    // 设置画布大小
    const containerStyle = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))
    // config数据，对组件物料区进行渲染
    const config = inject('config')

    // 1. 菜单拖拽功能
    const containerRef = ref(null) // 目标元素
    const { dragstart } = useMenuDragger(data, containerRef)

    // 2. 获取焦点 选中后可进行拖拽
    const { containerMousedown, blockMousedown, clearBlockFocus, focusData, lastSelectBlock } =
      useFocus(data, previewRef, (e) => {
        mousedown(e)
      })
    // 2-1.内容区拖拽 - 制作辅助线
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)
    // 3. 工具区撤销与重做
    const { commands } = useCommand(data, focusData)
    const buttons = [
      {
        label: '撤销',
        keyboard: 'ctrl+z',
        icon: 'icon-chexiaozuo',
        handler: () => commands.undo()
      },
      {
        label: '重做',
        keyboard: 'ctrl+y',
        icon: 'icon-chexiaoyou',
        handler: () => commands.redo()
      },
      {
        label: '导入',
        icon: 'icon-daoru',
        handler: () => {
          $dialog({
            title: '导入',
            content: '',
            footer: true,
            onConfirm(json) {
              console.log(json)
              commands.updateContainer(JSON.parse(json))
            }
          })
        }
      },
      {
        label: '导出',
        icon: 'icon-daochu',
        handler: () => {
          $dialog({
            title: '导出',
            content: JSON.stringify(data.value, null, 4),
            footer: true,
            onConfirm(json) {
              console.log(json)
            }
          })
        }
      },
      {
        label: '置顶',
        keyboard: 'ctrl++',
        icon: 'icon-control-top',
        handler: () => {
          commands.placeTop()
        }
      },
      {
        label: '置地',
        keyboard: 'ctrl+-',
        icon: 'icon-control-bottom',
        handler: () => {
          commands.placeBottom()
        }
      },
      {
        label: '删除',
        keyboard: 'delete',
        icon: 'icon-shanchu',
        handler: () => {
          commands.delete()
        }
      },
      {
        label: () => (previewRef.value ? '编辑' : '预览'),
        icon: () => (previewRef.value ? 'icon-bianji' : 'icon-yulan04'),
        handler: () => {
          previewRef.value = !previewRef.value
          clearBlockFocus()
        }
      }
    ]

    // 鼠标右键事件
    const onContextmenuBlock = (e, block) => {
      e.preventDefault()
      $dropDown({
        el: e.target, // 以那个元素产生弹窗
        content: () => (
          <>
            <DropdownItem
              label="删除"
              icon="icon-shanchu"
              onClick={() => {
                commands.delete()
              }}
            ></DropdownItem>
            <DropdownItem
              label="置顶"
              icon="icon-control-top"
              onClick={() => {
                commands.placeTop()
              }}
            ></DropdownItem>
            <DropdownItem
              label="置底"
              icon="icon-control-bottom"
              onClick={() => {
                commands.placeBottom()
              }}
            ></DropdownItem>
            <DropdownItem
              label="查看"
              icon="icon-chakan2"
              onClick={() => {
                $dialog({
                  title: '查看节点数据',
                  content: JSON.stringify(block, null, 4)
                })
              }}
            ></DropdownItem>
            <DropdownItem
              label="替换"
              icon="icon-tihuanqiankebao"
              onClick={() => {
                $dialog({
                  title: '导入节点数据',
                  content: JSON.stringify(block, null, 4),
                  footer: true,
                  onConfirm(json) {
                    const newBlock = JSON.parse(json)
                    commands.updateBlock(newBlock, block)
                  }
                })
              }}
            ></DropdownItem>
          </>
        )
      })
    }

    return () => (
      <div class="editor">
        {/* 左侧组件物料区 */}
        <div class="editor-left">
          {/* 根据注册列表渲染对应的内容 */}
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable={!previewRef.value}
              onDragstart={(e) => dragstart(e, component)}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        {/* 头部工具区 */}
        <div class="editor-top">
          {buttons.map((btn) => {
            const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
            const label = typeof btn.label === 'function' ? btn.label() : btn.label
            return (
              <i class={icon} title={`${label}${btn.keyboard || ''}`} onClick={btn.handler}></i>
            )
          })}
        </div>
        {/* 右侧属性区 */}
        <div class="editor-right">
          <EditorOperator
            block={lastSelectBlock.value}
            data={data.value}
            updateContainer={commands.updateContainer}
            updateBlock={commands.updateBlock}
          ></EditorOperator>
        </div>
        {/* 中间内容区 */}
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
              {/* 内容组件渲染 */}
              {data.value.blocks.map((block, index) => (
                <EditorBlocks
                  block={block}
                  class={{
                    'editor-block-focus': block.focus,
                    'editor-block-preview': previewRef.value
                  }}
                  formData={props.formData}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                  onContextmenu={(e) => onContextmenuBlock(e, block)}
                ></EditorBlocks>
              ))}
              {markLine.x !== null && (
                <div class="line-x" style={{ left: `${markLine.x}px` }}></div>
              )}
              {markLine.y !== null && <div class="line-y" style={{ top: `${markLine.y}px` }}></div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
