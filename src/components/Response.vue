<template>
  <el-tabs
    v-model="editorTabKey"
    style="width: 100%;min-height: 480px;height: 100%"
    type="border-card"
  >
    <el-tab-pane label="Response" :name="editorTabKey">
      <div class="responseContainer">
        <el-input ref="inputSearch" size="small" v-model="searchMsg" placeholder="Search match" @change="onSearchChange"/>
        <v-ace-editor
          ref="editorRef"
          v-if="output"
          v-model:value="output"
          theme="textmate"
          lang="json5"
          @init="editorInit"
          style="width: 100%;min-height: 450px;height:100%;"
          :options="editorOptions"/>
        <div v-else style="position: relative;min-height: 450px;height:100%;">
          <div class="introContainer">
            <h1 class="introTitle">点击Play按钮获取响应</h1>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/theme-textmate'
import 'ace-builds/src-noconflict/mode-json5'
export default {
  components: { VAceEditor },
  data () {
    return {
      editorTabKey: 'responseTab',
      searchMsg: '',
      output: null,
      editorOptions: {
        highlightActiveLine: false,
        showPrintMargin: false,
        showGutter: false,
        showLineNumbers: false,
        tabSize: 1,
        // height: 'calc(100vh-185px)',
        fontSize: 13,
        cursorStart: 2,
        useWorker: true,
        displayIndentGuides: false,
        readOnly: true,
        wrapEnabled: true,
        editor: null
      }
    }
  },
  methods: {
    editorInit (editor) {
      this.editor = editor
    },
    onResponse (data) {
      this.output = JSON.stringify(data, null, '\t')
    },
    onSearchChange () {
      this.editor.findAll(this.searchMsg, {
        backwards: false,
        wrap: true,
        caseSensitive: false,
        wholeWord: false,
        regExp: true,
        skipCurrent: true
      })
    }
  }
}
</script>

<style>
.responseContainer {
  background: white;
  position: relative;
  height: 100%;
}
.introContainer {
  text-align: center;
  margin: 20% 30% auto;
  width: 45%;
  position: absolute;
  z-index: 7;
}
.introTitle {
  user-select: none;
  color: rgba(17, 112, 134, 0.58);
  font-size: 25px;
  top: 120px;
}
</style>
