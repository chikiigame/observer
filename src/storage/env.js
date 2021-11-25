import Store from 'electron-store'

const EnvStore = new Store({
  name: 'env'
})

const KEYS = {
  Environments: 'environments',
  SelectedEnv: 'selectedEnv'
}

export function SetEnvironments (environments) {
  const saveData = environments.map((env) => {
    return {
      name: env.name,
      metadata: env.metadata,
      url: env.url,
      app: env.app
    }
  })
  console.log('SetEnvironments', saveData)
  EnvStore.set(KEYS.Environments, saveData)
}

export function SetSelectedEnv (name) {
  EnvStore.set(KEYS.SelectedEnv, name)
}

export function GetEnvironments () {
  return EnvStore.get(KEYS.Environments)
}

export function GetSelectedEnv () {
  return EnvStore.get(KEYS.SelectedEnv)
}
