import deepcopy from 'deepcopy'
import { ElButton, ElTag } from 'element-plus'
import { computed, defineComponent } from 'vue'
import { $TableDialog } from './TableDialog'

export default defineComponent({
  props: {
    propConfig: Object,
    modelValue: Array
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const state = computed({
      get() {
        return props.modelValue || []
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })

    const add = () => {
      $TableDialog({
        config: props.propConfig,
        data: state.value,
        onConfirm(value) {
          state.value = value
        }
      })
    }
    return () => {
      // 当前下拉框没有数据显示一个按钮
      return (
        <div>
          {(!state.value || state.value.length === 0) && (
            <ElButton size="small" onClick={add}>
              添加
            </ElButton>
          )}
          {(state.value || []).map((item) => (
            <ElTag onClick={add}>{item[props.propConfig.table.key]}</ElTag>
          ))}
        </div>
      )
    }
  }
})
