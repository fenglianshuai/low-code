import {
  reactive
} from 'vue'
import {
  events
} from './events';
export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false, // 当前元素是否在正在拖拽
  }

  let markLine = reactive({
    x: null,
    y: null
  })

  const mousedown = (e) => {
    const {
      width: BWidth,
      height: BHeight
    } = lastSelectBlock.value; // 最后选中的拖拽元素

    // 记录当前选中的位置
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      startTop: lastSelectBlock.value.top, // B点拖拽前的位置top/left
      startLeft: lastSelectBlock.value.left,
      startPos: focusData.value.focus.map(({
        top,
        left
      }) => ({
        top,
        left
      })),
      lines: (() => { // 辅助线计算
        // 获取其他选中没选中组件的位置辅助线
        const {
          unfocused
        } = focusData.value;

        return [...unfocused, {
          top: 0,
          left: 0,
          width: data.value.container.width,
          height: data.value.container.height
        }].reduce((cur, block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight
          } = block;
          // 当此元素拖拽到与A元素top一致时，显示顶部辅助线，辅助线的位置就是ATop
          // 水平：
          cur.y.push({
            showTop: ATop,
            top: ATop
          }) // 顶对顶
          cur.y.push({
            showTop: ATop,
            top: ATop - BHeight
          }) // 顶对底
          cur.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2
          }) // 中对中
          cur.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight
          }) // 底对顶
          cur.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight
          }) // 底对底
          // 竖直：
          cur.x.push({
            showLeft: ALeft,
            left: ALeft
          }) // 左对左
          cur.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth
          }) // 右对左
          cur.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2
          }) // 中对中
          cur.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth
          }) // 右对右
          cur.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth
          }) // 左对右
          return cur
        }, {
          x: [], // 计算纵向线的位置用x存
          y: [] // 计算横向线的位置用y存
        })
      })()
    }
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  const mousemove = (e) => {
    let {
      clientX: moveX,
      clientY: moveY
    } = e

    if (!dragState.dragging) {
      dragState.dragging = true
      events.emit('start') // 拖拽之前触发事件，记录拖拽前的位置
    }

    // 计算最后一个选中的元素最新的top\left,去lines中找要显示的辅助线：鼠标移动后 - 鼠标移动前 + left
    let top = moveY - dragState.startY + dragState.startTop
    let left = moveX - dragState.startX + dragState.startLeft
    // 1. 计算横线，距离参照物元素还有5px的时候，显示辅助线
    let x = null
    let y = null

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const {
        left: l,
        showLeft: s
      } = dragState.lines.x[i] // 获取每一根线
      if (Math.abs(l - left) < 5) {
        x = s // 线要显示的位置
        // 实现快速和元素贴合
        moveX = dragState.startX - dragState.startLeft + l // 容器距离顶部的距离 + 目标的高度 = 最新的moveX
        break; // 找到一根线后跳出循环
      }
    }

    for (let i = 0; i < dragState.lines.y.length; i++) {
      const {
        top: t,
        showTop: s
      } = dragState.lines.y[i] // 获取每一根线
      if (Math.abs(t - top) < 5) {
        y = s // 线要显示的位置
        // 实现快速和元素贴合
        moveY = dragState.startY - dragState.startTop + t // 容器距离顶部的距离 + 目标的高度 = 最新的moveY
        break; // 找到一根线后跳出循环
      }
    }
    // markLines是响应式数据，x/y更新会导致视图更新
    markLine.x = x;
    markLine.y = y;

    let durX = moveX - dragState.startX // 拖拽之前和之后的距离
    let durY = moveY - dragState.startY
    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY
      block.left = dragState.startPos[idx].left + durX
    })
  }
  const mouseup = (e) => {
    markLine.x = null
    markLine.y = null
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)

    if (dragState.dragging) { // 如果只是点击就不会触发
      events.emit('end')
    }
  }
  return {
    mousedown,
    markLine
  }
}