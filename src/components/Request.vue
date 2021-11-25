<template>
  <el-tabs
    v-model="editorTabKey"
    style="width: 50%"
    type="border-card"
  >
    <el-tab-pane label="Editor" :name="editorTabKey">
      <v-ace-editor
        ref="requestEditor"
        v-model:value="content"
        theme="textmate"
        lang="json5"
        @init="editorInit"
        style="width: 100%;min-height: 480px;height:100%;"
        :options="editorOptions"
        @change="onEditorChange"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/theme-textmate'
import 'ace-builds/src-noconflict/mode-json5'
import 'ace-builds/src-noconflict/ext-language_tools'
const JSON5 = require('json5')
// import { Message } from 'protobufjs'

export default {
  components: { VAceEditor },
  props: {
    data: {
      type: Object
    },
    onRequestEditorChange: {
      type: Function
    }
  },
  data () {
    const content = this.data.content ? this.data.content : JSON5.stringify(this.data.data.plain, null, '\t')
    console.log('request data content', content)
    return {
      editorTabKey: 'editorTab',
      content: content,
      editorChanged: false,
      // content: '',
      editorOptions: {
        highlightActiveLine: false,
        showPrintMargin: false,
        showGutter: true,
        fixedWidthGutter: true,
        showLineNumbers: true,
        tabSize: 2,
        fontSize: 13,
        cursorStart: 2,
        useWorker: true,
        displayIndentGuides: true
      }
    }
  },
  methods: {
    editorInit () {
    },
    getData () {
      const data = JSON5.parse(this.content)
      console.log('request getData', this.data, data)
      const message = this.data.data.messageType.fromObject(data)
      // console.log('request getData message ', message, this.data.messageType.encode(message).finish())
      return {
        data,
        // fullname: this.data.name,
        buffer: Array.from(this.data.data.messageType.encode(message).finish()),
        // filename: this.data.filename,
        responseType: this.data.data.responseType
      }
    },
    onEditorChange () {
      if (!this.editorChanged) {
        this.editorChanged = true
        setTimeout(() => {
          this.$store.commit('updateTabContent', {
            name: this.data.name,
            content: this.content
          })
          this.editorChanged = false
        }, 500)
      }
    }
  },
  setup () {}
}
</script>

<style>

</style>
