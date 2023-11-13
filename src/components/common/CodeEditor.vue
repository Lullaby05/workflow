<template>
  <div ref="editors" :style="{width: '100%', 'height': height}"></div>
</template>
<script lang="ts" setup>
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor';
import {ref, onBeforeUnmount, onMounted} from 'vue'

const props = defineProps({
    lang: {
        type: String,
        default: 'javascript'
    },
    height: {
        type: String,
        default: '300px'
    },
    modelValue: {
        type: String,
        default: ''
    },
    defaultValue: {
        type: String,
        default: ''
    }
})
const editors = ref(null)
const emit = defineEmits(['update:modelValue'])
// @ts-ignore
self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
        if (label === 'json') {
            return new jsonWorker()
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker()
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker()
        }
        if (['typescript', 'javascript'].includes(label)) {
            return new tsWorker()
        }
        return new EditorWorker()
    },
}

let editor: monaco.editor.IStandaloneCodeEditor;
onBeforeUnmount(() => {
    editor.dispose()
})

onMounted(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true
    });

    !editor ? editor = monaco.editor.create(editors.value as HTMLElement, {
            value: props.modelValue, // 编辑器初始显示文字
            language: props.lang, // 语言支持自行查阅demo
            automaticLayout: true, // 自适应布局
            folding: true, // 是否折叠
            foldingHighlight: true, // 折叠等高线
            theme: 'vs', // 官方自带三种主题vs, hc-black, or vs-dark
            foldingStrategy: 'indentation',
            renderLineHighlight: 'all', // 行亮
            selectOnLineNumbers: true, // 显示行号
            minimap:{
                enabled: false,
            },
            lineNumbers: "on",
            readOnly: false, // 只读
            fontSize: 16, // 字体大小
            scrollBeyondLastLine: false, // 取消代码后面一大段空白
            overviewRulerBorder: false, // 不要滚动条的边框
        }) :
        editor.setValue(props.modelValue);
    // console.log(editor)
    // 监听值的变化
    editor.onDidChangeModelContent((val:any) => {
        emit('update:modelValue', editor.getValue())
    })
})

const reloadCode = (value) => {
    editor.setValue(value || props.modelValue)
}

const reloadLang = () => {
    monaco.editor.setModelLanguage(editor.getModel(), props.lang)
}

defineExpose({
    reloadCode
})

</script>
<style scoped lang="less">
#codeEditBox {
  //  width: 100%;
  height: 50%;
}

.select {
  padding: 10px 0;
}

.submit {
  text-align: center;
  padding: 10px 0;

}

.e-box {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  flex-direction: column;
}

.sub-box {
  border-radius: 10px;
  background-color: #999;
  padding: 10px;
  box-sizing: border-box;
  flex: 1;
  color: white;
}
</style>
