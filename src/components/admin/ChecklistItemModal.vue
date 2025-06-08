<!-- components/admin/ChecklistItemModal.vue -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-blue-darkest">
            <i class="bi bi-check2-square me-2"></i>
            {{ isEditing ? 'Redigera' : 'Lägg till' }} checklistpunkt - {{ getRoleDisplayName(role) }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Titel för checklistpunkt -->
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

            <!-- Innehåll/beskrivning av checklistpunkt -->
            <div class="mb-3">
              <label for="content" class="form-label">
                Innehåll <span class="text-danger">*</span>
              </label>
              <textarea id="content" v-model="form.content" class="form-control"
                :class="{ 'is-invalid': hasBeenTouched.content && errors.content }" rows="4"
                placeholder="Beskriv vad som ska göras..." required @blur="hasBeenTouched.content = true"></textarea>
              <div v-if="hasBeenTouched.content && errors.content" class="invalid-feedback">
                {{ errors.content }}
              </div>
              <div class="form-text">
                <i class="bi bi-link-45deg me-1"></i>
                Du kan inkludera hela webbadresser med https:// (t.ex. https://digg.se) som blir automatiskt klickbara
                länkar. Skriv även instruktioner och andra detaljer som {{ getRoleDisplayName(role).toLowerCase() }}
                behöver.
              </div>
            </div>

            <!-- Information om rollen och checklistans syfte -->
            <div class="alert alert-info" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <strong>För {{ getRoleDisplayName(role) }}:</strong> Denna punkt kommer att visas i {{
                getRoleDisplayName(role).toLowerCase() }}ns checklista och kan bockas av när uppgiften är klar.
            </div>

            <!-- Felmeddelande från API vid problem -->
            <div v-if="apiError" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ apiError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Avbryt
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Uppdatera' : 'Lägg till' }} punkt
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props från ProjectChecklistModal.vue (föräldrakomponent)
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
  }
})

// Events som skickas till ProjectChecklistModal.vue (föräldrakomponent)
const emit = defineEmits(['save', 'close'])

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

// Gör URL:er i text klickbara
const makeLinksClickable = (text) => {
  if (!text) return ''
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi
  return text.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[.,;:!?]+$/, '')
    const punctuation = url.slice(cleanUrl.length)
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #0d6efd; text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s ease;" onmouseover="this.style.borderBottomColor='#0d6efd'; this.style.color='#0a58ca'" onmouseout="this.style.borderBottomColor='transparent'; this.style.color='#0d6efd'" onclick="event.stopPropagation(); window.open('${cleanUrl}', '_blank', 'noopener,noreferrer'); return false;" title="${cleanUrl}">Länk</a>${punctuation}`
  })
}

// Översätt rollnamn till svenska för visning
const getRoleDisplayName = (role) => {
  const names = {
    designer: 'Designer',
    developer: 'Utvecklare',
    tester: 'Testare'
  }
  return names[role] || role
}

// Validera att titel är unik inom befintliga checklistpunkter
const validateUniqueTitle = (newTitle, existingItems, excludeId = null) => {
  if (!newTitle || !newTitle.trim()) return true

  const trimmedTitle = newTitle.toLowerCase().trim()

  return !existingItems.some(item =>
    item.title.toLowerCase().trim() === trimmedTitle &&
    (item._id !== excludeId && item.id !== excludeId)
  )
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
    return
  }

  loading.value = true

  try {
    const itemData = {
      title: form.value.title.trim(),
      content: form.value.content.trim()
    }

    const result = await emit('save', itemData)

    // Hantera fel från föräldrakomponent
    if (result && result.success === false) {
      apiError.value = result.message || 'Ett fel uppstod vid sparande'
      if (result.errors) {
        errors.value = { ...errors.value, ...result.errors }
      }
    } else if (result && result.error) {
      apiError.value = result.error
    } else if (result && result.success === true) {
      emit('close')
    }

  } catch (error) {
    // Hantera oväntade fel under formulärhantering
    apiError.value = 'Ett oväntat fel uppstod'
  } finally {
    loading.value = false
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

// Initiera formulär när komponenten laddas
onMounted(() => {
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
  }

  // Rensa alla fel vid start
  errors.value = {}
  apiError.value = ''
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