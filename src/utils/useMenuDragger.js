export function useMenuDragger(data, containerRef) {
  let currentComponent = null
  const dragstart = (e, component) => {
    // 为目标元素绑定事件
    // 1. dragenter 进入元素中 添加一个移动的标识
    // 2. dragover 经过目标元素，必须要阻止默认行为否则不会触发drop事件
    // 3. dragleave 离开元素 添加一个禁用的标识
    // 4. drop 松开的时候根据拖拽的组件添加一个组件
    containerRef.value.addEventListener('dragenter', dragenter)
    containerRef.value.addEventListener('dragover', dragover)
    containerRef.value.addEventListener('dragleave', dragleave)
    containerRef.value.addEventListener('drop', drop)
    currentComponent = component
  }

  const dragenter = (e) => {
    e.dataTransfer.dropEffect = 'move'
  }
  const dragover = (e) => {
    e.preventDefault()
  }
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = 'none'
  }
  const drop = (e) => {
    const blocks = data.value.blocks
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true
        }
      ]
    }
    currentComponent = null
    containerRef.value.removeEventListener('dragenter', dragenter)
    containerRef.value.removeEventListener('dragover', dragover)
    containerRef.value.removeEventListener('dragleave', dragleave)
    containerRef.value.removeEventListener('drop', drop)
  }
  return {
    dragstart
  }
}