<template>
  <div class="editorTab">
    <div class="inputContainer">
      <el-form :inline="true" :model="formData" class="demo-form-inline" size="mini">
        <el-form-item label="obj" size="mini">
          <el-input v-model="formData.obj" ></el-input>
        </el-form-item>
        <el-form-item label="func" size="mini">
          <el-input v-model="formData.func" ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="editorContainer">
<!--      <vue-resizable>-->
        <Request ref="request" :data="requestData"/>
        <div class="playIconContain">
          <PlayButton :on-play-button-click="onPlayButtonClick"/>
        </div>
<!--      </vue-resizable>-->
        <div class="responseContainer">
          <Response style="width: inherit" ref="response"/>
        </div>
    </div>
  </div>
</template>

<script>
// import VueDragResize from 'vue-drag-resize'
import Request from './Request'
import Response from './Response'
import PlayButton from './PlayButton'
import { rpcRequest } from '../script/request'
import { util } from 'protobufjs'
import { ElMessage } from 'element-plus'
// import Metadata from './Metadata'
const JSON5 = require('json5')
// import VueResizable from 'vue-resizable'
export default {
  components: { Request, PlayButton, Response },
  props: {
    requestData: {
      type: Object
    }
  },
  data () {
    return {
      formData: {
        obj: '',
        func: ''
      }
    }
  },
  methods: {
    // onEditorClick () {
    //   // console.log('onEditorClick', this.requestData)
    //   this.url = this.$store.getters.getEnv(this.environmentName).url
    // },
    getEnvironment () {
      return this.$store.getters.getEnv()
    },
    getUrl () {
      return this.getEnvironments().url
    },
    fixServiceName (name) {
      if (name === 'chat_room') {
        return 'chat'
      } else if (name.includes('family')) {
        return 'family'
      } else if (name === 'game_queue') {
        return 'gameQueue'
      } else if (name.includes('report_data')) {
        return 'gameLog'
      } else if (name === 'system_msg') {
        return 'systemMsg'
      } else if (name === 'user_status') {
        return 'userstatus'
      }
      return name
    },
    async onPlayButtonClick () {
      const reqData = this.$refs.request.getData()
      console.log('onPlayButtonClick', reqData)
      const opt = JSON5.parse(this.getEnvironment().metadata)
      const reqParam = {
        obj: this.formData.obj,
        func: this.formData.func,
        req: reqData.buffer,
        opt: opt
      }
      try {
        const response = await rpcRequest(this.getEnvironment().url, reqParam)
        console.log('response:', response)
        if (response && response.data) {
          if (response.data.ret && response.data.ret !== 0) {
            console.log('response error', response.data.ret, response.data.desc)
            ElMessage({
              showClose: true,
              message: response.data.ret + ':' + response.data.desc,
              type: 'error'
            })
            return
          }
          let resData = {}
          if (response.data.rsp) {
            const buffer = util.newBuffer(util.base64.length(response.data.rsp))
            util.base64.decode(response.data.rsp, buffer, 0)
            console.log('response.data.rsp', response.data.rsp, buffer)
            resData = reqData.responseType.decode(buffer)
            console.log('response data:', resData)
            ElMessage({
              showClose: true,
              message: '请求成功',
              type: 'success'
            })
          }
          this.$refs.response.onResponse(resData)
        }
      } catch (e) {
        console.log('request failed:', e)
      }
    }
  },
  setup () {},
  mounted () {
    if (this.requestData && this.requestData.name !== 'new') {
      const name = this.requestData.name.split('.')
      this.formData.obj = [this.getEnvironment().app, this.fixServiceName(this.requestData.filename.split('.')[0]), name[name.length - 2]].join('.')
      this.formData.func = name[name.length - 1]
      if (!this.requestData.saved) {
        this.$store.commit('updateTab', {
          name: this.requestData.name,
          obj: this.formData.obj,
          func: this.formData.func,
          filename: this.requestData.filename,
          content: JSON5.stringify(this.requestData.data.plain, null, '\t')
        })
      }
    }
  }
}
</script>

<style>
.editorTab {
  width: 100%;
  height: 100%;
  position: relative;
}
.editorContainer {
  display: flex;
  height: 100%;
  border-left: 1px solid rgba(0, 21, 41, 0.18);
  background: #ffffff;
}
.playIconContain {
  /*position: absolute;*/
  z-index: 10;
  right: -30px;
  margin-left: -25px;
  margin-right: -25px;
  margin-top: 200px;
  top: calc(50% - 80px);
}
.responseContainer {
  background: white;
  /*max-width: inherit;*/
  width: inherit;
  height: 100%;
  /*display: ;*/
  flex: 1 1 0;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid rgba(0, 21 ,41, 0.18);
  overflow: auto;
}
.inputContainer {
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(0, 21, 41, 0.18);
  border-bottom: 1px solid #eeeeee;
  background: #ffffff;
  padding: 10px;
  box-shadow: 2px 0px 4px 0px rgba(0, 0, 0, 0.20);
  margin-bottom: 5px;
}
.el-form-item--mini.el-form-item{
  margin-bottom: 1px;
}
</style>
