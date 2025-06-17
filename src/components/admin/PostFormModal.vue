<!-- components/admin/PostFormModal.vue - modal för att skapa och redigera rollspecifika inlägg -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true"
    role="dialog" :aria-labelledby="modalTitleId" @click.self="handleBackdropClick" @keydown.escape="handleEscape">
    <div class="modal-dialog" role="document">
      <div class="modal-content" ref="modalContent">
        <div class="modal-header">
          <h5 class="modal-title" :id="modalTitleId">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2" aria-hidden="true"></i>
            {{ isEditing ? 'Redigera inlägg' : 'Skapa nytt inlägg' }}
          </h5>
          <button type="button" class="btn-close" @click="handleClose" aria-label="Stäng modal">
          </button>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="modal-body">
            <!-- Titel för inlägget -->
            <div class="mb-3">
              <label for="title" class="form-label">
                Titel <span class="text-danger" aria-label="obligatoriskt">*</span>
              </label>
              <input id="title" ref="firstInput" v-model="form.title" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.title && errors.title }" placeholder="Skriv en titel" required
                @blur="hasBeenTouched.title = true" @keydown="handleFormKeydown"
                :aria-describedby="getAriaDescribedBy('title')"
                :aria-invalid="hasBeenTouched.title && errors.title ? 'true' : 'false'" autocomplete="off" />
              <div v-if="hasBeenTouched.title && errors.title" id="title-error" class="invalid-feedback" role="alert"
                aria-live="polite">
                {{ errors.title }}
              </div>
            </div>

            <!-- Rollval (följer backend enum) -->
            <div class="mb-3">
              <label for="role" class="form-label">
                Roll <span class="text-danger" aria-label="obligatoriskt">*</span>
              </label>
              <select id="role" v-model="form.role" class="form-select"
                :class="{ 'is-invalid': hasBeenTouched.role && errors.role }" required
                @blur="hasBeenTouched.role = true" @change="handleRoleChange" @keydown="handleFormKeydown"
                :aria-describedby="getAriaDescribedBy('role', 'role-info')"
                :aria-invalid="hasBeenTouched.role && errors.role ? 'true' : 'false'">
                <option value="">Välj roll</option>
                <option value="designer">Designer</option>
                <option value="developer">Utvecklare</option>
                <option value="tester">Testare</option>
              </select>
              <div v-if="hasBeenTouched.role && errors.role" id="role-error" class="invalid-feedback" role="alert"
                aria-live="polite">
                {{ errors.role }}
              </div>
              <div id="role-info" class="form-text">
                <i class="bi bi-info-circle me-1" aria-hidden="true"></i>
                Admins kan se alla inlägg oavsett roll.
              </div>
            </div>

            <!-- Innehåll för inlägget -->
            <div class="mb-3">
              <label for="content" class="form-label">
                Innehåll <span class="text-danger" aria-label="obligatoriskt">*</span>
              </label>
              <textarea id="content" v-model="form.content" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.content && errors.content }" rows="3"
                placeholder="Skriv ditt innehåll här..." required @blur="hasBeenTouched.content = true"
                @keydown="handleFormKeydown" :aria-describedby="getAriaDescribedBy('content', 'content-info')"
                :aria-invalid="hasBeenTouched.content && errors.content ? 'true' : 'false'"></textarea>
              <div id="content-info" class="form-text">
                <i class="bi bi-link-45deg me-1" aria-hidden="true"></i>
                Skriv hela webbadresser med https:// (t.ex. https://digg.se) så blir de automatiskt klickbara länkar som
                öppnas i nytt fönster.
              </div>
              <div v-if="hasBeenTouched.content && errors.content" id="content-error" class="invalid-feedback"
                role="alert" aria-live="polite">
                {{ errors.content }}
              </div>
            </div>

            <!-- Rollbeskrivning (visas när roll är vald) -->
            <div v-if="form.role" class="alert alert-info" role="status" aria-live="polite">
              <h6>
                <i :class="getRoleIcon(form.role)" class="me-2" aria-hidden="true"></i>
                {{ getRoleDisplayName(form.role) }}
              </h6>
              <p class="mb-0 small">{{ getRoleDescription(form.role) }}</p>
            </div>

            <!-- Felmeddelande från API vid problem -->
            <div v-if="apiError" class="alert alert-danger" role="alert" aria-live="assertive" tabindex="-1"
              ref="errorAlert">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {{ apiError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="handleClose" :disabled="loading"
              ref="cancelButton">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid"
              :aria-busy="loading ? 'true' : 'false'" ref="submitButton">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true">
                <span class="visually-hidden">Bearbetar...</span>
              </span>
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} inlägg
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
  post: {
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

// Unik ID för modal-titel (för ARIA)
const modalTitleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`

// Formulärdata för inlägg
const form = ref({
  title: '',
  role: '',
  content: ''
})

// Felhantering och validering
const errors = ref({})
const apiError = ref('')
const loading = ref(false)

// Spåra vilka fält användaren har interagerat med för bättre UX
const hasBeenTouched = ref({
  title: false,
  role: false,
  content: false
})

// Kontrollera om formuläret är giltigt för att aktivera submitknapp
const isFormValid = computed(() => {
  return form.value.title.trim() &&
    form.value.role &&
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

// Hantera rollförändring
const handleRoleChange = () => {
  hasBeenTouched.value.role = true
  // Annonsera rollbeskrivning för skärmläsare
  if (form.value.role) {
    setTimeout(() => {
      const description = getRoleDescription(form.value.role)
      // Skapa ett temporärt meddelande för skärmläsare
      announceToScreenReader(`Roll vald: ${getRoleDisplayName(form.value.role)}. ${description}`)
    }, 100)
  }
}

// Annonsera meddelanden till skärmläsare
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'visually-hidden'
  document.body.appendChild(announcement)

  setTimeout(() => {
    announcement.textContent = message
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, 100)
}

// Focus trap - håll fokus inom modalen
const trapFocus = (event) => {
  if (!modalContent.value) return

  const focusableElements = modalContent.value.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  trapFocus(event)
}

// Hantera Escape-tangent
const handleEscape = () => {
  if (!loading.value) {
    handleClose()
  }
}

// Hantera klick på bakgrund
const handleBackdropClick = () => {
  if (!loading.value) {
    handleClose()
  }
}

// Hantera stängning av modal
const handleClose = () => {
  emit('close')
}

// Validera formulärfält
const validateForm = () => {
  errors.value = {}

  // Validera titel
  if (!form.value.title.trim()) {
    errors.value.title = 'Titel är obligatorisk'
  } else if (form.value.title.trim().length < 3) {
    errors.value.title = 'Titel måste vara minst 3 tecken'
  } else if (form.value.title.trim().length > 100) {
    errors.value.title = 'Titel får inte vara längre än 100 tecken'
  }

  // Validera roll
  if (!form.value.role) {
    errors.value.role = 'Roll är obligatorisk'
  }

  // Validera innehåll
  if (!form.value.content.trim()) {
    errors.value.content = 'Innehåll är obligatoriskt'
  } else if (form.value.content.trim().length < 10) {
    errors.value.content = 'Innehåll måste vara minst 10 tecken'
  }

  return Object.keys(errors.value).length === 0
}

// Hantera formulärinlämning
const handleSubmit = async () => {
  // Markera alla fält som berörda vid submit för att visa eventuella fel
  hasBeenTouched.value = {
    title: true,
    role: true,
    content: true
  }

  // Rensa tidigare API-fel
  apiError.value = ''

  // Validera innan formuläret skickas
  if (!validateForm()) {
    // Fokusera på första fältet med fel
    await nextTick()
    const firstErrorField = document.querySelector('.is-invalid')
    if (firstErrorField) {
      firstErrorField.focus()
      const fieldName = firstErrorField.id
      if (errors.value[fieldName]) {
        announceToScreenReader(`Fel i formuläret: ${errors.value[fieldName]}`)
      }
    }
    return
  }

  loading.value = true

  try {
    const postData = {
      title: form.value.title.trim(),
      role: form.value.role,
      content: form.value.content.trim()
    }

    // Skicka data till föräldrakomponent med callback för hantering av resultat
    emit('save', postData, (result) => {
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

      // Hantera fel via erroregenskap
      if (result.error) {
        apiError.value = result.error

        // Om det finns fältspecifika fel
        if (result.field && result.error) {
          errors.value = {
            [result.field]: result.error
          }
        }
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera fel via message utan successflagga
      if (result.message && result.success !== true) {
        apiError.value = result.message
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera HTTP-felkoder
      if (result.status >= 400 || result.statusCode >= 400) {
        apiError.value = result.message || 'Ett fel uppstod vid skapande av inlägg'
        loading.value = false
        focusErrorAlert()
        return
      }

      // Framgång - stäng modal
      loading.value = false
      announceToScreenReader(`Inlägg ${props.isEditing ? 'uppdaterat' : 'skapat'} framgångsrikt`)
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

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill',
    'developer': 'bi bi-code-slash',
    'tester': 'bi bi-bug-fill'
  }
  return icons[role] || 'bi bi-file-text'
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

// Hämta beskrivning för vald roll
const getRoleDescription = (role) => {
  const descriptions = {
    'designer': 'Inlägget kommer endast synas för användare med designerrollen.',
    'developer': 'Inlägget kommer endast synas för användare med utvecklarrollen.',
    'tester': 'Inlägget kommer endast synas för användare med testrollen.'
  }
  return descriptions[role] || ''
}

// Realtidsvalidering när användaren skriver (endast för berörda fält)
watch([() => form.value.title, () => form.value.content, () => form.value.role], () => {
  if (hasBeenTouched.value.title || hasBeenTouched.value.content || hasBeenTouched.value.role) {
    validateForm()
  }
})

// Initiera formulär när inläggsdata ändras (för redigeringsläge)
watch(() => props.post, (newPost) => {
  if (newPost && props.isEditing) {
    form.value = {
      title: newPost.title || '',
      role: newPost.role || '',
      content: newPost.content || ''
    }
    // Vid redigering markera alla fält som redan berörda
    hasBeenTouched.value = {
      title: true,
      role: true,
      content: true
    }
  }
}, { immediate: true })

// Initiera formulär och sätt fokus när komponenten laddas
onMounted(async () => {
  // Lägg till event listener för tangentbord
  document.addEventListener('keydown', trapFocus)

  if (props.post && props.isEditing) {
    // Redigeringsläge - fyll i befintliga data
    form.value = {
      title: props.post.title || '',
      role: props.post.role || '',
      content: props.post.content || ''
    }
    hasBeenTouched.value = {
      title: true,
      role: true,
      content: true
    }
  } else {
    // Skapa nytt inlägg - börja med tomt formulär
    form.value = {
      title: '',
      role: '',
      content: ''
    }
    hasBeenTouched.value = {
      title: false,
      role: false,
      content: false
    }

    // Säkerställ att fälten är tomma
    setTimeout(() => {
      form.value.title = ''
      form.value.role = ''
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
      // Annonsera att modalen har öppnats
      announceToScreenReader(`Modal öppnad: ${props.isEditing ? 'Redigera inlägg' : 'Skapa nytt inlägg'}`)
    }
  }, 150)
})

// Rensa event listeners när komponenten tas bort
onUnmounted(() => {
  document.removeEventListener('keydown', trapFocus)
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

.modal-dialog {
  max-width: 500px;
}

.form-control[rows] {
  resize: vertical;
  min-height: 80px;
}

/* Förbättrad fokusindikator för tangentbordsnavigering */
.form-control:focus,
.form-select:focus,
.btn:focus,
.btn-close:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-text {
  color: #6c757d;
  font-size: 0.875rem;
}

.alert-info {
  background-color: #cff4fc;
  border-color: #b6effb;
  color: #055160;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
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

/* Responsiv anpassning för olika skärmstorlekar */
@media (max-width: 768px) {
  .modal-dialog {
    max-width: 95%;
    margin: 1rem auto;
  }

  .form-control[rows] {
    min-height: 70px;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-header {
    padding: 0.75rem;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .modal-footer {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>