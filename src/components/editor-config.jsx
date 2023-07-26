// 列表区显示所有物料
// key对应组件的映射关系
import { ElButton, ElInput, ElOption, ElSelect } from 'element-plus'
import Range from './Range'

function createEditorConfig() {
  // 组件列表
  const componentList = []
  // 组件映射关系
  const componentMap = {}

  return {
    componentList,
    componentMap,
    // 注册方法
    register: (component) => {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}

export let registerConfig = createEditorConfig()
const createInputProp = (label) => ({ type: 'input', label })
const createColorProp = (label) => ({ type: 'color', label })
const createSelectProp = (label, options) => ({ type: 'select', label, options })
const createTableProp = (label, table) => ({ type: 'table', label, table })
// 注册组件
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: ({ props, size }) => {
    return (
      <span
        style={{
          color: props.color,
          fontSize: props.size,
          width: `${size.width}px`,
          height: `${size.height}px`
        }}
      >
        {props.text || '渲染文本'}
      </span>
    )
  },
  key: 'text',
  resize: {
    width: true,
    height: true
  },
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      { label: '14px', value: '14px' },
      { label: '18px', value: '18px' },
      { label: '20px', value: '20px' },
      { label: '24px', value: '24px' },
      { label: '26px', value: '26px' }
    ])
  }
})

registerConfig.register({
  label: '按钮',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ props, size }) => (
    <ElButton
      type={props.type}
      size={props.size}
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
    >
      {props.text || '渲染按钮'}
    </ElButton>
  ),
  key: 'button',
  props: {
    text: createInputProp('按钮内容'),
    type: createSelectProp('按钮类型', [
      { label: '基础', value: 'primary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
      { label: '文本', value: 'text' }
    ]),
    size: createSelectProp('按钮尺寸', [
      { label: '大', value: 'large' },
      { label: '默认', value: 'default' },
      { label: '小', value: 'small' }
    ])
  }
})

registerConfig.register({
  label: '输入框',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElInput placeholder="预览输入框"></ElInput>,
  render: ({ model, props, size }) => (
    <ElInput
      placeholder="渲染输入框"
      {...model.default}
      size={props.size}
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
    ></ElInput>
  ),
  key: 'input',
  props: {
    size: createSelectProp('按钮尺寸', [
      { label: '大', value: 'large' },
      { label: '默认', value: 'default' },
      { label: '小', value: 'small' }
    ])
  },
  model: {
    default: '绑定字段'
  }
})

registerConfig.register({
  label: '范围选择器',
  resize: {
    width: true,
    height: true
  },
  preview: () => <Range placeholder="预览范围选择器"></Range>,
  render: ({ model, size }) => {
    return (
      <Range
        {...{
          start: model.start.modelValue,
          end: model.end.modelValue,
          'onUpdate:start': model.start['onUpdate:modelValue'],
          'onUpdate:end': model.end['onUpdate:modelValue']
        }}
        style={{ width: `${size.width}px`, height: `${size.height}px` }}
      ></Range>
    )
  },
  key: 'range',
  props: {},
  model: {
    start: '开始范围字段',
    end: '结束范围字段'
  }
})

registerConfig.register({
  label: '下拉框',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElSelect placeholder="预览下拉框"></ElSelect>,
  render: ({ model, props, size }) => {
    return (
      <ElSelect {...model.default} style={{ width: `${size.width}px`, height: `${size.height}px` }}>
        {(props.options || []).map((opt, index) => (
          <ElOption label={opt.label} value={opt.value} key={index} />
        ))}
      </ElSelect>
    )
  },
  key: 'select',
  props: {
    options: createTableProp('下拉选项', {
      options: [
        {
          label: '显示值',
          field: 'label'
        },
        {
          label: '绑定值',
          field: 'value'
        }
      ],
      key: 'label' // 显示给用户的值是label
    })
  },
  model: {
    default: '绑定字段'
  }
})
