<template>
  <div class="observer_rpc" style="height: 100%">
    <el-container style="height: 100%">
      <el-aside class="sider">
        <ProtoViewer ref="protoViewer" :init-func="onProtoViewerInit"
                     :onMethodSelected="onMethodSelected" :on-protos-clear="onProtosClear"></ProtoViewer>
      </el-aside>
      <el-container style="height: 100%">
        <el-main class="main-content">
          <div class="inputContainer">
            <el-select v-model="selectValue" size="small" style="width: 120px" @change="onSelectChange">
              <el-option
                v-for="item in $store.state.environments"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
              <el-divider></el-divider>
              <el-option
                v-if="environmentName"
                label="修改配置"
                value="update"
              >
                <el-icon >
                  <check/>
                </el-icon>
                <span> 修改配置 </span>
              </el-option>
              <el-option
                v-if="environmentName"
                label="删除配置"
                value="del"
              >
                <el-icon >
                  <delete/>
                </el-icon>
                <span> 删除配置 </span>
              </el-option>
              <el-option
                v-if="environmentName"
                label="添加配置"
                value="add"
              >
                <el-icon >
                  <circle-plus/>
                </el-icon>
                <span> 添加配置 </span>
              </el-option>
            </el-select>
            <el-input v-model="url" placeholder="input url" size="small" @change="onUrlChange"/>
            <Metadata />
          </div>
          <el-tabs
            v-model="editableTabsValue"
            type="card"
            :closable="tabCanClosable()"
            @tab-remove="removeProtoTableTab"
            @tab-click="clickTab"
          >
            <el-tab-pane
              v-for="item in protoTableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            >
             <Editor :ref="item.name" :request-data="item"/>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
  <el-dialog v-model="envDialogVisible"
    title="Add Environment"
    width="50%"
    :close-on-click-modal="false"
    :modal="false">
    <Environment ref="env" :on-submit="onSubmitEnvironment" :environment-data="envFormData"/>
  </el-dialog>
</template>

<script>
// import { ElButton } from 'element-plus'
import ProtoViewer from '../components/ProtoViewer'
import Editor from '../components/Editor'
import Metadata from '../components/Metadata'
import Environment from '../components/Environment'
import { CirclePlus, Delete, Check } from '@element-plus/icons'
import * as EnvStorage from '../storage/env'
import * as EditorStorage from '../storage/editors'
// import { ElMessage } from 'element-plus'
export default {
  components: { ProtoViewer, Editor, Metadata, CirclePlus, Delete, Check, Environment },
  setup () {},
  data () {
    return {
      flag: false,
      envFormData: {},
      envDialogVisible: false,
      defaultTab: {
        title: 'new tab',
        name: 'new',
        data: {
          plain: {}
        }
      },
      protoTableTabs: [
        {
          title: 'new tab',
          name: 'new',
          data: {
            plain: {}
          }
        }
      ],
      editableTabsValue: 'new',
      environmentName: 'chikii',
      selectValue: 'chikii',
      url: this.$store.getters.getEnv().url,
      urlChangeFlag: false
    }
  },
  methods: {
    onProtoViewerInit (protoList) {
      if (!protoList) {
        return
      }
      const tabs = EditorStorage.getTabs()
      console.log('EditorStorage.getTabs', tabs)
      if (!tabs || tabs.length <= 0) {
        return
      }
      this.$store.commit('setTabs', tabs)
      tabs.forEach((tab) => {
        const index = protoList.findIndex((proto) => proto.name === tab.filename)
        console.log('getProtoByName', protoList, tab)
        if (index >= 0) {
          const proto = protoList[index]
          const temp = tab.name.split('.')
          const methodName = temp[2]
          const serviceName = temp.slice(0, 2).join('.')
          const dataLoad = {
            name: methodName,
            load: proto.services[serviceName].requestMethods[methodName],
            fullname: tab.name,
            filename: tab.filename,
            content: tab.content,
            saved: true
          }
          this.addProtoTableTab(dataLoad)
        }
      })
    },
    getEnvironments () {
      return this.$store.state.environments
    },
    onSelectChange (val) {
      if (val === 'add') {
        this.selectValue = this.environmentName
        this.envFormData = {}
        if (this.flag) {
          this.$refs.env.resetData(this.envFormData)
        }
        this.envDialogVisible = true
        this.flag = true
      } else if (val === 'del') {
        this.selectValue = this.environmentName
        const environments = this.getEnvironments()
        let index = environments.findIndex((env) => env.name === this.selectValue)
        if (index > 0) {
          if (index === 0) {
            index += 1
          } else {
            index -= 1
          }
          this.$store.commit('delEnvironment', this.selectValue)
          this.environmentName = environments[index].name
          this.selectValue = this.environmentName
          this.$store.commit('setEnvironmentName', this.selectValue)
          this.url = this.$store.getters.getEnv().url
        }
      } else if (val === 'update') {
        this.selectValue = this.environmentName
        this.envFormData = Object.assign({}, this.$store.getters.getEnv())
        if (this.flag) {
          this.$refs.env.resetData(this.envFormData)
        }
        this.envDialogVisible = true
        this.flag = true
      } else {
        this.environmentName = this.selectValue
        this.url = this.$store.getters.getEnv(this.selectValue).url
        this.$store.commit('setEnvironmentName', this.selectValue)
      }
    },
    tabCanClosable () {
      return this.protoTableTabs.length > 1
    },
    clickTab (tab) {
      // console.log('clickTab', tab.props.name)
      // this.$refs[tab.props.name].onEditorClick()
    },
    removeProtoTableTab (targetName) {
      const tabs = this.protoTableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.protoTableTabs = tabs.filter((tab) => tab.name !== targetName)
      this.$store.commit('delTab', targetName)
    },
    onMethodSelected (dataLoad) {
      console.log('onMethodSelected', dataLoad)
      this.addProtoTableTab(dataLoad)
    },
    newTab (dataLoad) {
      const tab = {
        title: dataLoad.fullname,
        name: dataLoad.fullname,
        filename: dataLoad.filename,
        content: dataLoad.content,
        saved: dataLoad.saved
      }
      tab.data = dataLoad.load()
      return tab
    },
    addProtoTableTab (dataLoad) {
      console.log('addProtoTableTab', dataLoad)
      if (this.protoTableTabs.length === 1 && this.protoTableTabs[0].name === 'new') {
        const first = this.protoTableTabs[0]
        this.protoTableTabs.push(this.newTab(dataLoad))
        this.removeProtoTableTab(first.name)
      } else {
        const index = this.protoTableTabs.findIndex((tab) => tab.name === dataLoad.fullname)
        if (index < 0) {
          this.protoTableTabs.push(this.newTab(dataLoad))
        }
        this.editableTabsValue = dataLoad.fullname
      }
    },
    onSubmitEnvironment () {
      this.envDialogVisible = false
      // EnvStorage.SetEnvironments(this.getEnvironments())
    },
    onUrlChange () {
      if (!this.urlChangeFlag) {
        this.urlChangeFlag = true
        setTimeout(() => {
          const env = this.$store.getters.getEnv()
          env.url = this.url
          this.$store.commit('updateEnvironment', env)
          // EnvStorage.SetEnvironments(this.getEnvironments())
          this.urlChangeFlag = false
        }, 500)
      }
    },
    onProtosClear () {
      this.protoTableTabs = [this.defaultTab]
      this.editableTabsValue = 'new'
    }
  },
  mounted () {
    const envs = EnvStorage.GetEnvironments()
    console.log('getEnv init', envs)
    if (!envs) {
      EnvStorage.SetEnvironments(this.$store.getters.getEnvs())
    } else {
      this.$store.commit('setEnvironments', envs)
    }
    const selectedEnv = EnvStorage.GetSelectedEnv()
    if (selectedEnv) {
      this.$store.commit('setEnvironmentName', selectedEnv)
      this.selectValue = selectedEnv
      this.environmentName = this.selectValue
    }
    this.envDialogVisible = true
    this.envDialogVisible = false
    this.url = this.$store.getters.getEnv().url
    this.$nextTick(function () {
    })
  }
}
</script>

<style>
.sider {
  z-index: 20;
  border-right: 1px solid rgba(0, 21, 41, 0.18);
  background-color: white;
  box-shadow: 3px 0px 4px 0px rgba(0, 0, 0, 0.10);
  /*max-height: 600px;*/
  min-height: 300px;
  height: 720px;
  max-height: fit-content;
  /*height: 100%;*/
  width: 300px;
}
.main-content {
  padding-top: 10px;
  min-height: 300px;
  height: 100%;
  width: 100%;
}
.inputContainer {
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(0, 21, 41, 0.18);
  border-bottom: 1px solid #eeeeee;
  background: #ffffff;
  padding: 10px;
  box-shadow: 2px 0px 4px 0px rgba(0, 0, 0, 0.20);
}
.el-tabs__header {
  margin-bottom: 1px;
}
.el-divider--horizontal {
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
