// stores/auth.js - Pinia-store för autentisering och användarhantering

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/userService'

export const useAuthStore = defineStore('auth', () => {
  // Reaktiva tillstånd för användardata och autentisering
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const isAuthenticated = ref(!!token.value)
  
  // Beräknad egenskap för användarens roll
  const userRole = computed(() => user.value?.role)

  // Logga ut användare och rensa all sparad data
  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    // Omdirigera till inloggningssidan
    window.location.href = '/login'
  }

  // Autentisera användare med användarnamn och lösenord
  const login = async (username, password) => {
    try {
      const response = await userService.login(username, password)
      
      if (response.success) {
        // Spara användardata och token i både state och localStorage
        user.value = response.user
        token.value = response.token
        isAuthenticated.value = true
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('auth_user', JSON.stringify(response.user))
        
        return { success: true }
      } else {
        return response
      }
    } catch (error) {
      return { success: false, message: 'Inloggning misslyckades' }
    }
  }

  // Återställ autentiseringstillstånd från localStorage vid appstart
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      try {
        // Återställ användardata från localStorage
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
      } catch (error) {
        // Rensa felaktig data från localStorage om parsning misslyckas
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }

  // Omdirigera användare till rätt dashboard baserat på roll
  const redirectToDashboard = (role) => {
    window.location.href = `/dashboard/${role}`
  }

  // Konvertera rollkod till svenskt visningsnamn
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administratör',
      'designer': 'Designer',
      'developer': 'Utvecklare',
      'tester': 'Testare'
    }
    return roleNames[role] || role
  }

  // Exponera alla funktioner och tillstånd som store behöver
  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    initializeAuth,
    redirectToDashboard,
    getRoleDisplayName
  }
})