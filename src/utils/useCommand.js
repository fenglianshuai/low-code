import deepcopy from 'deepcopy'
import {
  events
} from './events'
import {
  onUnmounted
} from 'vue'

export function useCommand(data, focusData) {
  const state = { // 前进后退需要的指针
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有操作的命令
    commands: {}, // 制作命令和执行功能 映射表
    commandArray: [], // 存放所有的命令
    destroyedArray: [], // 存放所有销毁函数
  }

  // 注册方法
  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = (...args) => { // 命令名字对应执行函数
      const {
        redo,
        undo
      } = command.execute(...args)
      redo();
      // 判断命令是否需要放到队列中，不需要放到队列中直接跳过
      if (command.pushQueue) {
        let {
          queue,
          current
        } = state;

        if (queue.length > 0) { // 可能在放置组件的过程中有撤回的操作，所以需要根据当前最新的current值来计算新的队列
          queue = queue.slice(0, current + 1)
          state.queue = queue
        }

        // 保存指令的前进后退
        queue.push({
          redo,
          undo
        })
        state.current = current + 1
      }
    }
  }

  /*******************************************************注册需要的命令*******************************************************************/
  // 重做
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1]
          if (item) {
            item.redo && item.redo();
            state.current++
          }
        }
      }
    }
  })
  // 撤销
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return; // 没有可撤销内容
          const item = state.queue[state.current]
          if (item) {
            item.undo && item.undo();
            state.current--
          }
        }
      }
    }
  })
  // 拖拽
  registry({ // 如果希望将操作放到队列中可以增加一个属性 标识等会操作要放到队列中
    name: 'drag',
    pushQueue: true,
    init() { // 初始化操作，默认就会执行 监控拖拽前 拖拽后
      this.before = null;
      // 监控拖拽开始事件 保存状态
      const start = () => this.before = deepcopy(data.value.blocks)
      // 拖拽之后需要触发对应的指令
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)

      return () => { // 返回一个卸载函数 解绑使用
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute() {
      let before = this.before; // 之前的状态
      let after = data.value.blocks; // 之后的状态
      return {
        redo() { // 默认拖拽一松手就直接把当前函数执行
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() { // 前一步的数据
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  });
  // 更新整个容器内容 带有历史记录
  registry({
    name: 'updateContainer',
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue
      }
      return {
        redo() { // 前进
          data.value = state.after
        },
        undo() { // 后退
          data.value = state.before
        }
      }
    }
  })
  // 更新单个block
  registry({
    name: 'updateBlock',
    pushQueue: true,
    execute(newBlock, oldBlock) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks]
          const index = data.value.blocks.indexOf(oldBlock)
          if (index > -1) {
            blocks.splice(index, 1, newBlock)
          }
          return blocks
        })()
      }
      return {
        redo() { // 前进
          data.value = {
            ...data.value,
            blocks: state.after
          }
        },
        undo() { // 后退
          data.value = {
            ...data.value,
            blocks: state.before
          }
        }
      }
    }
  })

  // 置顶
  registry({
    name: 'placeTop',
    keyboard: 'ctrl++',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks);
      const after = (() => { // 在所有的blocks中找到zIndex最大的
        const {
          focus,
          unfocused
        } = focusData.value
        const maxZIndex = unfocused.reduce((cur, block) => {
          return Math.max(cur, block.zIndex)
        }, -Infinity)
        focus.forEach(block => block.zIndex = maxZIndex + 1)
        return data.value.blocks
      })()
      return {
        redo() { // 前进
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() { // 后退
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  })
  // 置底
  registry({
    name: 'placeBottom',
    keyboard: 'ctrl+-',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks);
      const after = (() => { // 在所有的blocks中找到zIndex最大的
        const {
          focus,
          unfocused
        } = focusData.value
        let minZIndex = unfocused.reduce((cur, block) => {
          return Math.min(cur, block.zIndex)
        }, Infinity) - 1
        // 如果是负值则让没选中的组件向上自己变成0
        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex)
          minZIndex = 0
          unfocused.forEach(block => block.zIndex += dur)
        }
        focus.forEach(block => block.zIndex = minZIndex) // 控制选中项的值
        return data.value.blocks
      })()
      console.log(after);
      return {
        redo() { // 前进
          data.value = {
            ...data.value,
            blocks: after
          }
        },
        undo() { // 后退
          data.value = {
            ...data.value,
            blocks: before
          }
        }
      }
    }
  })

  // 删除
  registry({
    name: 'delete',
    keyboard: 'delete',
    pushQueue: true,
    execute() {
      const state = {
        before: deepcopy(data.value.blocks),
        after: focusData.value.unfocused // 选中的都删除了
      }
      return {
        redo() { // 前进
          data.value = {
            ...data.value,
            blocks: state.after
          }
        },
        undo() { // 后退
          data.value = {
            ...data.value,
            blocks: state.before
          }
        }
      }
    }
  })

  // 注册键盘事件
  const keybarodEvent = (() => {
    const keyCodes = {
      89: 'y',
      90: 'z',
      107: '+',
      109: '-',
    }
    const keydown = (e) => {
      const {
        ctrlKey,
        keyCode
      } = e;
      let keyString = []
      if (ctrlKey) keyString.push('ctrl')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')
      state.commandArray.forEach(({
        keyboard,
        name
      }) => {
        if (!keyboard) return
        if (keyboard === keyString) {
          e.preventDefault()
          state.commands[name]()
        }
        // 删除
        if (!ctrlKey && keyCode === 46) {
          e.preventDefault()
          state.commands[name]()
        }
      })
    }
    const init = () => { // 初始化事件
      window.addEventListener('keydown', keydown)
      return () => { // 销毁事件
        window.removeEventListener('keydown', keydown)
      }
    }
    return init;
  })();

  // 指令初始化
  (() => {
    // 监听键盘事件
    state.destroyedArray.push(keybarodEvent())
    state.commandArray.forEach(command => command.init && state.destroyedArray.push(command.init()))
  })();

  // 执行销毁函数 清理绑定的事件
  onUnmounted(() => {
    state.destroyedArray.forEach(fn => fn && fn())
  })

  return state
}