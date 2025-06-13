// services/userService.js
// Service för användarhantering - hanterar autentisering och CRUD operationer för användare
// Inkluderar inloggning, frontend-validering med svenska tecken och rollbaserad åtkomstkontroll
// Stöder administratörsfunktioner för användaradministration och rollhantering

import api, { API_ENDPOINTS } from '@/config/api'

export const userService = {
  // Autentisera användare med användarnamn och lösenord
  async login(username, password) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        username,
        password
      })
      
      return {
        success: true,
        data: response.data,
        token: response.data.token,
        user: response.data.user
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Inloggning misslyckades',
        error
      }
    }
  },

  // Hämta alla användare från systemet
  async getAllUsers() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS)
      
      return {
        success: true,
        data: response.data,
        users: response.data.map(user => this.formatUserForDisplay(user))
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta användare',
        error
      }
    }
  },

  // Hämta specifik användare baserat på ID
  async getUserById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.USERS}/${id}`)
      
      return {
        success: true,
        data: response.data,
        user: this.formatUserForDisplay(response.data)
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta användare',
        error
      }
    }
  },

  // Skapa ny användare med validering (endast admin)
  async createUser(userData) {
    try {
      // Kör frontend-validering innan API-anrop
      const validation = this.validateUserData(userData)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.post(API_ENDPOINTS.USERS, userData)
      
      return {
        success: true,
        data: response.data,
        user: this.formatUserForDisplay(response.data),
        message: 'Användare skapad framgångsrikt'
      }
    } catch (error) {
      let message = 'Kunde inte skapa användare'
      
      // Hantera specifika HTTP-statuskoder med anpassade meddelanden
      if (error.status === 400) {
        message = 'Valideringsfel: Kontrollera att alla obligatoriska fält är ifyllda'
      } else if (error.status === 409) {
        message = 'Användarnamnet används redan'
      }
      
      return {
        success: false,
        message: error.response?.data?.message || message,
        errors: error.response?.data?.errors || {},
        error
      }
    }
  },

  // Uppdatera befintlig användare med validering (endast admin)
  async updateUser(id, userData) {
    try {
      // Frontend-validering i redigeringsläge
      const validation = this.validateUserData(userData, true)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validation.errors
        }
      }

      const response = await api.put(`${API_ENDPOINTS.USERS}/${id}`, userData)
      
      return {
        success: true,
        data: response.data,
        user: this.formatUserForDisplay(response.data),
        message: 'Användare uppdaterad framgångsrikt'
      }
    } catch (error) {
      let message = 'Kunde inte uppdatera användare'
      
      // Hantera specifika HTTP-statuskoder
      if (error.status === 400) {
        message = 'Valideringsfel: Kontrollera att alla fält är korrekt ifyllda'
      } else if (error.status === 404) {
        message = 'Användaren hittades inte'
      } else if (error.status === 409) {
        message = 'Användarnamnet används redan av annan användare'
      }
      
      return {
        success: false,
        message: error.response?.data?.message || message,
        errors: error.response?.data?.errors || {},
        error
      }
    }
  },

  // Ta bort användare permanent från systemet (endast admin)
  async deleteUser(id) {
    try {
      await api.delete(`${API_ENDPOINTS.USERS}/${id}`)
      
      return {
        success: true,
        message: 'Användare borttagen framgångsrikt'
      }
    } catch (error) {
      let message = 'Kunde inte ta bort användare'
      
      // Hantera specifika HTTP-statuskoder
      if (error.status === 404) {
        message = 'Användaren hittades inte'
      } else if (error.status === 409) {
        message = 'Användaren kan inte tas bort'
      }
      
      return {
        success: false,
        message: error.response?.data?.message || message,
        error
      }
    }
  },

  // Validera användardata med stöd för svenska tecken och rollhierarki
  validateUserData(userData, isEditing = false) {
    const errors = {}
    
    // Validera användarnamn med Unicode-stöd för svenska tecken (åäö)
    if (!userData.username || userData.username.trim().length < 3) {
      errors.username = 'Användarnamn måste vara minst 3 tecken'
    } else if (userData.username.trim().length > 50) {
      errors.username = 'Användarnamn får inte vara längre än 50 tecken'
    } else if (!/^[\p{L}0-9._-]+$/u.test(userData.username.trim())) {
      errors.username = 'Användarnamn får bara innehålla bokstäver (inklusive åäö), siffror, punkt, underscore och bindestreck'
    }
    
    // Validera roll enligt systemets rollhierarki
    if (!userData.role || !['admin', 'designer', 'developer', 'tester'].includes(userData.role)) {
      errors.role = 'Giltig roll krävs'
    }
    
    // Validera lösenord (endast vid skapande eller om nytt lösenord anges)
    if (!isEditing) {
      if (!userData.password || userData.password.length < 6) {
        errors.password = 'Lösenord måste vara minst 6 tecken'
      }
    } else if (userData.password && userData.password.length < 6) {
      errors.password = 'Lösenord måste vara minst 6 tecken'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Formatera användardata för visning med rollnamn och svenska datum
  formatUserForDisplay(user) {
    return {
      ...user,
      roleDisplayName: this.getRoleDisplayName(user.role),
      createdAtFormatted: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-',
      updatedAtFormatted: user.updatedAt 
        ? new Date(user.updatedAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-'
    }
  },

  // Konvertera rollkod till svenskt visningsnamn
  getRoleDisplayName(role) {
    const roleNames = {
      'admin': 'Administratör',
      'designer': 'Designer', 
      'developer': 'Utvecklare',
      'tester': 'Testare'
    }
    return roleNames[role] || role
  }
}