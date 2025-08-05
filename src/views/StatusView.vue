<!-- views/StatusView.vue - Vy för visning av projektprogression -->

<template>
  <BaseDashboard>
    <!-- ARIA live region för att meddela statusändringar -->
    <div class="visually-hidden" aria-live="polite" aria-atomic="true">
      {{ ariaLiveMessage }}
    </div>

    <!-- Komponent för att välja projekt att visa status för -->
    <ProjectSelector v-model="selectedProjectId" @project-selected="handleProjectSelected" />

    <!-- Huvudinnehåll för statusöversikt -->
    <div class="status-overview" role="main" aria-label="Projektstatusöversikt">
      <!-- Laddningsindikator -->
      <div v-if="loading" class="text-center py-5" role="status" aria-live="polite">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Laddar projektstatus...</p>
      </div>

      <!-- Felmeddelande -->
      <div v-else-if="error" class="alert alert-warning" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Detaljerad status för specifikt valt projekt -->
      <div v-else-if="selectedProjectId && projectProgress.length > 0">
        <div class="card" ref="projectStatusCard">
          <div class="card-header">
            <h3 class="mb-0" tabindex="-1" ref="projectStatusHeading">
              <i class="bi bi-graph-up me-2"></i>
              Projektstatus: {{ selectedProjectName }}
            </h3>
          </div>
          <div class="card-body">
            <!-- Progressionskort för varje roll i projektet -->
            <div class="row g-4" role="list" aria-label="Progression per roll">
              <div v-for="progress in projectProgress" :key="progress._id" class="col-md-4">
                <div class="progress-card" :aria-label="`${getRoleDisplayName(progress.role)} progression`">
                  <!-- Rollnamn och procentuella framsteg -->
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <i :class="getRoleIcon(progress.role)" class="me-2" aria-hidden="true"></i>
                      <h4 class="mb-0 role-name">{{ getRoleDisplayName(progress.role) }}</h4>
                    </div>
                    <span class="badge bg-primary"
                      :aria-label="`${Math.round(getProgressPercentage(progress))} procent slutfört`">
                      {{ Math.round(getProgressPercentage(progress)) }}%
                    </span>
                  </div>

                  <!-- Visuell progressionsbar -->
                  <div class="progress mb-2" style="height: 8px;" role="progressbar"
                    :aria-valuenow="Math.round(getProgressPercentage(progress))" aria-valuemin="0" aria-valuemax="100"
                    :aria-label="`${getRoleDisplayName(progress.role)} progression`">
                    <div class="progress-bar" :class="getProgressBarClass(progress)"
                      :style="{ width: getProgressPercentage(progress) + '%' }"></div>
                  </div>

                  <!-- Detaljerad information om framsteg -->
                  <div class="d-flex justify-content-between text-muted small">
                    <span>{{ progress.completedItems || 0 }} / {{ progress.totalItems || 0 }} klara</span>
                    <span v-if="progress.lastUpdated">
                      Uppdaterad: {{ formatDate(progress.lastUpdated) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sammanfattande statistik för hela projektet -->
            <div class="mt-4 p-3 bg-light rounded" role="region" aria-label="Projektsammanfattning">
              <div class="row text-center">
                <div class="col-md-4">
                  <span class="text-primary stat-number" aria-describedby="completed-label">{{ getTotalCompleted()
                    }}</span>
                  <h5 class="text-muted stat-label" id="completed-label">Totalt klara uppgifter</h5>
                </div>
                <div class="col-md-4">
                  <span class="text-info stat-number" aria-describedby="total-label">{{ getTotalItems() }}</span>
                  <h5 class="text-muted stat-label" id="total-label">Totalt antal uppgifter</h5>
                </div>
                <div class="col-md-4">
                  <span class="text-success stat-number" aria-describedby="progress-label">{{
                    Math.round(getOverallProgress()) }}%</span>
                  <h5 class="text-muted stat-label" id="progress-label">Övergripande progression</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Översikt över alla projekt när inget specifikt projekt är valt -->
      <div v-else-if="!selectedProjectId && allProgress.length > 0">
        <div class="card">
          <div class="card-header">
            <h3 class="mb-0">
              <i class="bi bi-clipboard-data me-2"></i>
              Övergripande projektstatus
            </h3>
          </div>
          <div class="card-body">
            <!-- Osynlig fokuspunkt som kan tabbas till -->
            <div class="visually-hidden" tabindex="0" :aria-label="getFullOverviewDescription()"
              @focus="announceFullOverview">
              Översikt för alla projekt
            </div>

            <!-- Grupperade projekt med rollframsteg -->
            <div class="row g-3" role="list" aria-label="Lista över alla projekt">
              <div v-for="projectGroup in groupedProgress" :key="projectGroup.projectId" class="col-12">
                <div class="project-summary-card"
                  :aria-label="`Projekt ${projectGroup.projectName}, ${Math.round(getProjectOverallProgress(projectGroup.progress))} procent slutfört`">
                  <!-- Projektnamn och övergripande framsteg -->
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0">
                      <i class="bi bi-folder me-2" aria-hidden="true"></i>
                      {{ projectGroup.projectName }}
                    </h4>
                    <span class="badge bg-secondary">
                      {{ Math.round(getProjectOverallProgress(projectGroup.progress)) }}%
                    </span>
                  </div>

                  <!-- Vy med rollframsteg -->
                  <div class="row g-2">
                    <div v-for="progress in projectGroup.progress" :key="progress._id" class="col-md-4">
                      <div class="mini-progress-card">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <small class="text-muted">
                            <i :class="getRoleIcon(progress.role)" class="me-1" aria-hidden="true"></i>
                            {{ getRoleDisplayName(progress.role) }}
                          </small>
                          <small class="text-muted">{{ Math.round(getProgressPercentage(progress)) }}%</small>
                        </div>
                        <div class="progress" style="height: 4px;" role="progressbar"
                          :aria-valuenow="Math.round(getProgressPercentage(progress))" aria-valuemin="0"
                          aria-valuemax="100"
                          :aria-label="`${getRoleDisplayName(progress.role)} ${Math.round(getProgressPercentage(progress))} procent`">
                          <div class="progress-bar" :class="getProgressBarClass(progress)"
                            :style="{ width: getProgressPercentage(progress) + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meddelande när ingen data finns tillgänglig -->
      <div v-else class="text-center py-5" role="status">
        <i class="bi bi-graph-up text-muted" style="font-size: 3rem;" aria-hidden="true"></i>
        <h4 class="mt-3 text-muted">Ingen projektstatus tillgänglig</h4>
        <p class="text-muted">{{ statusMessage }}</p>
      </div>
    </div>
  </BaseDashboard>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import BaseDashboard from '@/components/BaseDashboard.vue'
import ProjectSelector from '@/components/ProjectSelector.vue'
import { progressService } from '@/services/progressService'

// Reaktiva tillstånd för komponentens data
const selectedProjectId = ref(null)
const selectedProjectName = ref('')
const projectProgress = ref([])
const allProgress = ref([])
const loading = ref(false)
const error = ref('')
const ariaLiveMessage = ref('')

// Template refs för fokushantering
const projectStatusCard = ref(null)
const projectStatusHeading = ref(null)

// Meddelande för tom status
const statusMessage = computed(() => {
  return selectedProjectId.value
    ? 'Ingen progression hittades för detta projekt.'
    : 'Välj ett projekt för att se detaljerad status.'
})

// Beräknad egenskap för att gruppera progression efter projekt
const groupedProgress = computed(() => {
  const groups = {}
  allProgress.value.forEach(progress => {
    // Säkerhetskontroll för att undvika fel med saknad projectId
    if (!progress.projectId) return

    const projectId = progress.projectId._id || progress.projectId
    const projectName = progress.projectId.name || 'Okänt projekt'

    if (!groups[projectId]) {
      groups[projectId] = {
        projectId,
        projectName,
        progress: []
      }
    }
    groups[projectId].progress.push(progress)
  })
  return Object.values(groups)
})

// Hantera när användaren väljer ett projekt
const handleProjectSelected = async (project) => {
  if (project) {
    selectedProjectName.value = project.name
    await loadProjectProgress(project.id || project._id)

    // Vänta på att data laddats och DOM uppdaterats
    await nextTick()

    // Detaljerat meddelande för skärmläsare
    let message = `Visar status för projekt ${project.name}.`

    if (projectProgress.value.length > 0) {
      const overallPercent = Math.round(getOverallProgress())
      const totalCompleted = getTotalCompleted()
      const totalItems = getTotalItems()

      message += ` Övergripande progression: ${overallPercent} procent.`
      message += ` ${totalCompleted} av ${totalItems} uppgifter slutförda.`

      // Lägg till detaljerad information för varje roll
      projectProgress.value.forEach(progress => {
        const percent = Math.round(getProgressPercentage(progress))
        const roleName = getRoleDisplayName(progress.role)
        message += ` ${roleName}: ${percent} procent slutfört.`
        message += ` ${progress.completedItems || 0} av ${progress.totalItems || 0} uppgifter klara.`

        if (progress.lastUpdated) {
          message += ` Senast uppdaterad ${formatDate(progress.lastUpdated)}.`
        }
      })
    }

    // Meddela via ARIA live region
    ariaLiveMessage.value = message

    // Sätt fokus på projektstatus-rubriken efter att data laddats
    await nextTick()
    if (projectStatusHeading.value) {
      projectStatusHeading.value.focus()
    }
  } else {
    selectedProjectName.value = ''
    projectProgress.value = []
    ariaLiveMessage.value = 'Projektval rensades. Visar översikt för alla projekt.'
  }
}

// Ladda progressionsdata för ett specifikt projekt
const loadProjectProgress = async (projectId) => {
  try {
    loading.value = true
    error.value = ''

    const result = await progressService.getProjectProgress(projectId)

    if (result.success) {
      projectProgress.value = result.data
    } else {
      error.value = result.message
      projectProgress.value = []
    }

  } catch (err) {
    error.value = 'Kunde inte ladda projektstatus'
    projectProgress.value = []
  } finally {
    loading.value = false
  }
}

// Ladda progressionsdata för alla projekt
const loadAllProgress = async () => {
  try {
    loading.value = true
    error.value = ''

    const result = await progressService.getAllProgress()

    if (result.success) {
      allProgress.value = result.data
    } else {
      error.value = result.message
      allProgress.value = []
    }

  } catch (err) {
    error.value = 'Kunde inte ladda projektstatus'
    allProgress.value = []
  } finally {
    loading.value = false
  }
}

// Beräkna procentuella framsteg för en roll
const getProgressPercentage = (progress) => {
  if (!progress.totalItems || progress.totalItems === 0) return 0
  return (progress.completedItems / progress.totalItems) * 100
}

// Bestäm färgklass för progressionsbar baserat på framsteg
const getProgressBarClass = (progress) => {
  const percentage = getProgressPercentage(progress)
  if (percentage === 100) return 'bg-success'
  if (percentage >= 75) return 'bg-info'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-danger'
}

// Räkna totalt antal slutförda uppgifter för valt projekt
const getTotalCompleted = () => {
  return projectProgress.value.reduce((sum, p) => sum + (p.completedItems || 0), 0)
}

// Räkna totalt antal uppgifter för valt projekt
const getTotalItems = () => {
  return projectProgress.value.reduce((sum, p) => sum + (p.totalItems || 0), 0)
}

// Beräkna övergripande framsteg för valt projekt
const getOverallProgress = () => {
  const total = getTotalItems()
  if (total === 0) return 0
  return (getTotalCompleted() / total) * 100
}

// Beräkna övergripande framsteg för ett projekt i översiktslistan
const getProjectOverallProgress = (progressArray) => {
  const totalCompleted = progressArray.reduce((sum, p) => sum + (p.completedItems || 0), 0)
  const totalItems = progressArray.reduce((sum, p) => sum + (p.totalItems || 0), 0)
  if (totalItems === 0) return 0
  return (totalCompleted / totalItems) * 100
}

// Hämta ikon för specifik roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill',
    'developer': 'bi bi-code-slash',
    'tester': 'bi bi-bug-fill'
  }
  return icons[role] || 'bi bi-person'
}

// Konvertera rollkod till svenskt visningsnamn
const getRoleDisplayName = (role) => {
  const names = {
    'designer': 'Designer',
    'developer': 'Utvecklare',
    'tester': 'Testare'
  }
  return names[role] || role
}

// Formatera datum för visning
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Skapa beskrivning av översikten för skärmläsare
const getFullOverviewDescription = () => {
  const projectCount = groupedProgress.value.length

  let description = `Övergripande projektstatus. ${projectCount} projekt.`

  // Information per projekt
  groupedProgress.value.forEach((projectGroup, index) => {
    const projectPercent = Math.round(getProjectOverallProgress(projectGroup.progress))
    description += ` ${projectGroup.projectName}: ${projectPercent} procent totalt.`

    // Information om varje roll
    projectGroup.progress.forEach(progress => {
      const rolePercent = Math.round(getProgressPercentage(progress))
      const roleName = getRoleDisplayName(progress.role)
      description += ` ${roleName}: ${rolePercent} procent.`
    })
  })

  return description
}

// Meddela översiktsinformation när fokus sätts
const announceFullOverview = () => {
  ariaLiveMessage.value = getFullOverviewDescription()
}

// Övervaka ändringar i valt projekt-ID
watch(() => selectedProjectId.value, (newProjectId) => {
  if (newProjectId) {
    loadProjectProgress(newProjectId)
  } else {
    projectProgress.value = []
  }
})

// Ladda all progressionsdata när komponenten monteras
onMounted(async () => {
  await loadAllProgress()

  // Om ingen projekt är valt, meddela skärmläsare om översikten
  if (!selectedProjectId.value && groupedProgress.value.length > 0) {
    // Vänta lite så att skärmläsaren hinner läsa upp sidan först
    setTimeout(() => {
      ariaLiveMessage.value = getFullOverviewDescription()
    }, 500)
  }
})
</script>

<style scoped>
/* Lägg till visuellt dold klass för ARIA live regions */
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

/* Styling för individuella progressionskort */
.progress-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.progress-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Styling för projektsammanfattningskort */
.project-summary-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Progressionskort för översiktsvyn */
.mini-progress-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
}

/* Grundläggande kortstyling */
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.1);
}

/* Fokusstilar för element som kan ta emot fokus */
*:focus {
  outline: 2px solid #334155;
  outline-offset: 2px;
}

/* Progressionsbar-styling */
.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.3s ease;
}

/* Bakgrundsfärger för olika element */
.bg-light {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0;
}

.badge.bg-primary {
  background-color: #334155 !important;
}

.badge.bg-secondary {
  background-color: #64748b !important;
}

/* Siffror i statistiksektionen */
.text-primary,
.text-info,
.text-success {
  color: #1e293b !important;
}
</style>