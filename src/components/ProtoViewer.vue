<template>
  <el-row >
    <el-col :span="24" class="header">
      <div>
        <h3 class="header_title">协议列表</h3>
      </div>
      <div style="display: flex;flex-direction: column;justify-content: center">
        <el-button type="primary" icon="el-icon-plus" size="mini" circle
        @click="importProto" ></el-button>
      </div>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24" class="toolbar">
      <el-button type="success" icon="el-icon-refresh" size="mini" circle
                 style="float:left;margin-top:3px;margin-bottom:3px;margin-left:3px"
                 @click="reloadProto" ></el-button>

      <el-button  icon="el-icon-delete" size="mini" circle
                  style="float:right;margin-top:3px;margin-bottom:3px;margin-right:3px;"
                  @click="clearProto"></el-button>
    </el-col>
  </el-row>
  <el-tree
    ref="protoTree"
    :data="protoList"
    node-key="id"
    highlight-current
    :props="defaultProps"
    lazy
    :load="loadTreeNode"
    @node-click="handleNodeClick"
  >
    <template  #default="{ node }">
      <h3 :style="getNodeLevelHeaderStyle(node.level)">{{node.level === 1 ? 'P' : (node.level === 2 ? 'S' : 'M')}}</h3>
      <span>{{node.label}}</span>
    </template>
  </el-tree>
</template>

<script>
import { importProtos } from '../renderer/script/importProtos'
import { loadProtosFromFiles } from '../script/protobufhelper'
import { storeProtos, getProtos, delProtos } from '../storage/editors'
export default {
  // components: { ElButton },
  props: {
    onMethodSelected: {
      type: Function
    },
    onProtosClear: {
      type: Function
    },
    initFunc: {
      type: Function
    }
  },
  setup () {},
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      protoList: [],
      importPaths: []
    }
  },
  methods: {
    onUploadedProto (newProtos) {
      console.log('onUploadedProto')
      const existingProtos = this.protoList.filter((proto) => {
        return !newProtos.find((p) => p.filePath === proto.filePath)
      })
      this.protoList = [...existingProtos, ...newProtos]
      storeProtos(this.protoList)
    },
    getProtoByName (name) {
      const index = this.protoList.findIndex((proto) => proto.name === name)
      console.log('getProtoByName', this.protoList, name)
      if (index >= 0) {
        return this.protoList[index]
      }
      return undefined
    },
    async importProto () {
      await importProtos(this.onUploadedProto)
      // console.log('protoList', this.protoList)
    },
    loadTreeNode (node, resolve) {
      // console.log('loadTreeNode level', node.level, node)
      if (node.level === 0) {
        return resolve(this.protoList)
      }
      if (node.level === 1) {
        const proto = node.data
        // console.log('proto:', proto)
        // console.log('serviceNames', Object.keys(proto.services))
        return resolve(Object.keys(proto.services).reduce((list, serviceName) => {
          list.push({
            name: serviceName,
            service: proto.services[serviceName],
            filename: node.data.name
          })
          return list
        }, []))
        // resolve(Object.keys(proto.services).reduce((list, serviceName) => {
        //   console.log('===data', proto.services[serviceName])
        //   return list
        // }), [])
      } else if (node.level === 2) {
        const service = node.data.service
        return resolve(Object.keys(service.requestMethods).reduce((list, methodName) => {
          list.push({
            name: methodName,
            load: service.requestMethods[methodName],
            leaf: true,
            fullname: service.serviceName + '.' + methodName,
            filename: node.data.filename
          })
          return list
        }, []))
      }
      return resolve([])
    },
    reloadProto () {},
    getNodeLevelHeaderStyle (level) {
      const badge = 'line-height:15px;font-size:12px;margin-top:5px;margin-right:7px;padding-bottom:1px;width:15px;height:15px;'
      if (level === 1) {
        return badge + 'background-color:#15abff;color:#fff'
      } else if (level === 2) {
        return badge + 'background-color:#ffa733;color:#fff'
      } else if (level === 3) {
        return badge + 'background-color:#2cc316;color:#fff'
      }
      return ''
    },
    handleNodeClick (data, node) {
      if (node.level !== 3) {
        return
      }
      // console.log('handleNodeClick', data, node)
      if (this.onMethodSelected) {
        this.onMethodSelected(data)
      }
    },
    clearProto () {
      delProtos()
      this.protoList = []
      if (this.onProtosClear) {
        this.onProtosClear()
      }
    }
  },
  async mounted () {
    console.log('ProtoViewer mounted')
    // this.importPaths = getImportPaths()
    const protoFileList = getProtos()
    console.log('ProtoViewer mounted getProtos', protoFileList)
    if (protoFileList) {
      await loadProtosFromFiles(protoFileList, this.onUploadedProto)
    }
    if (this.initFunc) {
      this.initFunc(this.protoList)
    }
  }
}
</script>

<style>
.header {
  /*height: 50px;*/
  background-color: #001529;
  display: flex;
  padding: 6px 5px 0px 0px;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
}
.header_title {
  color: #fff;
  /*float:left;*/
  /*font-weight:bold;*/
  /*margin-left: 5px;*/
  margin-top:0.5em
}
.toolbar {
  background: #fafafa;
  /*padding: 3px;*/
  /*// border: 1 px solid #dfe6ec;*/
  /*margin: 3px 0px;*/
}
</style>
