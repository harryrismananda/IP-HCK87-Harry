import axios from 'axios'

const baseUrl = 'https://bibliolex.harryrismananda.site'
// const baseUrl = 'http://localhost:3000'
const http = axios.create({
  baseURL: baseUrl
})

export default http