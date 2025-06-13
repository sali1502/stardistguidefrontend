// services/projectService.js
// Service för projekthantering - hanterar all kommunikation med backend för CRUD operationer för projekt
// Inkluderar frontend-validering, felhantering och dataformatering för UI-komponenter
// Stöder administratörsfunktioner för att skapa, läsa, uppdatera och ta bort projekt

import api, { API_ENDPOINTS } from '@/config/api'

export const projectService = {
  // Hämta alla projekt från backend
  async getAllProjects() {
    try {
      const response = await api.get(API_ENDPOINTS.PROJECTS)
      
      return {
        success: true,
        data: response.data,
        projects: response.data.map(project => this.formatProjectForDisplay(project))
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta projekt',
        error
      }
    }
  },

  // Hämta specifikt projekt baserat på ID
  async getProjectById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROJECTS}/${id}`)
      
      return {
        success: true,
        data: response.data,
        project: this.formatProjectForDisplay(response.data)
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta projekt',
        error
      }
    }
  },

  // Skapa nytt projekt med frontendvalidering (endast admin)
  async createProject(projectData) {
    try {
      // Kör frontendvalidering innan API-anrop
      const validation = this.validateProjectData(projectData)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.post(API_ENDPOINTS.PROJECTS, projectData)
      
      return {
        success: true,
        data: response.data,
        project: this.formatProjectForDisplay(response.data),
        message: 'Projekt skapat framgångsrikt'
      }
    } catch (error) {
      // Hantera strukturerade fel från API interceptor
      if (error.isApiError) {
        return {
          success: false,
          message: error.message || 'Kunde inte skapa projekt',
          errors: error.data?.errors || {},
          status: error.status
        }
      }
      
      // Hantera nätverksproblem
      if (error.isNetworkError) {
        return {
          success: false,
          message: error.message || 'Kan inte ansluta till servern'
        }
      }
      
      // Fallback för axios responsfel
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        return {
          success: false,
          message: data?.message || this.getErrorMessageByStatus(status),
          errors: data?.errors || {},
          status: status
        }
      }
      
      // Hantera oväntat fel
      return {
        success: false,
        message: error.message || 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Uppdatera befintligt projekt med validering (endast admin)
  async updateProject(id, projectData) {
    try {
      // Frontend-validering innan uppdatering
      const validation = this.validateProjectData(projectData)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.put(`${API_ENDPOINTS.PROJECTS}/${id}`, projectData)
      
      return {
        success: true,
        data: response.data,
        project: this.formatProjectForDisplay(response.data),
        message: 'Projekt uppdaterat framgångsrikt'
      }
    } catch (error) {
      // Kontroll om projektnamn redan finns lagrad i databasen
      if (error.message && error.message.includes('E11000 duplicate key error')) {
        return {
          success: false,
          message: 'Ett projekt med detta namn finns redan',
          status: 409
        }
      }
      
      // Hantera strukturerade API-fel
      if (error.isApiError) {
        return {
          success: false,
          message: error.message || 'Kunde inte uppdatera projekt',
          errors: error.data?.errors || {},
          status: error.status
        }
      }
      
      // Hantera nätverksproblem
      if (error.isNetworkError) {
        return {
          success: false,
          message: error.message || 'Kan inte ansluta till servern'
        }
      }
      
      // Fallback för axios responsfel
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        // Kontrollera MongoDB-fel i svarsdata
        if (data?.message && data.message.includes('E11000 duplicate key error')) {
          return {
            success: false,
            message: 'Ett projekt med detta namn finns redan',
            status: 409
          }
        }
        
        return {
          success: false,
          message: data?.message || this.getErrorMessageByStatus(status),
          errors: data?.errors || {},
          status: status
        }
      }
      
      // Hantera oväntat fel
      return {
        success: false,
        message: error.message || 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Ta bort projekt permanent (endast admin)
  async deleteProject(id) {
    try {
      await api.delete(`${API_ENDPOINTS.PROJECTS}/${id}`)
      
      return {
        success: true,
        message: 'Projekt borttaget framgångsrikt'
      }
    } catch (error) {
      // Hantera Axios responsfel
      if (error.response) {
        const data = error.response.data
        return {
          success: false,
          message: data?.message || 'Kunde inte ta bort projekt'
        }
      }
      
      // Hantera strukturerade API-fel
      if (error.isApiError) {
        return {
          success: false,
          message: error.data?.message || 'Kunde inte ta bort projekt'
        }
      }
      
      return {
        success: false,
        message: error.message || 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Konvertera HTTP-statuskoder till användarvänliga felmeddelanden
  getErrorMessageByStatus(status) {
    const statusMessages = {
      400: 'Ogiltiga data skickades',
      401: 'Du är inte inloggad',
      403: 'Du har inte behörighet för denna åtgärd',
      404: 'Projektet hittades inte',
      409: 'Ett projekt med detta namn finns redan',
      422: 'Valideringsfel',
      500: 'Serverfel uppstod'
    }
    
    return statusMessages[status] || `HTTP-fel: ${status}`
  },

  // Validera projektdata enligt samma regler som backend (Joi-schema)
  validateProjectData(projectData) {
    const errors = {}
    
    // Projektnamn - matchar backend-validering (min 3, max 100 tecken)
    if (!projectData.name || projectData.name.trim().length < 3) {
      errors.name = 'Projektnamn måste vara minst 3 tecken'
    } else if (projectData.name.trim().length > 100) {
      errors.name = 'Projektnamn får inte vara längre än 100 tecken'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Formatera projektdata för visning med svenska datumformat
  formatProjectForDisplay(project) {
    return {
      ...project,
      createdAtFormatted: project.createdAt 
        ? new Date(project.createdAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-',
      updatedAtFormatted: project.updatedAt 
        ? new Date(project.updatedAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-'
    }
  }
}