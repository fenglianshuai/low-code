import {
  computed
} from 'vue';
export function useFocus(data, callback) {
  const blockMousedown = (e, block) => {
    e.preventDefault()
    e.stopPropagation()
    // block中定义一个focus的属性用于标识该元素是否被选中
    if (e.shiftKey) {
      block.focus = !block.focus
    } else {
      if (block.focus) {
        block.focus = false
      } else {
        // 当前元素被选中要清空其他block的focus
        clearBlockFocus()
        block.focus = true
      }
    }
    callback(e)
  }

  const focusData = computed(() => {
    let focus = [] // 选中的
    let unfocused = [] // 未选中的
    data.value.blocks.forEach((block) => (block.focus ? focus : unfocused).push(block))
    return {
      focus,
      unfocused
    }
  })

  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false))
  }

  const containerMousedown = () => {
    clearBlockFocus()
  }

  return {
    containerMousedown,
    blockMousedown,
    focusData
  }
}