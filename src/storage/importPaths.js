import Store from 'electron-store'

const ImportPathStore = new Store({
  name: 'importPaths'
})

const KEYS = {
  IMPORT_PATH: 'path'
}

export function storeImportPaths (paths) {
  ImportPathStore.set(KEYS.IMPORT_PATH, paths)
}

export function getImportPaths () {
  return ImportPathStore.get(KEYS.IMPORT_PATH, [''])
}

export function clearImportPaths () {
  return ImportPathStore.clear()
}
