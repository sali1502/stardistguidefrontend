// stores/projects.js - Pinia-store för projekthantering med Composition API

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectService } from '@/services/projectService'

export const useProjectsStore = defineStore('projects', () => {
  // Reaktiva tillstånd för projektdata
  const projects = ref([])
  const loading = ref(false)
  const error = ref('')

  // Beräknade egenskaper för projektstatistik
  const projectCount = computed(() => projects.value.length)
  const hasProjects = computed(() => projects.value.length > 0)

  // Hjälpfunktioner för tillståndshantering
  const clearError = () => {
    error.value = ''
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // Hämta alla projekt från backend
  const fetchProjects = async () => {
    setLoading(true)
    clearError()

    try {
      const result = await projectService.getAllProjects()

      if (result.success) {
        projects.value = result.projects || []
      } else {
        setError(result.message || 'Kunde inte hämta projekt')
      }
    } catch (err) {
      setError('Ett oväntat fel uppstod vid hämtning av projekt')
    } finally {
      setLoading(false)
    }
  }

  // Skapa nytt projekt och lägg till i state
  const createProject = async (projectData) => {
    setLoading(true)
    clearError()

    try {
      const result = await projectService.createProject(projectData)

      if (result.success) {
        // Lägg till det nya projektet längst upp i listan
        projects.value.unshift(result.project)
      }

      return result
    } catch (err) {
      const errorResult = {
        success: false,
        message: 'Ett oväntat fel uppstod vid skapande av projekt'
      }
      setError(errorResult.message)
      return errorResult
    } finally {
      setLoading(false)
    }
  }

  // Uppdatera befintligt projekt i både backend och state
  const updateProject = async (id, projectData) => {
    setLoading(true)
    clearError()

    try {
      const result = await projectService.updateProject(id, projectData)

      if (result.success) {
        // Uppdatera projektet i state-arrayen (stöder både MongoDB _id och id)
        const index = projects.value.findIndex(p => p._id === id || p.id === id)
        if (index !== -1) {
          projects.value[index] = result.project
        }
      }

      return result
    } catch (err) {
      const errorResult = {
        success: false,
        message: 'Ett oväntat fel uppstod vid uppdatering av projekt'
      }
      setError(errorResult.message)
      return errorResult
    } finally {
      setLoading(false)
    }
  }

  // Ta bort projekt från både backend och state
  const deleteProject = async (id) => {
    setLoading(true)
    clearError()

    try {
      const result = await projectService.deleteProject(id)

      if (result.success) {
        // Filtrera bort det raderade projektet från state (stöder både _id och id)
        projects.value = projects.value.filter(p => p._id !== id && p.id !== id)
      }

      return result
    } catch (err) {
      const errorResult = {
        success: false,
        message: 'Ett oväntat fel uppstod vid borttagning av projekt'
      }
      setError(errorResult.message)
      return errorResult
    } finally {
      setLoading(false)
    }
  }

  // Hämta specifikt projekt baserat på ID
  const getProjectById = async (id) => {
    try {
      const result = await projectService.getProjectById(id)
      return result
    } catch (err) {
      return {
        success: false,
        message: 'Kunde inte hämta projekt'
      }
    }
  }

  // Exponera alla tillstånd, computed properties och actions
  return {
    // Reaktiva tillstånd
    projects,
    loading,
    error,

    // Beräknade egenskaper
    projectCount,
    hasProjects,

    // Actions för projekthantering
    clearError,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById
  }
})