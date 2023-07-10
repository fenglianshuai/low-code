import { defineComponent } from 'vue'
import './editor.scss'
export default defineComponent({
  props: {
    data: { type: Object }
  },
  setup(props) {
    console.log(props.data)
    return () => (
      <div class="editor">
        <div class="editor-left">组件区</div>
        <div class="editor-top">工具区</div>
        <div class="editor-right">属性区</div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 负责产生内容 */}
            <div className="editor-container-canvas_content">内容区</div>
          </div>
        </div>
      </div>
    )
  }
})
