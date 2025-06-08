// services/postService.js
// Service för inläggshantering - hanterar rollspecifika inlägg och artiklar
// Möjliggör CRUD-operationer för inlägg, frontend-validering och dataformatering
// Stöder olika roller (designer, utvecklare, testare) med anpassad innehållshantering

import api, { API_ENDPOINTS } from '@/config/api'

export const postService = {
  // Hämta alla inlägg från backend med flexibel datastruktur-hantering
  async getAllPosts() {
    try {
      const response = await api.get(API_ENDPOINTS.POSTS)

      // Hantera olika response-strukturer från backend
      let posts = []

      if (Array.isArray(response.data)) {
        posts = response.data
      } else if (response.data && Array.isArray(response.data.posts)) {
        posts = response.data.posts
      } else if (response.data && Array.isArray(response.data.data)) {
        posts = response.data.data
      }

      // Formatera alla inlägg för visning i användargränssnittet
      posts = posts.map(post => this.formatPostForDisplay(post))

      return {
        success: true,
        posts: posts,
        message: `Hämtade ${posts.length} inlägg`
      }

    } catch (error) {
      return {
        success: false,
        posts: [],
        message: error.message || 'Kunde inte hämta inlägg',
        error
      }
    }
  },

  // Hämta specifikt inlägg baserat på ID
  async getPostById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.POSTS}/${id}`)
      const post = this.formatPostForDisplay(response.data)

      return {
        success: true,
        post: post,
        message: 'Inlägg hämtat framgångsrikt'
      }

    } catch (error) {
      return {
        success: false,
        post: null,
        message: error.message || 'Kunde inte hämta inlägg',
        error
      }
    }
  },

  // Skapa nytt inlägg med validering och felhantering
  async createPost(postData) {
    try {
      // Kör frontend-validering innan API-anrop
      const validationResult = this.validatePostData(postData)
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validationResult.errors
        }
      }

      const response = await api.post(API_ENDPOINTS.POSTS, postData)
      const newPost = this.formatPostForDisplay(response.data)

      return {
        success: true,
        post: newPost,
        message: 'Inlägg skapat framgångsrikt'
      }

    } catch (error) {
      let message = 'Kunde inte skapa inlägg'

      // Hantera specifika HTTP-statuskoder med anpassade meddelanden
      if (error.status === 400) {
        message = 'Valideringsfel: Kontrollera att alla obligatoriska fält är ifyllda'
      } else if (error.status === 403) {
        message = 'Du har inte behörighet att skapa inlägg'
      }

      return {
        success: false,
        message: error.response?.data?.message || message,
        errors: error.response?.data?.errors || {},
        error
      }
    }
  },

  // Uppdatera befintligt inlägg med validering
  async updatePost(id, postData) {
    try {
      // Frontend-validering innan uppdatering
      const validationResult = this.validatePostData(postData)
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Valideringsfel',
          errors: validationResult.errors
        }
      }

      const response = await api.put(`${API_ENDPOINTS.POSTS}/${id}`, postData)
      const updatedPost = this.formatPostForDisplay(response.data)

      return {
        success: true,
        post: updatedPost,
        message: 'Inlägg uppdaterat framgångsrikt'
      }

    } catch (error) {
      let message = 'Kunde inte uppdatera inlägg'

      // Hantera specifika HTTP-statuskoder
      if (error.status === 400) {
        message = 'Valideringsfel: Kontrollera att alla fält är korrekt ifyllda'
      } else if (error.status === 404) {
        message = 'Inlägget hittades inte'
      } else if (error.status === 403) {
        message = 'Du har inte behörighet att uppdatera detta inlägg'
      }

      return {
        success: false,
        message: error.response?.data?.message || message,
        errors: error.response?.data?.errors || {},
        error
      }
    }
  },

  // Ta bort inlägg permanent från databasen
  async deletePost(id) {
    try {
      await api.delete(`${API_ENDPOINTS.POSTS}/${id}`)

      return {
        success: true,
        message: 'Inlägg raderat framgångsrikt'
      }

    } catch (error) {
      let message = 'Kunde inte radera inlägg'

      // Hantera specifika HTTP-statuskoder
      if (error.status === 404) {
        message = 'Inlägget hittades inte'
      } else if (error.status === 403) {
        message = 'Du har inte behörighet att radera detta inlägg'
      }

      return {
        success: false,
        message: error.response?.data?.message || message,
        error
      }
    }
  },

  // Validera inläggsdata enligt backend-regler
  validatePostData(postData) {
    const errors = {}

    // Validera titel (3-100 tecken)
    if (!postData.title || !postData.title.trim()) {
      errors.title = 'Titel är obligatorisk'
    } else if (postData.title.trim().length < 3) {
      errors.title = 'Titel måste vara minst 3 tecken'
    } else if (postData.title.trim().length > 100) {
      errors.title = 'Titel får inte vara längre än 100 tecken'
    }

    // Validera roll enligt backend-specifikation
    const validRoles = ['designer', 'developer', 'tester']
    if (!postData.role) {
      errors.role = 'Roll är obligatorisk'
    } else if (!validRoles.includes(postData.role)) {
      errors.role = 'Roll måste vara antingen "designer", "developer" eller "tester"'
    }

    // Validera innehåll (minst 10 tecken)
    if (!postData.content || !postData.content.trim()) {
      errors.content = 'Innehåll är obligatoriskt'
    } else if (postData.content.trim().length < 10) {
      errors.content = 'Innehåll måste vara minst 10 tecken'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Formatera inlägg för visning med rollnamn och svenska datum
  formatPostForDisplay(post) {
    return {
      ...post,
      roleDisplayName: this.getRoleDisplayName(post.role),
      createdAtFormatted: post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('sv-SE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        : '-',
      updatedAtFormatted: post.updatedAt
        ? new Date(post.updatedAt).toLocaleDateString('sv-SE', {
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
    const names = {
      'designer': 'Designers',
      'developer': 'Utvecklare',
      'tester': 'Testare'
    }
    return names[role] || role
  }
}