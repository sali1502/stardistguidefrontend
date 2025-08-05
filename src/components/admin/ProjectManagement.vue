<!-- components/admin/ProjectManagement.vue - adminkomponent för att hantera projekt med CRUD-operationer och checklisthantering -->

<template>
  <div class="project-management">
    <!-- Sidhuvud med titel och skapa-knapp -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-folder me-2" aria-hidden="true"></i>
          Projekthantering
        </h2>
        <p class="text-muted mb-0">
          Skapa, redigera och radera projekt
        </p>
      </div>
      <button class="btn btn-primary btn-sm d-md-none" @click="openCreateModal" :disabled="projectsStore.loading">
        <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
        Nytt projekt
      </button>
      <button class="btn btn-primary d-none d-md-block" @click="openCreateModal" :disabled="projectsStore.loading"
        ref="createButton">
        <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
        Skapa projekt
      </button>
    </div>

    <!-- Felmeddelande från store -->
    <div v-if="projectsStore.error" class="alert alert-danger" role="alert" aria-live="assertive">
      <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
      {{ projectsStore.error }}
      <button type="button" class="btn-close float-end" @click="projectsStore.clearError"
        aria-label="Stäng felmeddelande"></button>
    </div>

    <!-- Framgångsmeddelande (med stäng-knapp som ignoreras av skärmläsare, försvinner efter 20 sek) -->
    <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="assertive" aria-atomic="true">
      <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
      {{ successMessage }}
      <button type="button" class="btn-close float-end" @click="successMessage = ''" aria-hidden="true" tabindex="-1">
      </button>
    </div>

    <!-- Projekttabell med responsiv design -->
    <div class="card">
      <div class="card-header">
        <h3 class="mb-0" id="project-table-heading">
          <i class="bi bi-table me-2" aria-hidden="true"></i>
          Projektlista
        </h3>
      </div>
      <div class="card-body">
        <!-- Laddningsindikator -->
        <div v-if="projectsStore.loading" class="text-center py-4" role="status" aria-live="polite">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar...</span>
          </div>
          <p class="mt-2 text-muted" aria-hidden="true">Laddar projekt...</p>
        </div>

        <!-- Projekttabell för olika skärmstorlekar -->
        <div v-else-if="projectsStore.projects.length > 0">
          <!-- Desktop tabell (stora skärmar) -->
          <div class="table-responsive d-none d-lg-block">
            <table class="table table-hover" aria-labelledby="project-table-heading">
              <thead class="table-light">
                <tr>
                  <th scope="col">Projektnamn</th>
                  <th scope="col">Skapad</th>
                  <th scope="col" style="width: 150px">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projectsStore.projects" :key="project.id || project._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-folder text-blue-medium me-2" aria-hidden="true"></i>
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
                    <div class="btn-group btn-group-sm" role="group" :aria-label="`Åtgärder för ${project.name}`">
                      <button class="btn btn-outline-primary" @click="openEditModal(project)"
                        :disabled="projectsStore.loading" :aria-label="`Redigera projekt ${project.name}`"
                        :ref="el => setButtonRef(el, `edit-${project.id || project._id}`)">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                      <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                        :disabled="projectsStore.loading" :aria-label="`Hantera checklistor för ${project.name}`"
                        :ref="el => setButtonRef(el, `checklist-${project.id || project._id}`)">
                        <i class="bi bi-check2-square" aria-hidden="true"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                        :aria-label="`Ta bort projekt ${project.name}`"
                        :ref="el => setButtonRef(el, `delete-${project.id || project._id}`)">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Medium tabell (tablets) -->
          <div class="table-responsive d-none d-md-block d-lg-none">
            <table class="table table-hover" aria-labelledby="project-table-heading">
              <thead class="table-light">
                <tr>
                  <th scope="col">Projektnamn</th>
                  <th scope="col" style="width: 150px">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projectsStore.projects" :key="project.id || project._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-folder text-blue-medium me-2" aria-hidden="true"></i>
                      <div>
                        <div class="fw-bold">{{ project.name }}</div>
                        <div class="text-muted small">{{ formatDate(project.createdAt) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group" :aria-label="`Åtgärder för ${project.name}`">
                      <button class="btn btn-outline-primary" @click="openEditModal(project)"
                        :disabled="projectsStore.loading" :aria-label="`Redigera projekt ${project.name}`"
                        :ref="el => setButtonRef(el, `edit-${project.id || project._id}`)">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                      <button class="btn btn-outline-success" @click="openChecklistModal(project)"
                        :disabled="projectsStore.loading" :aria-label="`Hantera checklistor för ${project.name}`"
                        :ref="el => setButtonRef(el, `checklist-${project.id || project._id}`)">
                        <i class="bi bi-check2-square" aria-hidden="true"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                        :aria-label="`Ta bort projekt ${project.name}`"
                        :ref="el => setButtonRef(el, `delete-${project.id || project._id}`)">
                        <i class="bi bi-trash" aria-hidden="true"></i>
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
                  <i class="bi bi-folder text-blue-medium me-3" aria-hidden="true"></i>
                  <div class="me-3">
                    <div class="fw-bold">{{ project.name }}</div>
                    <div class="text-muted small">{{ formatDate(project.createdAt) }}</div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm" role="group" :aria-label="`Åtgärder för ${project.name}`">
                  <button class="btn btn-outline-primary" @click="openEditModal(project)"
                    :disabled="projectsStore.loading" :aria-label="`Redigera projekt ${project.name}`"
                    :ref="el => setButtonRef(el, `edit-${project.id || project._id}`)">
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                    :disabled="projectsStore.loading" :aria-label="`Hantera checklistor för ${project.name}`"
                    :ref="el => setButtonRef(el, `checklist-${project.id || project._id}`)">
                    <i class="bi bi-check2-square" aria-hidden="true"></i>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                    :aria-label="`Ta bort projekt ${project.name}`"
                    :ref="el => setButtonRef(el, `delete-${project.id || project._id}`)">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobil kortlayout för små skärmar -->
          <div class="d-sm-none">
            <div v-for="project in projectsStore.projects" :key="project.id || project._id" class="project-card mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-start flex-grow-1">
                  <i class="bi bi-folder text-blue-medium me-3 mt-1" aria-hidden="true"></i>
                  <div class="flex-grow-1">
                    <div class="fw-bold mb-1">{{ project.name }}</div>
                    <div class="text-muted small mt-1">
                      Skapad: {{ formatDate(project.createdAt) }}
                    </div>
                    <div class="text-muted small">
                      3 checklistor
                    </div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group" :aria-label="`Åtgärder för ${project.name}`">
                  <button class="btn btn-outline-primary" @click="openEditModal(project)"
                    :disabled="projectsStore.loading" :aria-label="`Redigera projekt ${project.name}`"
                    :ref="el => setButtonRef(el, `edit-${project.id || project._id}`)">
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button class="btn btn-outline-secondary" @click="openChecklistModal(project)"
                    :disabled="projectsStore.loading" :aria-label="`Hantera checklistor för ${project.name}`"
                    :ref="el => setButtonRef(el, `checklist-${project.id || project._id}`)">
                    <i class="bi bi-check2-square" aria-hidden="true"></i>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(project)" :disabled="projectsStore.loading"
                    :aria-label="`Ta bort projekt ${project.name}`"
                    :ref="el => setButtonRef(el, `delete-${project.id || project._id}`)">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tom lista - inga projekt -->
        <div v-else class="text-center py-4">
          <i class="bi bi-folder text-muted" style="font-size: 3rem;" aria-hidden="true"></i>
          <h5 class="mt-3 text-muted">Inga projekt hittades</h5>
          <p class="text-muted">Skapa ditt första projekt genom att klicka på "Skapa projekt"</p>
        </div>
      </div>
    </div>

    <!-- Modal för att skapa/redigera projekt -->
    <ProjectFormModal v-if="showModal" :project="editingProject" :is-editing="isEditing"
      :return-focus-to="modalReturnFocusElement" @save="handleSave" @close="closeModal" />

    <!-- Modal för att bekräfta borttagning -->
    <ProjectDeleteModal v-if="showDeleteModal" :project="projectToDelete" @confirm="handleDelete"
      @cancel="cancelDelete" />

    <!-- Modal för checklisthantering -->
    <ProjectChecklistModal v-if="showChecklistModal" :project="projectForChecklists"
      :return-focus-to="checklistModalReturnFocusElement" @close="closeChecklistModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
const createButton = ref(null)
const modalReturnFocusElement = ref(null)
const checklistModalReturnFocusElement = ref(null)

// Objekt för att hålla referenser till knappar
const buttonRefs = ref({})

// Funktion för att sätta knapp-referenser
const setButtonRef = (el, key) => {
  if (el) {
    buttonRefs.value[key] = el
  }
}

// Skapa eller redigera projekt styrs av isEditing
const isEditing = computed(() => !!editingProject.value)

// Funktioner för att öppna och stänga modaler
const openCreateModal = () => {
  editingProject.value = null
  modalReturnFocusElement.value = document.activeElement
  showModal.value = true
}

const openEditModal = (project) => {
  editingProject.value = { ...project }
  modalReturnFocusElement.value = document.activeElement
  showModal.value = true
}

const closeModal = async () => {
  showModal.value = false
  editingProject.value = null

  // Återställ fokus till rätt element
  await nextTick()

  if (!isEditing.value && projectsStore.projects.length > 0) {
    // Vid skapande av nytt projekt, sätt fokus på första redigera-knappen
    const firstProject = projectsStore.projects[0]
    const firstEditButton = buttonRefs.value[`edit-${firstProject.id || firstProject._id}`]
    if (firstEditButton) {
      setTimeout(() => {
        firstEditButton.focus()
      }, 100)
    }
  } else if (modalReturnFocusElement.value) {
    // Annars återställ fokus till elementet som öppnade modalen
    setTimeout(() => {
      modalReturnFocusElement.value.focus()
    }, 100)
  }
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
  checklistModalReturnFocusElement.value = document.activeElement
  showChecklistModal.value = true
}

const closeChecklistModal = async () => {
  showChecklistModal.value = false
  projectForChecklists.value = null

  // Återställ fokus till elementet som öppnade modalen
  await nextTick()
  if (checklistModalReturnFocusElement.value) {
    setTimeout(() => {
      checklistModalReturnFocusElement.value.focus()
    }, 100)
  }
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

      // Rensa framgångsmeddelandet efter 20 sekunder (WCAG 2.2.1 standard)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
    }

    // Anropa callback med resultatet för felhantering i modal
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

      // Rensa meddelandet efter 20 sekunder (WCAG 2.2.1 standard)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
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

/* Små skärmar - förbättra responsivitet för projektkort */
@media (max-width: 400px) {
  .project-card {
    padding: 0.75rem;
  }

  /* Direkt övergång till vertikal layout vid 400px för att undvika hopp */
  .project-card .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-card .btn-group {
    align-self: flex-end;
    margin-top: 0.5rem;
    min-width: 120px;
    flex-shrink: 0;
  }

  .project-card .flex-grow-1 {
    min-width: 0;
    /* Tillåt content att krympa */
    word-break: break-word;
  }

  .project-card .fw-bold {
    line-height: 1.2;
    word-break: break-word;
    hyphens: auto;
  }
}

/* Förbättra hantering av långa projektnamn på alla skärmstorlekar */
.project-card .fw-bold {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  line-height: 1.3;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Fokusindikator */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}
</style>