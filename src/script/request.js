import axios from 'axios'
export async function rpcRequest (url, data) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    }
  }
  console.log('rpcRequest', data, config)
  return await axios.post(url, data, config)
}
