import deepcopy from 'deepcopy'
import { ElButton, ElLink, ElDialog, ElInput, ElTable, ElTableColumn } from 'element-plus'
import { createVNode, defineComponent, reactive, render } from 'vue'

const TableComponent = defineComponent({
  props: {
    option: Object
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: []
    })

    let methods = {
      show(option) {
        state.option = option // 将用户的配置缓存  更改显示对象
        state.isShow = true
        state.editData = deepcopy(option.data)
      }
    }

    ctx.expose(methods)

    const add = () => {
      state.editData.push({})
    }
    const onDelete = (index) => {
      state.editData.splice(index, 1)
    }
    const reset = () => {
      state.editData = []
    }

    const onCancel = () => {
      state.isShow = false
    }

    const onConfirm = () => {
      state.option.onConfirm(state.editData)
      onCancel()
    }
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.config.label}>
          {{
            default: () => (
              <div>
                <div>
                  <ElButton size="small" onClick={add}>
                    添加
                  </ElButton>
                  <ElButton size="small" onClick={reset}>
                    重置
                  </ElButton>
                </div>
                <ElTable data={state.editData} size="small" border>
                  <ElTableColumn label="序号" type="index" align="center"></ElTableColumn>
                  {state.option.config.table.options.map((item, index) => {
                    return (
                      <ElTableColumn label={item.label} clearable>
                        {{
                          default: ({ row }) => <ElInput v-model={row[item.field]} />
                        }}
                      </ElTableColumn>
                    )
                  })}
                  <ElTableColumn label="操作">
                    {{
                      default: ({ $index }) => (
                        <ElButton type="danger" onClick={() => onDelete($index)}>
                          删除
                        </ElButton>
                      )
                    }}
                  </ElTableColumn>
                </ElTable>
              </div>
            ),
            footer: () => (
              <>
                <ElButton onClick={onCancel}>取 消</ElButton>
                <ElButton type="primary" onClick={onConfirm}>
                  确 定
                </ElButton>
              </>
            )
          }}
        </ElDialog>
      )
    }
  }
})

let vm
export const $TableDialog = (option) => {
  if (!vm) {
    let el = document.createElement('div')
    vm = createVNode(TableComponent, { option })
    document.body.appendChild((render(vm, el), el))
  }
  let { show } = vm.component.exposed
  show(option)
}
