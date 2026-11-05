import axios from 'axios'

const defaultURL = import.meta.env.PROD
  ? 'https://jobfinder-backend-06c6.onrender.com'
  : 'http://127.0.0.1:8000'

const rawBaseURL = import.meta.env.VITE_API_URL || defaultURL

const apiClient = axios.create({
  baseURL: rawBaseURL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient

