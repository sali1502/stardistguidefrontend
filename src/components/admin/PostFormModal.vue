<!-- components/admin/PostFormModal.vue -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2"></i>
            {{ isEditing ? 'Redigera inlägg' : 'Skapa nytt inlägg' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Titel för inlägget -->
            <div class="mb-3">
              <label for="title" class="form-label">
                Titel <span class="text-danger">*</span>
              </label>
              <input id="title" v-model="form.title" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.title && errors.title }" placeholder="Skriv en titel" required
                @blur="hasBeenTouched.title = true" />
              <div v-if="hasBeenTouched.title && errors.title" class="invalid-feedback">
                {{ errors.title }}
              </div>
            </div>

            <!-- Rollval (följer backend enum) -->
            <div class="mb-3">
              <label for="role" class="form-label">
                Roll <span class="text-danger">*</span>
              </label>
              <select id="role" v-model="form.role" class="form-select"
                :class="{ 'is-invalid': hasBeenTouched.role && errors.role }" required
                @blur="hasBeenTouched.role = true" @change="hasBeenTouched.role = true">
                <option value="">Välj roll</option>
                <option value="designer">Designer</option>
                <option value="developer">Utvecklare</option>
                <option value="tester">Testare</option>
              </select>
              <div v-if="hasBeenTouched.role && errors.role" class="invalid-feedback">
                {{ errors.role }}
              </div>
              <div class="form-text">
                <i class="bi bi-info-circle me-1"></i>
                Admins kan se alla inlägg oavsett roll.
              </div>
            </div>

            <!-- Innehåll för inlägget -->
            <div class="mb-3">
              <label for="content" class="form-label">
                Innehåll <span class="text-danger">*</span>
              </label>
              <textarea id="content" v-model="form.content" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.content && errors.content }" rows="3"
                placeholder="Skriv ditt innehåll här..." required @blur="hasBeenTouched.content = true"></textarea>
              <div class="form-text">
                <i class="bi bi-link-45deg me-1"></i>
                Skriv hela webbadresser med https:// (t.ex. https://digg.se) så blir de automatiskt klickbara länkar som
                öppnas i nytt fönster.
              </div>
              <div v-if="hasBeenTouched.content && errors.content" class="invalid-feedback">
                {{ errors.content }}
              </div>
            </div>

            <!-- Rollbeskrivning (visas när roll är vald) -->
            <div v-if="form.role" class="alert alert-info py-2">
              <div class="d-flex align-items-center">
                <i :class="getRoleIcon(form.role)" class="me-2"></i>
                <small>{{ getRoleDescription(form.role) }}</small>
              </div>
            </div>

            <!-- Felmeddelande från API vid problem -->
            <div v-if="apiError" class="alert alert-danger py-2">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <small>{{ apiError }}</small>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')" :disabled="loading">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} inlägg
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
  post: {
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
    return
  }

  loading.value = true

  try {
    const postData = {
      title: form.value.title.trim(),
      role: form.value.role,
      content: form.value.content.trim()
    }

    const result = await emit('save', postData)

    // Hantera fel från föräldrakomponent
    if (result && result.success === false) {
      // Backend returnerar fel
      apiError.value = result.message || 'Ett fel uppstod'

      if (result.errors) {
        errors.value = { ...errors.value, ...result.errors }
      }
    } else if (result && result.error) {
      // API-fel struktur (från api.js)
      apiError.value = result.error

      // Om det finns fältspecifika fel
      if (result.field && result.error) {
        errors.value = {
          [result.field]: result.error
        }
      }
    } else if (result && result.success === true) {
      // Stäng modal vid framgång
      emit('close')
    }
  } catch (error) {
    // Hantera oväntade fel under formulärhantering
    apiError.value = 'Ett oväntat fel uppstod'
  } finally {
    loading.value = false
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
    // Vid redigering markera alla fält som redan berörda.
    hasBeenTouched.value = {
      title: true,
      role: true,
      content: true
    }
  }
}, { immediate: true })

// Initiera formulär när komponenten laddas
onMounted(() => {
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

.modal-dialog {
  max-width: 500px;
}

.form-control[rows] {
  resize: vertical;
  min-height: 80px;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-text {
  color: #6c757d;
  font-size: 0.8em;
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