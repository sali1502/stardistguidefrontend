// services/checklistService.js
// Service för checklisthantering - hanterar rollspecifika checklistor för projekt
// Möjliggör CRUD-operationer för checklistpunkter, statusuppdatering och datavalidering
// Stöder olika roller (designer, utvecklare, testare) med olika checklistor per projekt

import api, { API_ENDPOINTS } from '@/config/api'

export const checklistService = {
  // Hämta checklista för specifikt projekt och roll
  async getChecklist(projectId, role) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CHECKLISTS}/${projectId}/${role}`)

      return {
        success: true,
        data: response.data,
        checklist: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || `Kunde inte hämta checklista för ${role}`,
        error
      }
    }
  },

  // Hämta alla checklistor för ett projekt
  async getProjectChecklists(projectId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CHECKLISTS}/${projectId}`)

      return {
        success: true,
        data: response.data,
        checklists: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta projektets checklistor',
        error
      }
    }
  },

  // Lägg till ny checklistpunkt med validering (endast admin)
  async addChecklistItem(projectId, role, itemData) {
    try {
      // Kör frontend-validering innan API-anrop
      const validation = this.validateItemData(itemData)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.post(`${API_ENDPOINTS.CHECKLISTS}/${projectId}/${role}/items`, itemData)

      return {
        success: true,
        data: response.data,
        checklist: response.data,
        message: 'Checklistpunkt tillagd framgångsrikt'
      }
    } catch (error) {
      if (error.isApiError) {
        return {
          success: false,
          message: error.data?.message || 'Kunde inte lägga till checklistpunkt',
          errors: error.data?.errors || {}
        }
      }

      return {
        success: false,
        message: 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Uppdatera befintlig checklistpunkt med validering (endast admin)
  async updateChecklistItem(projectId, role, itemId, itemData) {
    try {
      // Frontend-validering innan uppdatering
      const validation = this.validateItemData(itemData)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.put(`${API_ENDPOINTS.CHECKLISTS}/${projectId}/${role}/items/${itemId}`, itemData)

      return {
        success: true,
        data: response.data,
        checklist: response.data,
        message: 'Checklistpunkt uppdaterad framgångsrikt'
      }
    } catch (error) {
      if (error.isApiError) {
        return {
          success: false,
          message: error.data?.message || 'Kunde inte uppdatera checklistpunkt',
          errors: error.data?.errors || {}
        }
      }

      return {
        success: false,
        message: 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Ta bort checklistpunkt permanent (endast admin)
  async removeChecklistItem(projectId, role, itemId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.CHECKLISTS}/${projectId}/${role}/items/${itemId}`)

      return {
        success: true,
        data: response.data,
        checklist: response.data,
        message: 'Checklistpunkt borttagen framgångsrikt'
      }
    } catch (error) {
      if (error.isApiError) {
        return {
          success: false,
          message: error.data?.message || 'Kunde inte ta bort checklistpunkt'
        }
      }

      return {
        success: false,
        message: 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Växla status på checklistpunkt
  async toggleChecklistItem(projectId, role, itemId, completed) {
    try {
      const itemData = { itemId, completed }

      const response = await api.patch(`${API_ENDPOINTS.CHECKLISTS}/${projectId}/${role}/toggle`, itemData)

      return {
        success: true,
        data: response.data,
        checklist: response.data,
        message: completed ? 'Punkt markerad som klar' : 'Punkt markerad som ej klar'
      }
    } catch (error) {
      if (error.isApiError) {
        return {
          success: false,
          message: error.data?.message || 'Kunde inte uppdatera checklistpunkt'
        }
      }

      return {
        success: false,
        message: 'Ett oväntat fel uppstod',
        error
      }
    }
  },

  // Validera checklistpunktens data enligt backend
  validateItemData(itemData) {
    const errors = {}

    // Validera titel (3-100 tecken)
    if (!itemData.title || itemData.title.trim().length < 3) {
      errors.title = 'Titel måste vara minst 3 tecken'
    } else if (itemData.title.trim().length > 100) {
      errors.title = 'Titel får inte vara längre än 100 tecken'
    }

    // Validera innehåll (10-1000 tecken)
    if (!itemData.content || itemData.content.trim().length < 10) {
      errors.content = 'Innehåll måste vara minst 10 tecken'
    } else if (itemData.content.trim().length > 1000) {
      errors.content = 'Innehåll får inte vara längre än 1000 tecken'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Konvertera rollnamn till svenskt visningsnamn
  getRoleDisplayName(role) {
    const names = {
      designer: 'Designer',
      developer: 'Utvecklare',
      tester: 'Testare'
    }
    return names[role] || role
  },

  // Formatera checklistdata för visning med normaliserade ID:n och svenska datum
  formatChecklistForDisplay(checklist) {
    return {
      ...checklist,
      items: checklist.items?.map(item => ({
        ...item,
        id: item._id || item.id, // Normalisera ID-fält från MongoDB eller SQL-databas
        createdAtFormatted: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
          : '-'
      })) || []
    }
  }
}