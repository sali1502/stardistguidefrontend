// services/progressService.js
// Service för projektframstegshantering - hanterar spårning av projektframsteg och completionstatus
// Möjliggör hämtning av framstegsdata för enskilda projekt eller överblick över alla projekt
// Stöder progressionsanalys för olika roller och checklistor

import api, { API_ENDPOINTS } from '@/config/api'

export const progressService = {
  // Hämta framstegsdata för specifikt projekt
  async getProjectProgress(projectId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROGRESS}/${projectId}`)
      
      return {
        success: true,
        data: response.data,
        progress: this.formatProgressForDisplay(response.data)
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta projektframsteg',
        error
      }
    }
  },

  // Hämta framstegsdata för alla projekt
  async getAllProgress() {
    try {
      const response = await api.get(API_ENDPOINTS.PROGRESS)
      
      // Formatera alla projekt för visning
      const formattedProgress = Array.isArray(response.data) 
        ? response.data.map(progress => this.formatProgressForDisplay(progress))
        : []
      
      return {
        success: true,
        data: response.data,
        progress: formattedProgress,
        message: `Hämtade framsteg för ${formattedProgress.length} projekt`
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Kunde inte hämta framstegsdata',
        error
      }
    }
  },

  // Hämta framsteg för specifik roll i projekt
  async getRoleProgress(projectId, role) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PROGRESS}/${projectId}/${role}`)
      
      return {
        success: true,
        data: response.data,
        progress: this.formatRoleProgressForDisplay(response.data, role)
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || `Kunde inte hämta framsteg för ${role}`,
        error
      }
    }
  },

  // Formatera framstegsdata för visning i användargränssnittet
  formatProgressForDisplay(progress) {
    if (!progress) return null
    
    return {
      ...progress,
      // Beräkna totalt framsteg i procent
      totalProgressPercentage: this.calculateTotalProgress(progress),
      
      // Formatera framsteg per roll
      roleProgress: progress.roles ? Object.keys(progress.roles).map(role => ({
        role,
        roleDisplayName: this.getRoleDisplayName(role),
        completed: progress.roles[role]?.completed || 0,
        total: progress.roles[role]?.total || 0,
        percentage: progress.roles[role]?.total > 0 
          ? Math.round((progress.roles[role].completed / progress.roles[role].total) * 100)
          : 0
      })) : [],
      
      // Formatera uppdateringsdatum
      lastUpdatedFormatted: progress.lastUpdated
        ? new Date(progress.lastUpdated).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-'
    }
  },

  // Formatera rollspecifikt framsteg
  formatRoleProgressForDisplay(progress, role) {
    if (!progress) return null
    
    return {
      ...progress,
      role,
      roleDisplayName: this.getRoleDisplayName(role),
      progressPercentage: progress.total > 0 
        ? Math.round((progress.completed / progress.total) * 100)
        : 0,
      
      // Formatera checklistpunkter om de finns
      items: progress.items ? progress.items.map(item => ({
        ...item,
        completedAtFormatted: item.completedAt
          ? new Date(item.completedAt).toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : null
      })) : []
    }
  },

  // Beräkna totalt framsteg för projekt baserat på alla roller
  calculateTotalProgress(progress) {
    if (!progress.roles) return 0
    
    const roles = Object.values(progress.roles)
    const totalItems = roles.reduce((sum, role) => sum + (role.total || 0), 0)
    const completedItems = roles.reduce((sum, role) => sum + (role.completed || 0), 0)
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  },

  // Konvertera rollkod till svenskt visningsnamn
  getRoleDisplayName(role) {
    const names = {
      'designer': 'Designer',
      'developer': 'Utvecklare',
      'tester': 'Testare'
    }
    return names[role] || role
  },

  // Hämta progress-statistik för dashboard
  getProgressStatistics(progressData) {
    if (!Array.isArray(progressData)) return null
    
    const totalProjects = progressData.length
    const completedProjects = progressData.filter(p => 
      this.calculateTotalProgress(p) === 100
    ).length
    const inProgressProjects = totalProjects - completedProjects
    
    const averageProgress = totalProjects > 0
      ? Math.round(
          progressData.reduce((sum, p) => sum + this.calculateTotalProgress(p), 0) / totalProjects
        )
      : 0
    
    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      averageProgress,
      completionRate: totalProjects > 0 
        ? Math.round((completedProjects / totalProjects) * 100)
        : 0
    }
  }
}