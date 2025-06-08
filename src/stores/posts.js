// stores/posts.js - Pinia store för inläggshantering anpassad för MongoDB-backend

import { defineStore } from 'pinia'
import { postService } from '@/services/postService'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    loading: false,
    error: null
  }),

  getters: {
    // Räkna totalt antal inlägg
    totalPosts: (state) => state.posts.length,

    // Filtrera inlägg per roll enligt backend-specifikation
    designerPosts: (state) => state.posts.filter(post => post.role === 'designer'),
    developerPosts: (state) => state.posts.filter(post => post.role === 'developer'),
    testerPosts: (state) => state.posts.filter(post => post.role === 'tester'),

    // Hitta specifikt inlägg baserat på ID (stöder både MongoDB _id och id)
    getPostById: (state) => (id) => state.posts.find(post => post.id === id || post._id === id),

    // Hitta inlägg baserat på titel
    getPostByTitle: (state) => (title) =>
      state.posts.find(post => post.title === title),

    // Hämta senast skapade inlägg sorterat efter createdAt
    recentlyCreatedPosts: (state) =>
      [...state.posts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),

    // Hämta senast uppdaterade inlägg sorterat efter updatedAt
    recentlyUpdatedPosts: (state) =>
      [...state.posts]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10),

    // Filtrera inlägg baserat på användarroll (admin ser alla, andra ser sin egen roll)
    postsByRole: (state) => (role) => {
      if (role === 'admin') return state.posts
      return state.posts.filter(post => post.role === role)
    }
  },

  actions: {
    // Hämta alla inlägg från backend-API:et
    async fetchPosts() {
      this.loading = true
      this.error = null

      try {
        const result = await postService.getAllPosts()

        if (result.success) {
          this.posts = result.posts
        } else {
          this.error = result.message
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid hämtning av inlägg'
      } finally {
        this.loading = false
      }
    },

    // Skapa nytt inlägg och lägg till i state
    async createPost(postData) {
      this.loading = true
      this.error = null

      try {
        const result = await postService.createPost(postData)

        if (result.success) {
          // Lägg till det nya inlägget längst upp i listan
          this.posts.unshift(result.post)
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid skapande av inlägg'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Uppdatera befintligt inlägg i både backend och state
    async updatePost(id, postData) {
      this.loading = true
      this.error = null

      try {
        const result = await postService.updatePost(id, postData)

        if (result.success) {
          // Uppdatera inlägget i state-arrayen
          const index = this.posts.findIndex(post => post.id === id || post._id === id)
          if (index !== -1) {
            this.posts[index] = result.post
          }
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid uppdatering av inlägg'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    // Ta bort inlägg från både backend och state
    async deletePost(id) {
      this.loading = true
      this.error = null

      try {
        const result = await postService.deletePost(id)

        if (result.success) {
          // Filtrera bort det raderade inlägget från state
          this.posts = this.posts.filter(post => post.id !== id && post._id !== id)
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        this.error = 'Ett oväntat fel uppstod vid borttagning av inlägg'
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
      this.posts = []
      this.loading = false
      this.error = null
    },

    // Generera statistik för dashboard-visning
    getStatistics() {
      return {
        total: this.totalPosts,
        designers: this.designerPosts.length,
        developers: this.developerPosts.length,
        testers: this.testerPosts.length,
        recentlyCreated: this.recentlyCreatedPosts.length,
        recentlyUpdated: this.recentlyUpdatedPosts.length
      }
    },

    // Hämta inlägg filtrerade efter specifik roll
    getPostsForRole(role) {
      return this.posts.filter(post => post.role === role)
    },

    // Sök igenom inlägg baserat på titel, innehåll eller roll
    searchPosts(searchTerm) {
      if (!searchTerm) return this.posts

      const term = searchTerm.toLowerCase()
      return this.posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.role.toLowerCase().includes(term)
      )
    },

    // Konvertera rollkod till svenskt visningsnamn
    getRoleDisplayName(role) {
      const names = {
        'designer': 'Designer',
        'developer': 'Utvecklare',
        'tester': 'Testare'
      }
      return names[role] || role
    }
  }
})