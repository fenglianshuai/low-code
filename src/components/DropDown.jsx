import {
  computed,
  createVNode,
  defineComponent,
  provide,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  render
} from 'vue'

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String
  },

  setup(props) {
    const { icon, label } = props
    const hide = inject('hide')
    return () => {
      return (
        <div class="dropdown-item" onClick={hide}>
          <i class={icon}></i>
          <span>{label}</span>
        </div>
      )
    }
  }
})

const dropDownComponent = defineComponent({
  props: {
    option: { type: Object }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0
    })

    const el = ref(null)

    provide('hide', () => (state.isShow = false))

    ctx.expose({
      showDropdown(option) {
        state.option = option
        state.isShow = true
        const { top, left, height } = option.el.getBoundingClientRect()
        state.top = top + height
        state.left = left
      }
    })

    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])

    const style = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px'
    }))

    const onMouseDownDocument = (e) => {
      if (el.value.contains(e.target)) {
      } else {
        state.isShow = false
      }
    }

    onMounted(() => {
      document.addEventListener('mousedown', onMouseDownDocument, true)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onMouseDownDocument)
    })
    return () => {
      return (
        <div class={classes.value} style={style.value} ref={el}>
          {state.option.content()}
        </div>
      )
    }
  }
})

let vm
export function $dropDown(option) {
  if (!vm) {
    const el = document.createElement('div')
    vm = createVNode(dropDownComponent, { option })

    document.body.appendChild((render(vm, el), el))
  }

  let { showDropdown } = vm.component.exposed
  showDropdown(option)
}
