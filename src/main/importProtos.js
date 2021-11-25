import { dialog } from 'electron'

export async function importProtos (...arg) {
  console.log('main importProtos', arg)
  const openDialogResult = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Protos',
        extensions: ['proto']
      }
    ]
  })

  // console.log('open result', openDialogResult)
  const filePaths = openDialogResult.filePaths
  if (!filePaths) {
    return
  }
  return filePaths
}
