<!-- components/admin/ChecklistItemModal.vue - Modal för att skapa och redigera checklistpunkter med unikhetstvalidering -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);" aria-modal="true"
    role="dialog" :aria-labelledby="modalTitleId" @click.self="handleBackdropClick" @keydown.esc="handleEscape">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" ref="modalContent">
        <div class="modal-header">
          <h5 class="modal-title text-blue-darkest" :id="modalTitleId">
            <i class="bi bi-check2-square me-2" aria-hidden="true"></i>
            {{ isEditing ? 'Redigera' : 'Lägg till' }} checklistpunkt - {{ getRoleDisplayName(role) }}
          </h5>
          <button type="button" class="btn-close" @click="handleClose" @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose" aria-label="Stäng modal">
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">

            <!-- Titel för checklistpunkt -->
            <div class="mb-3">
              <label for="checklistTitle" class="form-label">
                Titel <span class="text-danger" aria-hidden="true">*</span>
              </label>
              <input id="checklistTitle" ref="firstInput" v-model="form.title" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.title && errors.title }" placeholder="Skriv en titel" required
                autocomplete="off" @blur="hasBeenTouched.title = true" @keydown="handleFormKeydown"
                :aria-describedby="getAriaDescribedBy('title')"
                :aria-invalid="hasBeenTouched.title && errors.title ? 'true' : 'false'" />
              <div v-if="hasBeenTouched.title && errors.title" id="title-error" class="invalid-feedback" role="alert"
                aria-live="polite">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                {{ errors.title }}
              </div>
            </div>

            <!-- Innehåll/beskrivning av checklistpunkt -->
            <div class="mb-3">
              <label for="checklistContent" class="form-label">
                Innehåll <span class="text-danger" aria-hidden="true">*</span>
              </label>
              <textarea id="checklistContent" v-model="form.content" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.content && errors.content }" rows="4"
                placeholder="Beskriv vad som ska göras..." required @blur="hasBeenTouched.content = true"
                @keydown="handleFormKeydown" :aria-describedby="getAriaDescribedBy('content', 'content-help')"
                :aria-invalid="hasBeenTouched.content && errors.content ? 'true' : 'false'"></textarea>
              <div id="content-help" class="form-text">
                <i class="bi bi-link-45deg me-1" aria-hidden="true"></i>
                Du kan inkludera hela webbadresser med https:// (t.ex. https://digg.se) som blir automatiskt klickbara
                länkar. Skriv även instruktioner och andra detaljer som {{ getRoleDisplayName(role).toLowerCase() }}
                behöver.
              </div>
              <div v-if="hasBeenTouched.content && errors.content" id="content-error" class="invalid-feedback"
                role="alert" aria-live="polite">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                {{ errors.content }}
              </div>
            </div>

            <!-- Information om rollen och checklistans syfte -->
            <div class="alert alert-info" role="region" aria-label="Information om checklistpunkt">
              <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
              <strong>För {{ getRoleDisplayName(role) }}:</strong> Denna punkt kommer att visas i {{
                getRoleDisplayName(role).toLowerCase() }}ns checklista och kan bockas av när uppgiften är klar.
            </div>

            <!-- Felmeddelande från API vid problem -->
            <div v-if="apiError" class="alert alert-danger" role="alert" aria-live="assertive" ref="errorAlert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {{ apiError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleClose" @keydown.enter="handleClose"
              @keydown.space.prevent="handleClose" :disabled="loading" ref="cancelButton">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid"
              @keydown="handleFormKeydown" ref="submitButton"
              :aria-describedby="loading ? 'submit-loading' : undefined">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              <span v-if="loading" id="submit-loading" class="visually-hidden">Laddar...</span>
              {{ isEditing ? 'Uppdatera' : 'Lägg till' }} punkt
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
  item: {
    type: Object,
    default: null
  },
  role: {
    type: String,
    required: true
  },
  projectId: {
    type: [String, Number],
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  existingItems: {
    type: Array,
    default: () => []
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

// Formulärdata för checklistpunkt
const form = ref({
  title: '',
  content: ''
})

// Felhantering och validering
const errors = ref({})
const apiError = ref('')
const loading = ref(false)

// Spåra vilka fält användaren har interagerat med för bättre UX
const hasBeenTouched = ref({
  title: false,
  content: false
})

// Kontrollera om formuläret är giltigt för att aktivera submitknapp
const isFormValid = computed(() => {
  return form.value.title.trim() &&
    form.value.content.trim() &&
    Object.keys(errors.value).length === 0
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

// Validera att titeln är unik bland befintliga checklistpunkter
const validateUniqueTitle = (title, existingItems, currentItemId) => {
  if (!title || !existingItems || existingItems.length === 0) {
    return true
  }

  const trimmedTitle = title.trim().toLowerCase()

  return !existingItems.some(item => {
    // Exkludera aktuell item vid redigering
    if (currentItemId && (item.id === currentItemId || item._id === currentItemId)) {
      return false
    }

    return item.title && item.title.trim().toLowerCase() === trimmedTitle
  })
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

// Validera formulärfält
const validateForm = () => {
  errors.value = {}

  // Validera titel med stöd för svenska tecken
  if (!form.value.title.trim()) {
    errors.value.title = 'Titel är obligatorisk'
  } else if (form.value.title.trim().length < 3) {
    errors.value.title = 'Titel måste vara minst 3 tecken'
  } else if (form.value.title.trim().length > 100) {
    errors.value.title = 'Titel får vara max 100 tecken'
  } else if (!validateUniqueTitle(form.value.title, props.existingItems, props.item?._id || props.item?.id)) {
    errors.value.title = 'En checklistpunkt med denna titel finns redan'
  }

  // Validera innehåll
  if (!form.value.content.trim()) {
    errors.value.content = 'Innehåll är obligatoriskt'
  } else if (form.value.content.trim().length < 10) {
    errors.value.content = 'Innehåll måste vara minst 10 tecken'
  } else if (form.value.content.trim().length > 1000) {
    errors.value.content = 'Innehåll får vara max 1000 tecken'
  }

  return Object.keys(errors.value).length === 0
}

// Hantera formulärinlämning
const handleSubmit = async () => {
  // Markera alla fält som "berörda" vid submit för att visa eventuella fel
  hasBeenTouched.value = {
    title: true,
    content: true
  }

  // Rensa tidigare API-fel
  apiError.value = ''

  // Validera innan formuläret skickas
  if (!validateForm()) {
    // Sätt fokus på första fältet med fel
    await nextTick()
    const firstErrorField = Object.keys(errors.value)[0]
    if (firstErrorField === 'title' && firstInput.value) {
      firstInput.value.focus()
    } else if (firstErrorField === 'content') {
      document.getElementById('checklistContent')?.focus()
    }
    return
  }

  loading.value = true

  try {
    const itemData = {
      title: form.value.title.trim(),
      content: form.value.content.trim()
    }

    // Skicka data till föräldrakomponent med callback för hantering av resultat
    emit('save', itemData, (result) => {
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
        apiError.value = result.message || 'Ett fel uppstod vid sparande av checklistpunkt'
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
watch([() => form.value.title, () => form.value.content], () => {
  if (hasBeenTouched.value.title || hasBeenTouched.value.content) {
    validateForm()
  }
})

// Initiera formulär när checklistpunktsdata ändras (för redigeringsläge)
watch(() => props.item, (newItem) => {
  if (newItem && props.isEditing) {
    form.value = {
      title: newItem.title || '',
      content: newItem.content || ''
    }
    // Vid redigering markera alla fält som redan berörda 
    hasBeenTouched.value = {
      title: true,
      content: true
    }
  }
}, { immediate: true })

// Initiera formulär och sätt fokus när komponenten laddas
onMounted(async () => {
  // Spara referens till elementet som hade fokus innan modalen öppnades
  previousActiveElement.value = document.activeElement

  // Lägg till event listener för tangentbord
  document.addEventListener('keydown', handleEscape)

  if (props.item && props.isEditing) {
    // Redigeringsläge - fyll i befintliga data
    form.value = {
      title: props.item.title || '',
      content: props.item.content || ''
    }
    hasBeenTouched.value = {
      title: true,
      content: true
    }
  } else {
    // Skapa ny checklistpunkt - börja med tomt formulär
    form.value = {
      title: '',
      content: ''
    }
    hasBeenTouched.value = {
      title: false,
      content: false
    }

    // Säkerställ att fälten är tomma
    setTimeout(() => {
      form.value.title = ''
      form.value.content = ''
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
  z-index: 1060;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.text-blue-darkest {
  color: #1e293b !important;
}

.alert-info {
  background-color: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}

.alert {
  border: none;
  border-radius: 8px;
}

.alert[tabindex="-1"]:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.form-label {
  font-weight: 600;
  color: #495057;
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

/* Fokusindikator */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
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

/* Responsiv anpassning för mobila enheter */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>