export function useBlockDragger(focusData) {
  let dragState = {
    startX: 0,
    startY: 0
  }
  const mousedown = (e) => {
    // 记录当前选中的位置
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: focusData.value.focus.map(({
        top,
        left
      }) => ({
        top,
        left
      }))
    }
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  const mousemove = (e) => {
    const {
      clientX: moveX,
      clientY: moveY
    } = e
    let durX = moveX - dragState.startX
    let durY = moveY - dragState.startY
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY
      block.left = dragState.startPos[idx].left + durX
    })
  }
  const mouseup = (e) => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }
  return {
    mousedown
  }
}