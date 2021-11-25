const commandMap = {
  importProtos: require('./importProtos').importProtos
}

export async function onCommand (...arg) {
  console.log('onCommand', arg)
  const command = arg[0]
  arg = arg.slice(1)
  return commandMap[command](...arg)
}
