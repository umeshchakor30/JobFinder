import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const apiClient = axios.create({
  baseURL: rawBaseURL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient

