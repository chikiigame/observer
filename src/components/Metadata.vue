<template>
  <div class="optionContainer">
    <el-button size="small" v-on:click="onClick">METADATA</el-button>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="METADATA"
    width="50%"
    :close-on-click-modal="false"
    :modal="false"
    @close="onDialogClose"
    @open="onDialogOpen"
  >
    <v-ace-editor
      ref="requestEditor"
      v-model:value="content"
      theme="textmate"
      lang="json5"
      @init="editorInit"
      @change="onEditorChange"
      style="width: 100%;min-height: 300px;"
      :options="editorOptions"
    />
    <el-button type="primary" @click="update">修改</el-button>
  </el-dialog>
</template>

<script>
import { VAceEditor } from 'vue3-ace-editor'
// const JSON5 = require('json5')
export default {
  components: { VAceEditor },
  props: {
    environmentName: {
      type: String
    }
  },
  data () {
    return {
      dialogVisible: false,
      content: '',
      editorOptions: {
        highlightActiveLine: false,
        showPrintMargin: false,
        showGutter: false,
        fixedWidthGutter: false,
        showLineNumbers: false,
        tabSize: 2,
        fontSize: 13,
        cursorStart: 2,
        useWorker: true,
        displayIndentGuides: true
      },
      editorChanged: false
    }
  },
  methods: {
    update () {
      if (this.editorChanged) {
        this.editorChanged = false
        this.$store.commit('updateMetadata', { name: this.$store.getters.getEnv().name, metadata: this.content })
        // EnvStorage.SetEnvironments(this.$store.getters.getEnvs())
      }
      this.dialogVisible = false
    },
    onDialogOpen () {
      this.content = this.$store.getters.getEnv().metadata
    },
    onEditorChange () {
      this.editorChanged = true
      console.log('onEditorChange')
    },
    editorInit () {
      console.log('metadata editorInit')
    },
    onClick () {
      // console.log('METADATA on click')
      this.dialogVisible = true
    },
    onDialogClose () {
      this.editorChanged = false
      // console.log('onDialogClose')
      // this.update()
    }
  }
}
</script>

<style>
.optionContainer {
  /*position: absolute;*/
  /*font-weight: 900;*/
  /*font-size: 13px;*/
  /*border-left: 1px solid rgba(0, 21, 41, 0.18);*/
  /*background: #f5f5f5;*/
  /*z-index: 10;*/
  /*bottom: -38px;*/
  /*height: 38px;*/
}
.optionLabel {
  background: #001529;
  padding: 7px 10px;
  margin-bottom: 5px;
}
</style>
