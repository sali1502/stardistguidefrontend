<!-- components/ProjectSelector.vue -->

<template>
  <div class="project-selector">
    <div class="card">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-8">
            <label class="form-label mb-2">
              <i class="bi bi-folder me-2"></i>
              Välj projekt
            </label>

            <!-- Bootstrap dropdownmeny  -->
            <div class="dropdown w-100">
              <button class="btn btn-light dropdown-toggle w-100 text-start" type="button" data-bs-toggle="dropdown"
                :disabled="loading">
                {{ selectedProjectName || 'Välj ett projekt...' }}
              </button>
              <ul class="dropdown-menu w-100 mobile-dropdown">
                <li v-if="loading">
                  <span class="dropdown-item-text">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Laddar projekt...
                  </span>
                </li>
                <li v-else-if="projects.length === 0">
                  <span class="dropdown-item-text text-muted">
                    <i class="bi bi-info-circle me-2"></i>
                    Inga projekt tillgängliga
                  </span>
                </li>
                <template v-else>
                  <li v-for="project in projects" :key="project.id || project._id">
                    <a class="dropdown-item" href="#" @click.prevent="selectProject(project)"
                      :class="{ active: selectedProject === (project.id || project._id) }">
                      {{ project.name }}
                    </a>
                  </li>
                  <li v-if="selectedProject">
                    <hr class="dropdown-divider">
                  </li>
                  <li v-if="selectedProject">
                    <a class="dropdown-item text-muted" href="#" @click.prevent="selectProject(null)">
                      <i class="bi bi-x-circle me-2"></i>
                      Rensa val
                    </a>
                  </li>
                </template>
              </ul>
            </div>
          </div>

          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div v-if="loading" class="text-muted">
              <div class="spinner-border spinner-border-sm me-2"></div>
              Laddar projekt...
            </div>
            <div v-else-if="projects.length === 0" class="text-muted">
              <i class="bi bi-info-circle me-2"></i>
              Inga projekt tillgängliga
            </div>
            <div v-else class="text-muted">
              {{ projects.length }} projekt tillgängliga
            </div>
          </div>
        </div>

        <!-- Visar info för valt projekt -->
        <div v-if="currentProject" class="mt-3 p-3 bg-light rounded">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">{{ currentProject.name }}</h6>
              <small class="text-muted">
                Skapat: {{ formatDate(currentProject.createdAt) }}
              </small>
            </div>
            <div>
              <span class="badge" :class="projectStatus === 'completed' ? 'bg-success' : 'bg-primary'">
                <span v-if="loadingProgress" class="spinner-border spinner-border-sm me-1"
                  style="width: 0.75rem; height: 0.75rem;"></span>
                {{ projectStatus === 'completed' ? 'Avslutad' : 'Aktiv' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { projectService } from '@/services/projectService'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'project-selected'])

// Reaktiv data för projekt och laddningsstatus
const projects = ref([])
const loading = ref(true)
const loadingProgress = ref(false)
const selectedProject = ref(props.modelValue || '')
const projectProgress = ref([])

// Beräknat värde för aktuellt valt projekt
const currentProject = computed(() => {
  if (!selectedProject.value) return null
  return projects.value.find(p => (p.id || p._id) === selectedProject.value)
})

// Beräknat värde för visning av projektnamn
const selectedProjectName = computed(() => {
  return currentProject.value ? currentProject.value.name : ''
})

// Beräknat värde för projektstatus baserat på progression
const projectStatus = computed(() => {
  if (!currentProject.value || projectProgress.value.length === 0) {
    return 'active'
  }

  // Kontrollera om alla roller är 100% klara
  const isCompleted = projectProgress.value.every(progress => {
    const totalItems = progress.totalItems || 0
    const completedItems = progress.completedItems || 0
    return totalItems > 0 && completedItems === totalItems
  })

  return isCompleted ? 'completed' : 'active'
})

// Hantera projektval från dropdownmeny
const selectProject = (project) => {
  const projectId = project ? (project.id || project._id) : ''
  selectedProject.value = projectId

  emit('update:modelValue', projectId)
  emit('project-selected', project)

  // Hämta status/progression för det valda projektet
  fetchProjectProgress(projectId)
}

// Hämta alla tillgängliga projekt från backend
const fetchProjects = async () => {
  try {
    loading.value = true
    const result = await projectService.getAllProjects()

    if (result.success) {
      projects.value = Array.isArray(result.data) ? result.data : []
    } else {
      projects.value = []
    }

  } catch (error) {
    projects.value = []
  } finally {
    loading.value = false
  }
}

// Hämta projektprogression för att avgöra status
const fetchProjectProgress = async (projectId) => {
  if (!projectId) {
    projectProgress.value = []
    return
  }

  try {
    loadingProgress.value = true
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    const response = await fetch(`${API_BASE_URL}/progress/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      projectProgress.value = Array.isArray(data) ? data : []
    } else {
      // Om 404 (ingen progression) - projektet är aktivt
      projectProgress.value = []
    }

  } catch (error) {
    projectProgress.value = []
  } finally {
    loadingProgress.value = false
  }
}

// Formatera datum för visning
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Övervaka ändringar i modelValue från föräldrakomponent
watch(() => props.modelValue, (newValue) => {
  selectedProject.value = newValue || ''
  fetchProjectProgress(newValue)
})

// Hämta projekt när komponenten laddas
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.project-selector {
  margin-bottom: 1.5rem;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.1);
}

.bg-light {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0;
}

.badge.bg-primary {
  background-color: #334155 !important;
}

.badge.bg-success {
  background-color: #334155 !important;
}

/* Mobilanpassning för Bootstrap dropdownmeny */
@media (max-width: 576px) {
  .mobile-dropdown {
    max-width: calc(100vw - 2rem) !important;
    max-height: 60vh;
    overflow-y: auto;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project-selector .card-body {
    padding: 1rem 0.75rem;
  }
}

/* Extra små enheter */
@media (max-width: 375px) {
  .mobile-dropdown {
    max-width: calc(100vw - 1rem) !important;
  }

  .project-selector .card-body {
    padding: 0.75rem 0.5rem;
  }

  .dropdown-item {
    padding: 0.625rem 0.75rem;
    font-size: 0.9rem;
  }
}

.dropdown {
  position: relative;
  z-index: 9999;
}

.dropdown-menu {
  z-index: 10000 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  position: absolute !important;
}

.dropdown.show .dropdown-menu {
  z-index: 10001 !important;
}

/* Säkerställ att innehåll i dropdownmeny placeras ovanpå övrig text */
.project-selector {
  position: relative;
  z-index: 9998;
}

.dropdown-toggle {
  position: relative;
}

.dropdown-toggle::after {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

.dropdown-toggle:focus {
  border-color: #334155;
  box-shadow: 0 0 0 0.2rem rgba(51, 65, 85, 0.25);
}

.dropdown-item.active {
  background-color: #334155;
  color: white;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item.active:hover {
  background-color: #475569;
}
</style>