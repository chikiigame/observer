import Store from 'electron-store'
// import { app, remote } from 'electron'
const EditorStore = new Store({
  name: 'editor'
})

const KEYS = {
  PROTOS: 'protos',
  TABS: 'tabs,'
}

export function storeProtos (protos) {
  // console.log('storeProtos', protos)
  EditorStore.set(KEYS.PROTOS, protos.map((proto) => proto.filePath))
}

export function getProtos () {
  return EditorStore.get(KEYS.PROTOS)
}

export function delProtos () {
  EditorStore.clear()
}

export function storeTabs (tabs) {
  console.log('storeTabs', tabs)
  EditorStore.set(KEYS.TABS, tabs)
}

export function getTabs () {
  return EditorStore.get(KEYS.TABS)
}
