<!-- components/admin/ProjectManagement.vue - adminkomponent för att hantera projekt med CRUD-operationer och checklisthantering -->

<template>
  <div class="project-management">
    <!-- Sidhuvud med titel och skapaknapp -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-folder me-2"></i>
          Projekthantering
        </h2>
        <p class="text-muted mb-0">
          Skapa, redigera och radera projekt
        </p>
      </div>
      <button class="btn btn-primary btn-sm d-md-none" @click="openCreateModal" :disabled="projectsStore.loading">
        <i class="bi bi-plus-lg me-2"></i>
        Nytt projekt
      </button>
      <button class="btn btn-primary d-none d-md-block" @click="openCreateModal" :disabled="projectsStore.loading">
        <i class="bi bi-plus-lg me-2"></i>
        Skapa projekt
      </button>
    </div>

    <!-- Felmeddelande -->
    <div v-if="projectsStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ projectsStore.error }}
      <button type="button" class="btn-close float-end" @click="projectsStore.clearError"
        aria-label="Stäng felmeddelande"></button>
    </div>

    <!-- Framgångsmeddelande -->
    <div v-if="successMessage" class="alert alert-success" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      {{ successMessage }}
      <button type="button" class="btn-close float-end" @click="successMessage = ''"
        aria-label="Stäng meddelande"></button>
    </div>

    <!-- Projekttabell -->
    <div class="card">
      <div class="card-header">
        <h3 class="mb-0">
          <i class="bi bi-table me-2"></i>
          Projektlista
        </h3>
      </div>
      <div class="card-body">
        <!-- Laddningsindikator -->
        <div v-if="projectsStore.loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar...</span>
          </div>
          <p class="mt-2 text-muted">Laddar projekt...</p>
        </div>

        <!-- Projekttabell för stora skärmar -->
        <div v-else-if="projectsStore.projects.length > 0">
          <!-- Desktop tabell (stora skärmar) -->
          <div class="table-responsive d-none d-lg-block">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Projektnamn</th>
                  <th>Skapad</th>
                  <th width="150">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projectsStore.projects" :key="project.id || project._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-folder text-blue-medium me-2"></i>
                      <div>
                        <div class="fw-bold">{{ project.name }}</div>
                        <div class="text-muted small">3 checklistor</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <small>{{ formatDate(project.createdAt) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" @click="openEditModal(project)"
                        :disabled="projectsStore.loading" title="Redigera projekt">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                        :disabled="projectsStore.loading" title="Hantera checklistor">
                        <i class="bi bi-check2-square"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                        title="Ta bort projekt">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Medium tabell (tablets) -->
          <div class="table-responsive d-none d-md-block d-lg-none">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Projektnamn</th>
                  <th width="150">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projectsStore.projects" :key="project.id || project._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-folder text-blue-medium me-2"></i>
                      <div>
                        <div class="fw-bold">{{ project.name }}</div>
                        <div class="text-muted small">{{ formatDate(project.createdAt) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" @click="openEditModal(project)"
                        :disabled="projectsStore.loading" title="Redigera projekt">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-success" @click="openChecklistModal(project)"
                        :disabled="projectsStore.loading" title="Hantera checklistor">
                        <i class="bi bi-check2-square"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                        title="Ta bort projekt">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Layout för små tablets -->
          <div class="d-none d-sm-block d-md-none">
            <div v-for="project in projectsStore.projects" :key="project.id || project._id" class="project-row mb-2">
              <div class="d-flex justify-content-between align-items-center p-3">
                <div class="d-flex align-items-center flex-grow-1">
                  <i class="bi bi-folder text-blue-medium me-3"></i>
                  <div class="me-3">
                    <div class="fw-bold">{{ project.name }}</div>
                    <div class="text-muted small">{{ formatDate(project.createdAt) }}</div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm" role="group">
                  <button class="btn btn-outline-primary" @click="openEditModal(project)"
                    :disabled="projectsStore.loading" title="Redigera projekt">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                    :disabled="projectsStore.loading" title="Hantera checklistor">
                    <i class="bi bi-check2-square"></i>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                    title="Ta bort projekt">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobil kortlayout -->
          <div class="d-sm-none">
            <div v-for="project in projectsStore.projects" :key="project.id || project._id" class="project-card mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-center flex-grow-1">
                  <i class="bi bi-folder text-blue-medium me-3"></i>
                  <div>
                    <div class="fw-bold mb-1">{{ project.name }}</div>
                    <div class="text-muted small mt-1">
                      Skapad: {{ formatDate(project.createdAt) }}
                    </div>
                    <div class="text-muted small">
                      3 checklistor
                    </div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group">
                  <button class="btn btn-outline-primary" @click="openEditModal(project)"
                    :disabled="projectsStore.loading" title="Redigera projekt">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                    :disabled="projectsStore.loading" title="Hantera checklistor">
                    <i class="bi bi-check2-square"></i>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                    title="Ta bort projekt">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tom lista - inga projekt -->
        <div v-else class="text-center py-4">
          <i class="bi bi-folder text-muted" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Inga projekt hittades</h5>
          <p class="text-muted">Skapa ditt första projekt genom att klicka på "Skapa projekt"</p>
        </div>
      </div>
    </div>

    <!-- Modal för att skapa/redigera projekt -->
    <ProjectFormModal v-if="showModal" :project="editingProject" :is-editing="isEditing" @save="handleSave"
      @close="closeModal" />

    <!-- Modal för att bekräfta borttagning -->
    <ProjectDeleteModal v-if="showDeleteModal" :project="projectToDelete" @confirm="handleDelete"
      @cancel="cancelDelete" />

    <!-- Modal för checklisthantering -->
    <ProjectChecklistModal v-if="showChecklistModal" :project="projectForChecklists" @close="closeChecklistModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import ProjectFormModal from './ProjectFormModal.vue'
import ProjectDeleteModal from './ProjectDeleteModal.vue'
import ProjectChecklistModal from './ProjectChecklistModal.vue'

const projectsStore = useProjectsStore()

// Reaktiv data för modalhantering
const showModal = ref(false)
const showDeleteModal = ref(false)
const showChecklistModal = ref(false)
const editingProject = ref(null)
const projectToDelete = ref(null)
const projectForChecklists = ref(null)
const successMessage = ref('')

// Skapa eller redigera projekt styrs av isEditing
const isEditing = computed(() => !!editingProject.value)

// Funktioner för att öppna och stänga modaler
const openCreateModal = () => {
  editingProject.value = null
  showModal.value = true
}

const openEditModal = (project) => {
  editingProject.value = { ...project }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProject.value = null
}

const confirmDelete = (project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  projectToDelete.value = null
}

const openChecklistModal = (project) => {
  projectForChecklists.value = project
  showChecklistModal.value = true
}

const closeChecklistModal = () => {
  showChecklistModal.value = false
  projectForChecklists.value = null
}

// Hantera sparning av projekt (skapa eller uppdatera)
const handleSave = async (projectData, callback) => {
  try {
    let result

    // Skapa eller uppdatera projekt styrs av isEditing
    if (isEditing.value) {
      result = await projectsStore.updateProject(editingProject.value.id || editingProject.value._id, projectData)
    } else {
      result = await projectsStore.createProject(projectData)
    }

    // Hantera framgångsrikt resultat
    if (result && result.success === true) {
      successMessage.value = result.message || 'Operationen lyckades'
      closeModal()

      // Rensa framgångsmeddelandet efter fem sekunder
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    }

    // Anropa callback med resultatet om den finns
    const finalResult = result || { success: false, message: 'Inget svar från server' }

    if (callback) {
      callback(finalResult)
    }

  } catch (error) {
    // Hantera fel och skicka strukturerat felmeddelande till callback
    const errorResult = {
      success: false,
      message: 'Ett oväntat fel uppstod',
      error: error
    }

    if (callback) {
      callback(errorResult)
    }
  }
}

// Hantera borttagning av projekt
const handleDelete = async () => {
  if (!projectToDelete.value) return

  try {
    const result = await projectsStore.deleteProject(projectToDelete.value.id || projectToDelete.value._id)

    // Visa framgångsmeddelande om borttagningen lyckades
    if (result && result.success) {
      successMessage.value = result.message

      // Rensa meddelandet efter fem sekunder
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    }

    cancelDelete()
  } catch (error) {
    // Stäng modal även vid fel - felmeddelandet hanteras av store
    cancelDelete()
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

// Hämta projekt när komponenten laddas
onMounted(() => {
  projectsStore.fetchProjects()
})
</script>

<style scoped>
.project-management {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.alert {
  border: none;
  border-radius: 8px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.text-blue-medium {
  color: #475569 !important;
}

/* Layoutstillar för responsiva breakpoints */
.project-row {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.project-row:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Mobilkort för projekt */
.project-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Responsiva justeringar för olika skärmstorlekar */
@media (max-width: 991px) {

  .project-card i,
  .project-row i {
    font-size: 1.1rem;
  }
}

@media (max-width: 767px) {
  .project-row {
    padding: 0.5rem;
  }
}

@media (max-width: 575px) {
  .project-card i {
    font-size: 1.25rem;
  }

  .btn-group-sm .btn {
    padding: 0.375rem 0.5rem;
  }
}

.btn-delete {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
}

.btn-delete:hover {
  background-color: #1e293b !important;
  border-color: #1e293b !important;
  color: white !important;
}

.btn-delete:focus {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
  box-shadow: 0 0 0 0.2rem rgba(15, 23, 42, 0.5) !important;
}

.btn-delete:active {
  background-color: #0c1426 !important;
  border-color: #0c1426 !important;
  color: white !important;
}

.btn-delete i {
  color: white !important;
}
</style>