import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    block: Object,
    component: Object
  },
  setup(props) {
    const { width, height } = props.component.resize || {}
    let data = {}
    const onmounsedown = (e, direction) => {
      e.stopPropagation()

      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startTop: props.block.top,
        startLeft: props.block.left,
        direction
      }
      document.body.addEventListener('mousemove', onmousemove)
      document.body.addEventListener('mouseup', onmouseup)
    }
    // 拖拽
    const onmousemove = (e) => {
      let { clientX, clientY } = e
      let { startX, startY, startWidth, startHeight, startTop, startLeft, direction } = data

      // 修改元素宽高
      if (direction.horizontal === 'center') {
        clientX = startX
      }

      if (direction.vertical === 'center') {
        clientY = startY
      }
      // 算出鼠标之前与之后的位置
      let durX = clientX - startX
      let durY = clientY - startY
      // 针对反向拖拽的点 需要反向 拿到正在拖拽组件的top left
      if (direction.vertical === 'start') {
        durY = -durY
        props.block.top = startTop - durY
      }
      if (direction.horizontal === 'start') {
        durX = -durX
        props.block.left = startLeft - durX
      }
      const width = startWidth + durX
      const height = startHeight + durY
      props.block.width = width
      props.block.height = height
      props.block.hasResize = true
    }

    const onmouseup = () => {
      document.body.removeEventListener('mousemove', onmousemove)
      document.body.removeEventListener('mouseup', onmouseup)
    }
    return () => {
      return (
        <>
          {width && (
            <>
              <div
                className="block-resize block-resize-left"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'start', vertical: 'center' })}
              ></div>
              <div
                className="block-resize block-resize-right"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'end', vertical: 'center' })}
              ></div>
            </>
          )}
          {height && (
            <>
              <div
                className="block-resize block-resize-top"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'center', vertical: 'start' })}
              ></div>
              <div
                className="block-resize block-resize-bottom"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'center', vertical: 'end' })}
              ></div>
            </>
          )}
          {width && height && (
            <>
              <div
                className="block-resize block-resize-top-left"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'start', vertical: 'start' })}
              ></div>
              <div
                className="block-resize block-resize-top-right"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'end', vertical: 'start' })}
              ></div>
              <div
                className="block-resize block-resize-bottom-left"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'start', vertical: 'end' })}
              ></div>
              <div
                className="block-resize block-resize-bottom-right"
                onMousedown={(e) => onmounsedown(e, { horizontal: 'end', vertical: 'end' })}
              ></div>
            </>
          )}
        </>
      )
    }
  }
})
