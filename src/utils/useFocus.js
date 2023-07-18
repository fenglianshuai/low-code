import {
  computed,
  ref
} from 'vue';
export function useFocus(data, previewRef, callback) {
  const selectIndex = ref(-1)
  // 最后选中的组件
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return
    e.preventDefault()
    e.stopPropagation()
    // block中定义一个focus的属性用于标识该元素是否被选中
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) { // 当只有一个组件被选中时，按住shift也不会切换选中状态
        block.focus = true
      } else {
        block.focus = !block.focus
      }
    } else {
      if (!block.focus) { // 当前组件已被选中，再次点击还是选中状态
        clearBlockFocus()
        block.focus = true
      }
    }
    selectIndex.value = index;
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

  // 当前元素被选中要清空其他block的focus
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false))
    selectIndex.value = -1;
  }

  const containerMousedown = () => {
    if (previewRef.value) return
    clearBlockFocus()
  }

  return {
    containerMousedown,
    blockMousedown,
    clearBlockFocus,
    focusData,
    lastSelectBlock
  }
}