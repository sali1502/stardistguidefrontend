<!-- components/admin/UserFormModal.vue - modal för att skapa och redigera användare -->

<template>
  <div class="modal fade show d-block user-form-modal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true"
    role="dialog" :aria-labelledby="modalTitleId" @click.self="handleBackdropClick" @keydown.esc="handleEscape">
    <div class="modal-dialog" role="document">
      <div class="modal-content" ref="modalContent">
        <div class="modal-header">
          <h4 class="modal-title" :id="modalTitleId">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2" aria-hidden="true"></i>
            {{ isEditing ? 'Redigera användare' : 'Skapa ny användare' }}
          </h4>
          <button type="button" class="btn-close" @click="handleClose" @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose" aria-label="Stäng modal">
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Användarnamn -->
            <div class="mb-3">
              <label for="username" class="form-label">
                Användarnamn <span class="text-danger" aria-label="obligatoriskt fält">*</span>
              </label>
              <input id="username" ref="firstInput" v-model="form.username" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.username && errors.username }" placeholder="Skriv användarnamn"
                required autocomplete="username" @blur="hasBeenTouched.username = true" @keydown="handleFormKeydown"
                :aria-describedby="getAriaDescribedBy('username')"
                :aria-invalid="hasBeenTouched.username && errors.username ? 'true' : 'false'" />
              <div v-if="hasBeenTouched.username && errors.username" id="username-error" class="invalid-feedback"
                role="alert" aria-live="polite">
                {{ errors.username }}
              </div>
            </div>

            <!-- Rollval för användaren -->
            <div class="mb-3">
              <div id="role-label" class="form-label">
                Roll <span class="text-danger" aria-label="obligatoriskt fält">*</span>
              </div>
              <div class="dropdown w-100">
                <button id="role" class="btn btn-light dropdown-toggle w-100 text-start form-control"
                  :class="{ 'is-invalid': hasBeenTouched.role && errors.role }"
                  type="button" data-bs-toggle="dropdown"
                  aria-labelledby="role-label"
                  :aria-describedby="getAriaDescribedBy('role')"
                  :aria-invalid="hasBeenTouched.role && errors.role ? 'true' : 'false'"
                  :disabled="loading"
                  @blur="hasBeenTouched.role = true"
                  @keydown="handleFormKeydown">
                  {{ getRoleDisplayName(form.role) || 'Välj roll' }}
                </button>
                <ul class="dropdown-menu w-100">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="selectRole('admin')"
                      :class="{ active: form.role === 'admin' }">
                      <i class="bi bi-gear-fill me-2" aria-hidden="true"></i>
                      Administratör
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="selectRole('designer')"
                      :class="{ active: form.role === 'designer' }">
                      <i class="bi bi-palette-fill me-2" aria-hidden="true"></i>
                      Designer
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="selectRole('developer')"
                      :class="{ active: form.role === 'developer' }">
                      <i class="bi bi-code-slash me-2" aria-hidden="true"></i>
                      Utvecklare
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="selectRole('tester')"
                      :class="{ active: form.role === 'tester' }">
                      <i class="bi bi-bug-fill me-2" aria-hidden="true"></i>
                      Testare
                    </a>
                  </li>
                </ul>
              </div>
              <div v-if="hasBeenTouched.role && errors.role" id="role-error" class="invalid-feedback d-block" role="alert"
                aria-live="polite">
                {{ errors.role }}
              </div>
            </div>

            <!-- Lösenordsfält med visa/dölj-funktionalitet -->
            <div class="mb-3">
              <label for="password" class="form-label">
                {{ isEditing ? 'Nytt lösenord (lämna tomt för att behålla)' : 'Lösenord' }}
                <span v-if="!isEditing" class="text-danger" aria-label="obligatoriskt fält">*</span>
              </label>
              <div class="input-group">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                  class="form-control" :class="{ 'is-invalid': hasBeenTouched.password && errors.password }"
                  placeholder="Skriv lösenord (minst 6 tecken)" :required="!isEditing"
                  :autocomplete="isEditing ? 'new-password' : 'new-password'" @blur="hasBeenTouched.password = true"
                  @keydown="handleFormKeydown"
                  :aria-describedby="getAriaDescribedBy('password', 'password-toggle-help')"
                  :aria-invalid="hasBeenTouched.password && errors.password ? 'true' : 'false'" />
                <button type="button" class="btn btn-outline-secondary" @click="togglePasswordVisibility"
                  @keydown.enter="togglePasswordVisibility" @keydown.space.prevent="togglePasswordVisibility"
                  :aria-label="showPassword ? 'Dölj lösenord' : 'Visa lösenord'" :aria-pressed="showPassword.toString()"
                  tabindex="0">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                </button>
              </div>
              <div id="password-toggle-help" class="form-text">
                Använd knappen bredvid för att visa/dölja lösenordet
              </div>
              <div v-if="hasBeenTouched.password && errors.password" id="password-error" class="invalid-feedback"
                role="alert" aria-live="polite">
                {{ errors.password }}
              </div>
            </div>

            <!-- Beskrivning av vald roll -->
            <div v-if="form.role" class="alert alert-info" role="region"
              :aria-label="`Information om rollen ${getRoleDisplayName(form.role)}`">
              <h5>
                <i :class="getRoleIcon(form.role)" class="me-2" aria-hidden="true"></i>
                {{ getRoleDisplayName(form.role) }}
              </h5>
              <p class="mb-0 small">{{ getRoleDescription(form.role) }}</p>
            </div>

            <!-- Felmeddelande från API vid problem -->
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
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} användare
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
  user: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
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

// Formulärdata för användare
const form = ref({
  username: '',
  role: '',
  password: ''
})

// Felhantering och validering
const errors = ref({})
const apiError = ref('')
const loading = ref(false)
const showPassword = ref(false)

// Spåra vilka fält användaren har interagerat med för bättre UX
const hasBeenTouched = ref({
  username: false,
  role: false,
  password: false
})

// Kontrollera om formuläret är giltigt för att aktivera submitknapp
const isFormValid = computed(() => {
  return form.value.username.trim() &&
    form.value.role &&
    (props.isEditing || form.value.password) &&
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

// Hantera rollval från dropdown
const selectRole = (role) => {
  form.value.role = role
  hasBeenTouched.value.role = true
  
  // Validera direkt
  validateForm()
  
  // Annonsera rollbeskrivning för skärmläsare om en roll valts
  if (role) {
    const description = getRoleDescription(role)
    announceToScreenReader(`Roll vald: ${getRoleDisplayName(role)}. ${description}`)
  }
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

// Växla lösenordssynlighet
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  const message = showPassword.value ? 'Lösenord visas nu' : 'Lösenord är nu dolt'
  announceToScreenReader(message)
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
  if (previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
  emit('close')
}

// Validera formulärfält
const validateForm = () => {
  errors.value = {}

  // Validera användarnamn med stöd för svenska tecken
  if (!form.value.username.trim()) {
    errors.value.username = 'Användarnamn är obligatoriskt'
  } else if (form.value.username.trim().length < 3) {
    errors.value.username = 'Användarnamn måste vara minst 3 tecken'
  } else if (form.value.username.trim().length > 50) {
    errors.value.username = 'Användarnamn får inte vara längre än 50 tecken'
  } else if (!/^[\p{L}0-9._-]+$/u.test(form.value.username.trim())) {
    errors.value.username = 'Användarnamn får bara innehålla bokstäver (inklusive åäö), siffror, punkt, underscore och bindestreck'
  }

  // Validera roll
  if (!form.value.role) {
    errors.value.role = 'Roll är obligatorisk'
  }

  // Validera lösenord (endast obligatoriskt för nya användare)
  if (!props.isEditing) {
    if (!form.value.password) {
      errors.value.password = 'Lösenord är obligatoriskt'
    } else if (form.value.password.length < 6) {
      errors.value.password = 'Lösenord måste vara minst 6 tecken'
    }
  } else if (form.value.password && form.value.password.length < 6) {
    errors.value.password = 'Lösenord måste vara minst 6 tecken'
  }

  return Object.keys(errors.value).length === 0
}

// Hantera formulärinlämning
const handleSubmit = async () => {
  // Markera alla fält som "berörda" vid submit för att visa eventuella fel
  hasBeenTouched.value = {
    username: true,
    role: true,
    password: true
  }

  // Rensa tidigare API-fel
  apiError.value = ''

  // Validera innan formuläret skickas
  if (!validateForm()) {
    // Sätt fokus på första fältet med fel
    await nextTick()
    const firstErrorField = Object.keys(errors.value)[0]
    if (firstErrorField) {
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.focus()
        announceToScreenReader(`Fel i formuläret: ${errors.value[firstErrorField]}`)
      }
    }
    return
  }

  loading.value = true

  try {
    const userData = {
      username: form.value.username.trim(),
      role: form.value.role
    }

    // Lägg till lösenord endast om det är ifyllt
    if (form.value.password) {
      userData.password = form.value.password
    }

    // Skicka data till föräldrakomponent med callback för hantering av resultat
    emit('save', userData, (result) => {
      // Hantera undefined/null resultat
      if (!result) {
        apiError.value = 'Ingen respons från servern'
        loading.value = false
        focusErrorAlert()
        return
      }

      // Hantera fel (success: false)
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

      // Hantera fel via error
      if (result.error) {
        apiError.value = result.error
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
        apiError.value = result.message || 'Ett fel uppstod vid skapande av användare'
        loading.value = false
        focusErrorAlert()
        return
      }

      // Framgång - stäng modal
      loading.value = false
      announceToScreenReader(`Användare ${props.isEditing ? 'uppdaterad' : 'skapad'} framgångsrikt`)
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
    'admin': 'bi bi-gear-fill',
    'designer': 'bi bi-palette-fill',
    'developer': 'bi bi-code-slash',
    'tester': 'bi bi-bug-fill'
  }
  return icons[role] || 'bi bi-person'
}

// Översätt rollnamn till svenska för visning
const getRoleDisplayName = (role) => {
  const names = {
    'admin': 'Administratör',
    'designer': 'Designer',
    'developer': 'Utvecklare',
    'tester': 'Testare'
  }
  return names[role] || role
}

// Hämta beskrivning för vald roll
const getRoleDescription = (role) => {
  const descriptions = {
    'admin': 'Full åtkomst till alla funktioner.',
    'designer': 'Kan se designerspecifika checklistor och inlägg.',
    'developer': 'Kan se utvecklarspecifika checklistor och inlägg.',
    'tester': 'Kan se testspecifika checklistor och inlägg.'
  }
  return descriptions[role] || ''
}

// Realtidsvalidering när användaren skriver (endast för berörda fält)
watch([() => form.value.username, () => form.value.password, () => form.value.role], () => {
  if (hasBeenTouched.value.username || hasBeenTouched.value.password || hasBeenTouched.value.role) {
    validateForm()
  }
})

// Initiera formulär när användardata ändras (för redigeringsläge)
watch(() => props.user, (newUser) => {
  if (newUser && props.isEditing) {
    form.value = {
      username: newUser.username || '',
      role: newUser.role || '',
      password: ''
    }
    // Vid redigering markera användarnamn och roll som redan berörda
    hasBeenTouched.value = {
      username: true,
      role: true,
      password: false
    }
  }
}, { immediate: true })

// Initiera formulär och sätt fokus när komponenten laddas
onMounted(async () => {
  // Spara referens till elementet som hade fokus innan modalen öppnades
  previousActiveElement.value = document.activeElement

  // Lägg till event listener för tangentbord
  document.addEventListener('keydown', handleEscape)

  if (props.user && props.isEditing) {
    // Redigeringsläge - fyll i befintliga data
    form.value = {
      username: props.user.username || '',
      role: props.user.role || '',
      password: ''
    }
    hasBeenTouched.value = {
      username: true,
      role: true,
      password: false
    }
  } else {
    // Skapa ny användare - börja med tomt formulär
    form.value = {
      username: '',
      role: '',
      password: ''
    }
    hasBeenTouched.value = {
      username: false,
      role: false,
      password: false
    }

    // Säkerställ att fälten är tomma
    setTimeout(() => {
      form.value.username = ''
      form.value.role = ''
      form.value.password = ''
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
      announceToScreenReader(`Modal öppnad: ${props.isEditing ? 'Redigera användare' : 'Skapa ny användare'}`)
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

.input-group .btn {
  border-left: 0;
}

.input-group .form-control:focus+.btn {
  border-color: #86b7fe;
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

/* Dropdown styling */
.dropdown-item {
  text-decoration: none !important;
}

.dropdown-item:hover {
  text-decoration: none !important;
}

/* Dropdown (Bootstrap) som formulärfält */
.dropdown .btn.form-control {
  text-align: left;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  color: #1a1a1a;
  font-weight: normal;
}

.dropdown .btn.form-control:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #1a1a1a;
}

.dropdown .btn.form-control:focus {
  background: white;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  color: #1a1a1a;
}

.dropdown .btn.form-control.is-invalid {
  border-color: #b91c1c;
  background: #fef2f2;
}

.dropdown .btn.form-control.is-invalid:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.25);
}

.dropdown-menu {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

.dropdown-item.active {
  background-color: #e9ecef;
  color: #212529;
  text-decoration: none !important;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active:hover {
  background-color: #dee2e6;
  text-decoration: none !important;
}

/* Visa felmeddelande för dropdown */
.invalid-feedback.d-block {
  display: block !important;
}

/* Modal-specifika h4 och h5 stilar */
.user-form-modal .modal-title {
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
}

.user-form-modal .modal-body h5 {
  font-size: 1rem !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
}
</style>