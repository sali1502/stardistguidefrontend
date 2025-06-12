<!-- components/RoleChecklist.vue -->

<template>
  <div class="role-checklist">
    <!-- Header för checklista med rollspecifik information -->
    <div class="card mb-4">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">
              <i :class="getRoleIcon(userRole)" class="me-2"></i>
              {{ getRoleDisplayName(userRole) }} Checklista
            </h5>
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
      <div class="progress mb-4" style="height: 10px;">
        <div class="progress-bar bg-success" :style="{ width: progressPercentage + '%' }" role="progressbar"></div>
      </div>

      <div class="checklist-items">
        <div v-for="(item, index) in checklist.items" :key="index" class="card mb-3"
          :class="{ 'completed': item.completed }">
          <div class="card-body">
            <div class="d-flex align-items-start">
              <div class="form-check me-3 mt-1">
                <input :id="`item-${index}`" v-model="item.completed" type="checkbox" class="form-check-input"
                  @change="handleItemToggle(item, item.completed)" :disabled="updating" />
                <label :for="`item-${index}`" class="form-check-label visually-hidden">
                  Markera som klar
                </label>
              </div>

              <div class="flex-grow-1">
                <h6 class="mb-2" :class="{ 'text-decoration-line-through text-muted': item.completed }">
                  {{ item.title }}
                </h6>
                <div class="mb-0 text-muted" :class="{ 'text-decoration-line-through': item.completed }"
                  v-html="makeLinksClickable(item.content)">
                </div>
              </div>

              <div class="ms-3">
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
      <h5 class="mt-3 text-muted">Ingen checklista tillgänglig</h5>
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
const emit = defineEmits([])

// Reaktiv data för checklisthantering
const checklist = ref(null)
const loading = ref(false)
const error = ref('')
const updating = ref(false)

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
      // Backend uppdaterar progression automatiskt
    } else {
      // Återställ checkboxen vid fel
      item.completed = !completed
    }

  } catch (err) {
    // Återställ checkboxen vid fel
    item.completed = !completed
  } finally {
    updating.value = false
  }
}

// Hantera checkbox-klick för checklistpunkt
const handleItemToggle = (item, completed) => {
  toggleChecklistItem(item, completed)
}

// Gör URL:er klickbara
const makeLinksClickable = (text) => {
  if (!text) return ''
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi

  return text.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[.,;:!?]+$/, '')
    const punctuation = url.slice(cleanUrl.length)

    try {
      const urlObj = new URL(cleanUrl)
      const domain = urlObj.hostname.replace('www.', '')
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)

      let linkText = domain

      // Om det finns en path, använd sista delen som titel
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        if (lastPart.length <= 30) {
          linkText = lastPart
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
        }
      }

      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="accessible-link" title="Öppnar ${domain} i nytt fönster">${linkText}</a>${punctuation}`

    } catch (e) {
      const domain = cleanUrl.split('/')[2] || 'Extern länk'
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="accessible-link">${domain}</a>${punctuation}`
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
</style>