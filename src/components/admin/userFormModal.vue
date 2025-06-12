<!-- components/admin/UserFormModal.vue -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2"></i>
            {{ isEditing ? 'Redigera användare' : 'Skapa ny användare' }}
          </h4>
          <button type="button" class="btn-close" @click="$emit('close')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Användarnamn -->
            <div class="mb-3">
              <label for="username" class="form-label">
                Användarnamn <span class="text-danger">*</span>
              </label>
              <input id="username" v-model="form.username" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.username && errors.username }" placeholder="Skriv användarnamn"
                required @blur="hasBeenTouched.username = true" />
              <div v-if="hasBeenTouched.username && errors.username" class="invalid-feedback">
                {{ errors.username }}
              </div>
            </div>

            <!-- Rollval för användaren -->
            <div class="mb-3">
              <label for="role" class="form-label">
                Roll <span class="text-danger">*</span>
              </label>
              <select id="role" v-model="form.role" class="form-select"
                :class="{ 'is-invalid': hasBeenTouched.role && errors.role }" required
                @blur="hasBeenTouched.role = true" @change="hasBeenTouched.role = true">
                <option value="">Välj roll</option>
                <option value="admin">Administratör</option>
                <option value="designer">Designer</option>
                <option value="developer">Utvecklare</option>
                <option value="tester">Testare</option>
              </select>
              <div v-if="hasBeenTouched.role && errors.role" class="invalid-feedback">
                {{ errors.role }}
              </div>
            </div>

            <!-- Lösenordsfält med visa/dölj-funktionalitet -->
            <div class="mb-3">
              <label for="password" class="form-label">
                {{ isEditing ? 'Nytt lösenord (lämna tomt för att behålla)' : 'Lösenord' }}
                <span v-if="!isEditing" class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                  class="form-control" :class="{ 'is-invalid': hasBeenTouched.password && errors.password }"
                  placeholder="Skriv lösenord (minst 6 tecken)" :required="!isEditing"
                  @blur="hasBeenTouched.password = true" />
                <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword"
                  :title="showPassword ? 'Dölj lösenord' : 'Visa lösenord'">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div v-if="hasBeenTouched.password && errors.password" class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>

            <!-- Beskrivning av vald roll -->
            <div v-if="form.role" class="alert alert-info">
              <h5>
                <i :class="getRoleIcon(form.role)" class="me-2"></i>
                {{ getRoleDisplayName(form.role) }}
              </h5>
              <p class="mb-0 small">{{ getRoleDescription(form.role) }}</p>
            </div>

            <!-- Felmeddelande från API vid problem -->
            <div v-if="apiError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ apiError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')" :disabled="loading">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} användare
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

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
        return
      }

      // Hantera fel via erroregenskap
      if (result.error) {
        apiError.value = result.error
        loading.value = false
        return
      }

      // Hantera fel via message utan successflagga
      if (result.message && result.success !== true) {
        apiError.value = result.message
        loading.value = false
        return
      }

      // Hantera HTTP-felkoder
      if (result.status >= 400 || result.statusCode >= 400) {
        apiError.value = result.message || 'Ett fel uppstod vid skapande av användare'
        loading.value = false
        return
      }

      // Framgång - stäng modal
      loading.value = false
      emit('close')
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

// Initiera formulär när komponenten laddas
onMounted(() => {
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