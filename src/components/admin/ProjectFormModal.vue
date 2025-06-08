<!-- components/admin/ProjectFormModal.vue -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="isEditing ? 'bi bi-pencil' : 'bi bi-plus-lg'" class="me-2"></i>
            {{ isEditing ? 'Redigera projekt' : 'Skapa nytt projekt' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Projektnamn -->
            <div class="mb-3">
              <label for="projectName" class="form-label">
                Projektnamn <span class="text-danger">*</span>
              </label>
              <input id="projectName" v-model="form.name" type="text" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.name && errors.name }" placeholder="Skriv projektnamn" required
                @blur="hasBeenTouched.name = true" />
              <div v-if="hasBeenTouched.name && errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
              <div class="form-text">
                Projektnamnet används för att identifiera projektet och dess checklistor.
              </div>
            </div>

            <!-- Information om vad som skapas -->
            <div class="alert alert-info">
              <h6>
                <i class="bi bi-info-circle me-2"></i>
                Vad händer när projektet skapas?
              </h6>
              <p class="mb-2 small">När du skapar ett nytt projekt kommer följande att skapas automatiskt:</p>
              <ul class="mb-0 small">
                <li><strong>Checklista för designer</strong> med 3 standardpunkter</li>
                <li><strong>Cheklista för utvecklare</strong> med 3 standardpunkter</li>
                <li><strong>Checklista för testare</strong> med 3 standardpunkter</li>
              </ul>
            </div>

            <!-- Felmeddelande från API -->
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
              {{ isEditing ? 'Uppdatera' : 'Skapa' }} projekt
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
  project: {
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

// Validera formulärfält
const validateForm = () => {
  errors.value = {}

  // Validera projektnamn
  if (!form.value.name.trim()) {
    errors.value.name = 'Projektnamn är obligatoriskt'
  } else if (form.value.name.trim().length < 3) {
    errors.value.name = 'Projektnamn måste vara minst 3 tecken'
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = 'Projektnamn får inte vara längre än 100 tecken'
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

      // Hantera fel via error-egenskap
      if (result.error) {
        apiError.value = result.error
        loading.value = false
        return
      }

      // Hantera fel via message utan success-flagga
      if (result.message && result.success !== true) {
        apiError.value = result.message
        loading.value = false
        return
      }

      // Hantera HTTP-felkoder
      if (result.status >= 400 || result.statusCode >= 400) {
        apiError.value = result.message || 'Ett fel uppstod vid skapande av projekt'
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

// Initiera formulär när komponenten laddas
onMounted(() => {
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