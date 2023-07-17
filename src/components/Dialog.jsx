import { ElButton, ElInput, ElDialog } from 'element-plus'
import { createVNode, defineComponent, reactive, render } from 'vue'

const DialogComponent = defineComponent({
  props: { option: { type: Object } },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false
    })
    // 抛出方法
    ctx.expose({
      showDialog(option) {
        state.option = option
        state.isShow = true
      }
    })
    // 取消
    const cancel = () => {
      state.isShow = false
    }
    // 确定
    const confirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.option.content)
      state.isShow = false
    }

    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput type="textarea" v-model={state.option.content} rows={20}></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={cancel}>取消</ElButton>
                  <ElButton type="primary" onClick={confirm}>
                    确定
                  </ElButton>
                </div>
              )
          }}
        </ElDialog>
      )
    }
  }
})

let vm
export function $dialog(option) {
  // element-plus中存在dialog组件
  // 手动挂载组件
  if (!vm) {
    let el = document.createElement('div')
    // 创建虚拟节点 将组件渲染成虚拟节点
    vm = createVNode(DialogComponent, { option })
    // 将虚拟节点转换成真实节点 将el放到页面中
    document.body.appendChild((render(vm, el), el))
  }
  let { showDialog } = vm.component.exposed
  showDialog(option)
}
