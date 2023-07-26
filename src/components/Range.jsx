import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    start: Number,
    end: Number
  },
  emits: ['update:start', 'update:end'],
  setup(props, ctx) {
    return () => {
      const start = computed({
        get() {
          return props.start
        },
        set(newValue) {
          ctx.emit('update:start', newValue)
        }
      })
      const end = computed({
        get() {
          return props.end
        },
        set(newValue) {
          ctx.emit('update:end', newValue)
        }
      })
      return (
        <div class="range">
          <input type="number" v-model={start.value} />
          <span>~</span>
          <input type="number" v-model={end.value} />
        </div>
      )
    }
  }
})
