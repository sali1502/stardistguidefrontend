<!-- components/admin/ProjectFormModal.vue - modal för att skapa och redigera projekt med automatisk checklistgenerering från backend -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true"
    role="dialog" :aria-labelledby="modalTitleId" @click.self="handleBackdropClick" @keydown.esc="handleEscape">
    <div class="modal-dialog" role="document">
      <div class="modal-content" ref="modalContent">
        <div class="modal-header">
          <h4 class="modal-title" :id="modalTitleId">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2" aria-hidden="true"></i>
            {{ isEditing ? 'Redigera projekt' : 'Skapa nytt projekt' }}
          </h4>
          <button type="button" class="btn-close" @click="handleClose" @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose" aria-label="Stäng modal">
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Projektnamn -->
            <div class="mb-3">
              <label for="projectName" class="form-label">
                Projektnamn <span class="text-danger" aria-label="obligatoriskt fält">*</span>
              </label>
              <input id="projectName" ref="firstInput" v-model="form.name" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.name && errors.name }" placeholder="Skriv projektnamn" required
                autocomplete="off" @blur="hasBeenTouched.name = true" @keydown="handleFormKeydown"
                :aria-describedby="getAriaDescribedBy('name', 'projectName-help')"
                :aria-invalid="hasBeenTouched.name && errors.name ? 'true' : 'false'" />
              <div id="projectName-help" class="form-text">
                Projektnamnet används för att identifiera projektet och dess checklistor.
              </div>
              <div v-if="hasBeenTouched.name && errors.name" id="name-error" class="invalid-feedback" role="alert"
                aria-live="polite">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                {{ errors.name }}
              </div>
            </div>

            <!-- Information om vad som skapas -->
            <div v-if="!isEditing" class="alert alert-info" role="region" aria-label="Information om projektskapande">
              <h5>
                <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                Vad händer när projektet skapas?
              </h5>
              <p class="mb-2 small">När du skapar ett nytt projekt kommer följande att skapas automatiskt:</p>
              <ul class="mb-0 small">
                <li><strong>Checklista för designer</strong> med 3 standardpunkter</li>
                <li><strong>Checklista för utvecklare</strong> med 3 standardpunkter</li>
                <li><strong>Checklista för testare</strong> med 3 standardpunkter</li>
              </ul>
            </div>

            <!-- Felmeddelande från API -->
            <div v-if="apiError" class="alert alert-danger" role="alert" aria-live="assertive" ref="errorAlert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {{ apiError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="handleClose" @keydown.enter="handleClose"
              @keydown.space.prevent="handleClose" :disabled="loading" ref="cancelButton">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid"
              @keydown="handleFormKeydown" ref="submitButton"
              :aria-describedby="loading ? 'submit-loading' : undefined">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              <span v-if="loading" id="submit-loading" class="visually-hidden">Laddar...</span>
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} projekt
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props från föräldrakomponent
const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  returnFocusTo: {
    type: Object,
    default: null
  }
})

// Events som skickas till föräldrakomponent
const emit = defineEmits(['save', 'close'])

// Refs för DOM-element
const firstInput = ref(null)
const modalContent = ref(null)
const cancelButton = ref(null)
const submitButton = ref(null)
const errorAlert = ref(null)

// Element som hade fokus innan modalen öppnades
const previousActiveElement = ref(null)

// Unik ID för modal-titel (för ARIA)
const modalTitleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`

// Formulärdata
const form = ref({
  name: ''
})

// Felhantering och validering
const errors = ref({})
const apiError = ref('')
const loading = ref(false)

// Spåra vilka fält användaren har interagerat med för bättre UX
const hasBeenTouched = ref({
  name: false
})

// Kontrollera om formuläret är giltigt för att aktivera submitknapp
const isFormValid = computed(() => {
  return form.value.name.trim() && Object.keys(errors.value).length === 0
})

// Hjälpfunktion för aria-describedby
const getAriaDescribedBy = (fieldName, additionalId = null) => {
  const parts = []
  if (errors.value[fieldName] && hasBeenTouched.value[fieldName]) {
    parts.push(`${fieldName}-error`)
  }
  if (additionalId) {
    parts.push(additionalId)
  }
  return parts.length > 0 ? parts.join(' ') : undefined
}

// Focus trap - håll fokus inom modalen
const trapFocus = (event) => {
  if (!modalContent.value) return

  const focusableElements = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      // Shift+Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Hantera tangentbordsnavigering i formuläret
const handleFormKeydown = (event) => {
  // Hantera focus trap
  trapFocus(event)
}

// Hantera Escape-tangent
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}

// Hantera klick på bakgrund
const handleBackdropClick = () => {
  handleClose()
}

// Hantera stängning av modal
const handleClose = () => {
  // Återställ fokus till elementet som hade fokus innan modalen öppnades
  if (props.returnFocusTo) {
    props.returnFocusTo.focus()
  } else if (previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
  emit('close')
}

// Validera formulärfält
const validateForm = () => {
  errors.value = {}

  // Validera projektnamn med stöd för svenska tecken
  if (!form.value.name.trim()) {
    errors.value.name = 'Projektnamn är obligatoriskt'
  } else if (form.value.name.trim().length < 3) {
    errors.value.name = 'Projektnamn måste vara minst 3 tecken'
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = 'Projektnamn får inte vara längre än 100 tecken'
  } else if (!/^[\p{L}0-9\s._-]+$/u.test(form.value.name.trim())) {
    errors.value.name = 'Projektnamn får bara innehålla bokstäver (inklusive åäö), siffror, mellanslag, punkt, underscore och bindestreck'
  }

  return Object.keys(errors.value).length === 0
}

// Hantera formulärinlämning
const handleSubmit = async () => {
  // Markera alla fält som berörda vid submit för att visa eventuella fel
  hasBeenTouched.value = {
    name: true
  }

  // Rensa tidigare API-fel
  apiError.value = ''

  // Validera innan vi skickar
  if (!validateForm()) {
    // Sätt fokus på första fältet med fel
    await nextTick()
    const firstErrorField = Object.keys(errors.value)[0]
    if (firstErrorField === 'name' && firstInput.value) {
      firstInput.value.focus()
    }
    return
  }

  loading.value = true

  try {
    const projectData = {
      name: form.value.name.trim()
    }

    // Skicka data till föräldrakomponent med callback för hantering av resultat
    emit('save', projectData, (result) => {
      // Hantera undefined/null resultat
      if (!result) {
        apiError.value = 'Ingen respons från servern'
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera explicit fel (success: false)
      if (result.success === false) {
        apiError.value = result.message || 'Ett fel uppstod'

        // Hantera fältspecifika fel om de finns
        if (result.errors) {
          errors.value = { ...errors.value, ...result.errors }
        }
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera fel via error-egenskap
      if (result.error) {
        apiError.value = result.error
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera fel via message utan success-flagga
      if (result.message && result.success !== true) {
        apiError.value = result.message
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera HTTP-felkoder
      if (result.status >= 400 || result.statusCode >= 400) {
        apiError.value = result.message || 'Ett fel uppstod vid skapande av projekt'
        loading.value = false
        focusErrorAlert()
        return
      }

      // Framgång - stäng modal
      loading.value = false
      handleClose()
    })

  } catch (error) {
    // Hantera oväntade fel under formulärhantering
    if (error.response) {
      // HTTP-fel med response från server
      const errorMessage = error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`
      apiError.value = errorMessage
    } else if (error.message) {
      // Vanligt JavaScript-fel
      apiError.value = error.message
    } else {
      // Fallback för okända fel
      apiError.value = 'Ett oväntat fel uppstod'
    }
    loading.value = false
    focusErrorAlert()
  }
}

// Sätt fokus på felmeddelande
const focusErrorAlert = async () => {
  await nextTick()
  if (errorAlert.value) {
    errorAlert.value.focus()
    errorAlert.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

// Realtidsvalidering när användaren skriver (endast för berörda fält)
watch(() => form.value.name, () => {
  if (hasBeenTouched.value.name) {
    validateForm()
  }
})

// Initiera formulär när projektdata ändras (för redigeringsläge)
watch(() => props.project, (newProject) => {
  if (newProject && props.isEditing) {
    form.value = {
      name: newProject.name || ''
    }
    // Vid redigering markera namn som redan berört
    hasBeenTouched.value = {
      name: true
    }
  }
}, { immediate: true })

// Initiera formulär och sätt fokus när komponenten laddas
onMounted(async () => {
  // Spara referens till elementet som hade fokus innan modalen öppnades
  previousActiveElement.value = document.activeElement

  // Lägg till event listener för tangentbord
  document.addEventListener('keydown', handleEscape)

  if (props.project && props.isEditing) {
    // Redigeringsläge - fyll i befintliga data
    form.value = {
      name: props.project.name || ''
    }
    hasBeenTouched.value = {
      name: true
    }
  } else {
    // Skapa nytt projekt - börja med tomt formulär
    form.value = {
      name: ''
    }
    hasBeenTouched.value = {
      name: false
    }

    // Säkerställ att fälten är tomma
    setTimeout(() => {
      form.value.name = ''
    }, 0)
  }

  // Rensa alla fel vid start
  errors.value = {}
  apiError.value = ''

  // Sätt fokus på första input-fältet
  await nextTick()
  setTimeout(() => {
    if (firstInput.value) {
      firstInput.value.focus()
    }
  }, 150)
})

// Rensa event listeners när komponenten tas bort
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.alert {
  border: none;
  border-radius: 8px;
}

.alert[tabindex="-1"]:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
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

/* Förbättrad fokusindikator */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

::placeholder {
  color: #6c757d !important;
  opacity: 1;
}

::-moz-placeholder {
  color: #6c757d !important;
  opacity: 1;
}

::-webkit-input-placeholder {
  color: #6c757d !important;
}

::-ms-input-placeholder {
  color: #6c757d !important;
}
</style>