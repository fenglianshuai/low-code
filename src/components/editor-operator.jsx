import deepcopy from 'deepcopy'
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElInputNumber,
  ElInput,
  ElColorPicker,
  ElSelect,
  ElOption
} from 'element-plus'
import { defineComponent, inject, reactive, watch } from 'vue'
import TableEditor from './table-editor'

export default defineComponent({
  props: {
    block: { type: Object },
    data: { type: Object },
    updateContainer: { type: Function },
    updateBlock: { type: Function }
  },
  setup(props, ctx) {
    const config = inject('config')
    const state = reactive({
      editData: {}
    })
    // 重置
    const reset = () => {
      if (!props.block) {
        // 没有block绑定的是容器的宽高
        state.editData = deepcopy(props.data.container)
      } else {
        state.editData = deepcopy(props.block)
      }
    }
    // 应用
    const apply = () => {
      if (!props.block) {
        // 更新容器
        props.updateContainer({ ...props.data, container: state.editData })
      } else {
        // 更新内容
        props.updateBlock(state.editData, props.block)
      }
    }
    watch(() => props.block, reset, { immediate: true })

    return () => {
      let content = []
      if (props.block) {
        // 组件属性
        let component = config.componentMap[props.block.key]
        if (component && component.props) {
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                    color: () => (
                      <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((opt) => {
                          return <ElOption label={opt.label} value={opt.value}></ElOption>
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <TableEditor
                        propConfig={propConfig}
                        v-model={state.editData.props[propName]}
                      ></TableEditor>
                    )
                  }[propConfig.type]()}
                </ElFormItem>
              )
            })
          )
        }

        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              )
            })
          )
        }
      } else {
        // 容器属性
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </>
        )
      }
      return (
        <ElForm size="small">
          {content}
          <ElFormItem>
            <ElButton type="primary" onclick={apply}>
              应用
            </ElButton>
            <ElButton onclick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      )
    }
  }
})
