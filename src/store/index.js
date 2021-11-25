import { createStore } from 'vuex'
import * as EnvStorage from '../storage/env'
import * as EditorStorage from '../storage/editors'
const defaultMetadata = '//键和值都必须是字符串类型\n' +
  '{\n' +
  '\tuid: \'654402\',             //用户id，需要加上设备后缀6544->654402\n' +
  '\tlanguage: \'en-ch\',         //语言头\n' +
  '}'

const defaultEnv = {
  name: '',
  metadata: defaultMetadata,
  url: '',
  app: ''
}

export default createStore({
  state: {
    environments: [defaultEnv],
    environmentName: 'chikii',
    initEnv: false,
    tabs: []
  },
  mutations: {
    updateTabContent (state, payload) {
      console.log('updateTabContent', payload)
      state.tabs.map((tab) => {
        if (tab.name === payload.name) {
          tab.content = payload.content
          EditorStorage.storeTabs(state.tabs)
        }
      })
    },
    updateTab (state, tab) {
      const index = state.tabs.findIndex((val) => tab.name === val.name)
      if (index >= 0) {
        state.tabs[index] = tab
      } else {
        state.tabs.push(tab)
      }
      EditorStorage.storeTabs(state.tabs)
    },
    setTabs (state, tabs) {
      state.tabs = tabs
    },
    delTab (state, name) {
      state.tabs = state.tabs.filter((tab) => tab.name !== name)
      EditorStorage.storeTabs(state.tabs)
    },
    updateMetadata (state, payload) {
      // console.log('updateMetadata', payload)
      // state.env.metadata = payload
      state.environments.map((env) => {
        if (env.name === payload.name) {
          env.metadata = payload.metadata
          EnvStorage.SetEnvironments(state.environments)
        }
      })
    },
    setEnvironments (state, envs) {
      state.environments = envs
    },
    updateEnvironment (state, env) {
      if (!env.metadata || env.metadata === '') {
        env.metadata = defaultMetadata
      }
      // console.log('updateEnvironment', env)
      const index = state.environments.findIndex((val) => env.name === val.name)
      if (index >= 0) {
        state.environments[index] = env
      } else {
        state.environments.push(env)
      }
      EnvStorage.SetEnvironments(state.environments)
    },
    setEnvironmentName (state, name) {
      state.environmentName = name
      EnvStorage.SetSelectedEnv(name)
    },
    delEnvironment (state, name) {
      state.environments = state.environments.filter((env) => env.name !== name)
      EnvStorage.SetEnvironments(state.environments)
    }
  },
  actions: {},
  modules: {},
  getters: {
    getEnvs: (state) => () => {
      return state.environments
    },
    getEnv: (state) => (name) => {
      if (!name) {
        name = state.environmentName
      }
      const index = state.environments.findIndex((env) => env.name === name)
      return state.environments[index]
    }
  }
})
