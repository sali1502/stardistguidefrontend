// stores/users.js - Pinia store för användarhantering med Options API

import { defineStore } from 'pinia'
import { userService } from '@/services/userService'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    // Räkna totalt antal användare
    totalUsers: (state) => state.users.length,

    // Filtrera användare per roll
    adminUsers: (state) => state.users.filter(user => user.role === 'admin'),
    designerUsers: (state) => state.users.filter(user => user.role === 'designer'),
    developerUsers: (state) => state.users.filter(user => user.role === 'developer'),
    testerUsers: (state) => state.users.filter(user => user.role === 'tester'),

    // Hitta specifik användare baserat på ID (stöder både MongoDB _id och id)
    getUserById: (state) => (id) => state.users.find(user => user.id === id || user._id === id),

    // Hitta användare baserat på användarnamn
    getUserByUsername: (state) => (username) =>
      state.users.find(user => user.username === username),

    // Hämta senast skapade användare sorterat efter createdAt
    recentlyCreatedUsers: (state) =>
      [...state.users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),

    // Hämta senast uppdaterade användare sorterat efter updatedAt
    recentlyUpdatedUsers: (state) =>
      [...state.users]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
  },

  actions: {
    // Hämta alla användare från backend-API:et
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const result = await userService.getAllUsers()

        if (result.success) {
          this.users = result.users
        } else {
          this.error = result.message
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid hämtning av användare'
      } finally {
        this.loading = false
      }
    },

    // Skapa ny användare och lägg till i state
    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const result = await userService.createUser(userData)

        if (result.success) {
          // Lägg till den nya användaren i state-arrayen
          this.users.push(result.user)
        }

        return result
      } catch (error) {
        const errorResult = { success: false, message: 'Ett oväntat fel uppstod vid skapande av användare' }
        this.error = errorResult.message
        return errorResult
      } finally {
        this.loading = false
      }
    },

    // Uppdatera befintlig användare i både backend och state
    async updateUser(id, userData) {
      this.loading = true
      this.error = null

      try {
        const result = await userService.updateUser(id, userData)

        if (result.success) {
          // Uppdatera användaren i state-arrayen (stöder både MongoDB _id och id)
          const index = this.users.findIndex(user => user.id === id || user._id === id)
          if (index !== -1) {
            this.users[index] = result.user
          }
        }

        return result
      } catch (error) {
        const errorResult = { success: false, message: 'Ett oväntat fel uppstod vid uppdatering av användare' }
        this.error = errorResult.message
        return errorResult
      } finally {
        this.loading = false
      }
    },

    // Ta bort användare från både backend och state
    async deleteUser(id) {
      this.loading = true
      this.error = null

      try {
        const result = await userService.deleteUser(id)

        if (result.success) {
          // Filtrera bort den raderade användaren från state (stöder både _id och id)
          this.users = this.users.filter(user => user.id !== id && user._id !== id)
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid borttagning av användare'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Rensa felmeddelanden från state
    clearError() {
      this.error = null
    },

    // Återställ hela state till ursprungligt tillstånd
    resetState() {
      this.users = []
      this.loading = false
      this.error = null
    },

    // Generera statistik för dashboard-visning
    getStatistics() {
      return {
        total: this.totalUsers,
        admins: this.adminUsers.length,
        designers: this.designerUsers.length,
        developers: this.developerUsers.length,
        testers: this.testerUsers.length,
        recentlyCreated: this.recentlyCreatedUsers.length,
        recentlyUpdated: this.recentlyUpdatedUsers.length
      }
    },

    // Hämta användare filtrerade efter specifik roll
    getUsersByRole(role) {
      return this.users.filter(user => user.role === role)
    },

    // Sök igenom användare baserat på användarnamn eller roll
    searchUsers(searchTerm) {
      if (!searchTerm) return this.users

      const term = searchTerm.toLowerCase()
      return this.users.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      )
    }
  }
})