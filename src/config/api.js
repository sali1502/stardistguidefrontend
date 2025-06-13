// config/api.js

// Centraliserad API-konfiguration med automatisk autentisering och felhantering
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Grundläggande API-konfiguration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://accessibility-guide-backend.onrender.com'

// Samlade API-slutpunkter för enkel underhållning
export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  USERS: '/users',
  PROJECTS: '/projects',
  CHECKLISTS: '/checklists', 
  POSTS: '/posts',
  PROGRESS: '/progress'
}

// Skapa huvudsaklig axios-instans med standardinställningar
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 sekunder timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor för utgående förfrågningar - lägg till autentisering automatiskt
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('auth_token')
    
    // Lägg till JWT-token i Authorization-header om det finns
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor för inkommande svar - hantera fel och automatisk utloggning
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const authStore = useAuthStore()
    
    // Hantera olika typer av fel baserat på HTTP-status
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

// Metoder för vanliga HTTP-operationer
export const api = {
  // Hämta data från servern
  get: (url, config = {}) => {
    return apiClient.get(url, config)
  },
  
  // Skicka ny data till servern
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config)
  },
  
  // Uppdatera befintlig data (fullständig ersättning)
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config)
  },
  
  // Uppdatera befintlig data (partiell uppdatering)
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config)
  },
  
  // Ta bort data från servern
  delete: (url, config = {}) => {
    return apiClient.delete(url, config)
  }
}

// Exportera axios-instansen för avancerad användning vid behov
export { apiClient }
export default api