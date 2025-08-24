<!-- components/RoleChecklist.vue - Interaktiv checklista för olika användarroller (designer, utvecklare, testare) -->

<template>
  <div class="role-checklist">
    <!-- ARIA live region för att meddela checkliständringar -->
    <div class="visually-hidden" aria-live="polite" aria-atomic="true">
      {{ ariaLiveMessage }}
    </div>

    <!-- Header för checklista med rollspecifik information -->
    <div class="card mb-4">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h3 class="mb-0">
              <i :class="getRoleIcon(userRole)" class="me-2"></i>
              {{ getRoleDisplayName(userRole) }} Checklista
            </h3>
            <small class="text-muted" v-if="projectName">{{ projectName }}</small>
          </div>
          <div v-if="checklist && checklist.items">
            <span class="badge bg-success me-2">
              {{ completedCount }} / {{ totalCount }} klara
            </span>
            <span class="badge bg-primary">
              {{ Math.round(progressPercentage) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Laddningsindikator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary mb-3"></div>
      <p class="text-muted">Laddar checklista...</p>
    </div>

    <!-- Felmeddelande vid problem -->
    <div v-else-if="error" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Checklistinnehåll med uppgifter -->
    <div v-else-if="checklist && checklist.items && checklist.items.length > 0">
      <div class="progress mb-4" style="height: 10px;" role="progressbar"
        :aria-valuenow="Math.round(progressPercentage)" aria-valuemin="0" aria-valuemax="100"
        :aria-label="`Progression: ${Math.round(progressPercentage)} procent slutfört`">
        <div class="progress-bar bg-success" :style="{ width: progressPercentage + '%' }"></div>
      </div>

      <div class="checklist-items">
        <div v-for="(item, index) in checklist.items" :key="index" class="card mb-3"
          :class="{ 'completed': item.completed }">
          <div class="card-body">
            <div class="d-flex align-items-start">
              <div class="form-check me-3 mt-1">
                <input :id="`item-${index}`" v-model="item.completed" type="checkbox" class="form-check-input"
                  @change="handleItemToggle(item, item.completed)" :disabled="updating"
                  :aria-describedby="`item-desc-${index}`" />
                <label :for="`item-${index}`" class="form-check-label visually-hidden">
                  Markera {{ item.title }} som klar
                </label>
              </div>

              <div class="flex-grow-1" :id="`item-desc-${index}`">
                <h4 class="mb-2" :class="{ 'text-decoration-line-through text-muted': item.completed }">
                  {{ item.title }}
                </h4>
                <div class="mb-0 text-muted" :class="{ 'text-decoration-line-through': item.completed }"
                  v-html="makeLinksClickable(item.content)">
                </div>
              </div>

              <div class="ms-3" aria-hidden="true">
                <i v-if="item.completed" class="bi bi-check-circle-fill text-success" style="font-size: 1.25rem;"></i>
                <i v-else class="bi bi-circle text-muted" style="font-size: 1.25rem;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meddelande när inga checklistpunkter finns -->
    <div v-else class="text-center py-5">
      <i class="bi bi-list-check text-muted" style="font-size: 3rem;"></i>
      <h4 class="mt-3 text-muted">Ingen checklista tillgänglig</h4>
      <p class="text-muted">{{ checklistMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { checklistService } from '@/services/checklistService'

// Props från föräldrakomponent
const props = defineProps({
  projectId: {
    type: [String, Number],
    default: null
  },
  projectName: {
    type: String,
    default: ''
  },
  userRole: {
    type: String,
    required: true
  }
})

// Events som kan skickas till föräldrakomponent
const emit = defineEmits(['progress-updated'])

// Reaktiv data för checklisthantering
const checklist = ref(null)
const loading = ref(false)
const error = ref('')
const updating = ref(false)
const ariaLiveMessage = ref('')

// Beräkna antal slutförda uppgifter
const completedCount = computed(() => {
  if (!checklist.value?.items) return 0
  return checklist.value.items.filter(item => item.completed).length
})

// Beräkna totalt antal uppgifter
const totalCount = computed(() => {
  if (!checklist.value?.items) return 0
  return checklist.value.items.length
})

// Beräkna progress i procent
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})

// Meddelande för tomma checklistor
const checklistMessage = computed(() => {
  return props.projectId
    ? 'Inga checklistpunkter har skapats för detta projekt än.'
    : 'Välj ett projekt för att se checklistan.'
})

// Hämta checklista från backend för specifik roll och projekt
const fetchChecklist = async () => {
  if (!props.projectId || !props.userRole) {
    checklist.value = null
    return
  }

  try {
    loading.value = true
    error.value = ''

    const result = await checklistService.getChecklist(props.projectId, props.userRole)

    if (result.success) {
      checklist.value = result.data
    } else {
      error.value = result.message
      checklist.value = null
    }

  } catch (err) {
    error.value = 'Kunde inte ladda checklista'
    checklist.value = null
  } finally {
    loading.value = false
  }
}

// Uppdatera status för enskild checklistpunkt
const toggleChecklistItem = async (item, completed) => {
  try {
    updating.value = true

    const result = await checklistService.toggleChecklistItem(
      props.projectId,
      props.userRole,
      item._id || item.id,
      completed
    )

    if (result.success) {
      // Uppdatera ARIA live message för skärmläsare
      ariaLiveMessage.value = `${item.title} har markerats som ${completed ? 'slutförd' : 'ej slutförd'}`

      // Meddela projektframsteg
      emit('progress-updated', {
        completedItems: completedCount.value,
        totalItems: totalCount.value
      })
    } else {
      // Återställ checkboxen vid fel
      item.completed = !completed
      ariaLiveMessage.value = `Kunde inte uppdatera ${item.title}`
    }

  } catch (err) {
    // Återställ checkboxen vid fel
    item.completed = !completed
    ariaLiveMessage.value = `Ett fel uppstod vid uppdatering av ${item.title}`
  } finally {
    updating.value = false
  }
}

// Hantera checkbox-klick för checklistpunkt
const handleItemToggle = (item, completed) => {
  toggleChecklistItem(item, completed)
}

// Klickbara länkar - tillgänglighetsanpassade
const makeLinksClickable = (text) => {
  if (!text) return ''

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+(?:#[^\s<>"{}|\\^`\[\]]*)?/gi

  return text.replace(urlRegex, (url) => {
    let cleanUrl = url
    let punctuation = ''

    // Hantera interpunktion i slutet av URL:er
    const punctuationMatch = url.match(/([.,!?;]+)$/)
    if (punctuationMatch) {
      cleanUrl = url.slice(0, -punctuationMatch[1].length)
      punctuation = punctuationMatch[1]
    }

    const safeUrl = cleanUrl.replace(/\s/g, '%20')

    try {
      const urlObj = new URL(cleanUrl)
      const domain = urlObj.hostname.replace('www.', '')
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)

      let linkText = domain
      let description = domain

      // Bygg länktext med path-information
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        if (lastPart.length > 1 && !lastPart.includes('.')) {
          let readablePath = lastPart.replace(/-/g, ' ').replace(/_/g, ' ')

          // Klipp av om för långt (istället för att utesluta)
          if (readablePath.length > 30) {
            readablePath = readablePath.substring(0, 27) + '...'
          }

          linkText = `${domain} - ${readablePath}`
          description = `${readablePath} på ${domain}`
        }
      }

      return `<a href="${safeUrl}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 title="Öppnar ${description} i nytt fönster">${linkText}</a>${punctuation}`

    } catch (e) {
      const fallbackText = cleanUrl.split('/')[2] || 'Extern länk'
      return `<a href="${safeUrl}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 title="Öppnar extern webbplats i nytt fönster">${fallbackText}</a>${punctuation}`
    }
  })
}

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill',
    'developer': 'bi bi-code-slash',
    'tester': 'bi bi-bug-fill'
  }
  return icons[role] || 'bi bi-person'
}

// Översätt rollnamn till svenska för visning
const getRoleDisplayName = (role) => {
  const names = {
    'designer': 'Designer',
    'developer': 'Utvecklare',
    'tester': 'Testare'
  }
  return names[role] || role
}

// Övervaka ändringar i projektID eller roll och ladda om checklista
watch(() => [props.projectId, props.userRole], () => {
  fetchChecklist()
}, { immediate: true })
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

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.1);
  transition: all 0.2s ease;
}

.card.completed {
  background-color: #f8f9fa;
  opacity: 0.9;
}

.form-check-input {
  transform: scale(1.2);
  border: 2px solid #6c757d !important;
  border-radius: 4px !important;
}

.form-check-input:hover {
  border-color: #495057 !important;
  box-shadow: 0 0 0 0.1rem rgba(108, 117, 125, 0.25);
}

.form-check-input:focus {
  border-color: #28a745 !important;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-check-input:checked {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.3s ease;
}

.checklist-items .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.15);
}

.role-checklist .badge.bg-success,
.role-checklist span.badge.bg-success {
  background-color: #334155 !important;
  color: white !important;
}

.role-checklist .badge.bg-primary,
.role-checklist span.badge.bg-primary {
  background-color: #334155 !important;
  color: white !important;
}

.role-checklist .progress-bar.bg-success {
  background-color: #28a745 !important;
}

.role-checklist .form-check-input:checked {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

.role-checklist .text-success {
  color: #28a745 !important;
}

.role-checklist a,
.role-checklist a:link,
.role-checklist a:visited {
  color: #004085 !important;
  text-decoration: none !important;
  border-bottom: 1px solid transparent !important;
  transition: all 0.2s ease !important;
}

.role-checklist a:hover,
.role-checklist a:focus {
  color: #002752 !important;
  border-bottom-color: #002752 !important;
  text-decoration: none !important;
}

.role-checklist a:focus {
  outline: 2px solid #004085 !important;
  outline-offset: 2px !important;
}

.checklist-items a,
.checklist-items a:link,
.checklist-items a:visited {
  color: #004085 !important;
}

.checklist-items a:hover,
.checklist-items a:focus,
.checklist-items a:active {
  color: #002752 !important;
}
</style>