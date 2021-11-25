import { ipcRenderer } from 'electron'
import { loadProtosFromFiles } from '../../script/protobufhelper'
// const protobugjs = require('protobufjs')
export async function importProtos (onUploadedProto) {
  console.log('importProtos')
  // ipcRenderer.send('command', 'importProtos')
  // ipcRenderer.on('importProtosResult', (event, arg) => {
  //   console.log('importProtosResult', arg)
  // })
  const result = await ipcRenderer.invoke('command', 'importProtos')
  console.log('read file list:', result)

  if (result) {
    // const protoRoot = new protobugjs.Root()
    // const root = await protoRoot.load(result[0], { keepCase: true })
    // console.log('root', root)
    // console.log(root.lookup('yunpb'))
    // const protoList = await loadProtosFromFiles(result)
    // console.log('protoList', protoList)
    return await loadProtosFromFiles(result, onUploadedProto)
  }
}
