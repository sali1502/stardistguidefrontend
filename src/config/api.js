// config/api.js
// Centraliserad API-konfiguration med automatisk autentisering och felhantering med Axios

import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Backend API bas-URL - använder miljövariabel eller fallback till produktionserver
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://accessibility-guide-backend.onrender.com'

// Samlade API-slutpunkter
export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  USERS: '/users',
  PROJECTS: '/projects',
  CHECKLISTS: '/checklists', 
  POSTS: '/posts',
  PROGRESS: '/progress'
}

// Axios-instans med standardinställningar
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 sekunder timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor för utgående förfrågningar - lägger till autentisering automatiskt
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('auth_token')
    
    // Lägger till JWT-token i Authorization-header om det finns
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor för inkommande svar - hanterar fel och automatisk utloggning
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    // Hanterar olika typer av fel baserat på HTTP-status
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Obehörig - token har löpt ut eller är ogiltig
          authStore.logout()
          window.location.href = '/login'
          break
          
        case 403:
          // Förbjuden - användaren saknar behörighet för denna åtgärd
          break
          
        case 400:
        case 404:
        case 409:
        case 422:
          // Klientfel - vanliga användarfel, loggas inte som errors
          break
          
        case 500:
        default:
          // Serverfel - oväntade fel, loggas som errors
          break
      }
      
      // Returnera enhetligt fel-objekt för konsekvent felhantering
      return Promise.reject({
        status,
        message: data.message || `HTTP-fel ${status}`,
        data: data,
        isApiError: true
      })
    } else if (error.request) {
      // Nätverksfel - servern kan inte nås
      return Promise.reject({
        status: 0,
        message: 'Kan inte ansluta till servern. Kontrollera din internetanslutning.',
        isNetworkError: true
      })
    } else {
      // Oväntat fel under förfrågan
      return Promise.reject({
        message: error.message || 'Ett oväntat fel uppstod',
        isUnknownError: true
      })
    }
  }
)

// CRUD för API-operationer
export const api = {
  // GET - Hämta data
  get: (url, config = {}) => {
    return apiClient.get(url, config)
  },
  
  // POST - Skicka ny data
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config)
  },
  
  // PUT - Uppdatera befintlig data (fullständig)
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config)
  },
  
  // PATCH - Uppdatera befintlig data (partiell)
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config)
  },
  
  // DELETE - Ta bort data
  delete: (url, config = {}) => {
    return apiClient.delete(url, config)
  }
}

// Exportera Axios-instansen för avancerad användning vid behov
export { apiClient }
export default api