<!-- components/admin/ChecklistItemDeleteModal.vue - bekräftelsedialog för borttagning av checklistpunkter -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.8);" aria-modal="true"
    role="alertdialog" :aria-labelledby="modalTitleId" :aria-describedby="modalDescriptionId"
    @click.self="$emit('cancel')" @keydown.escape="$emit('cancel')">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title text-blue-darkest" :id="modalTitleId">
            Bekräfta borttagning
          </h5>
          <button type="button" class="btn-close" @click="$emit('cancel')" aria-label="Stäng dialog">
          </button>
        </div>

        <div class="modal-body text-center">
          <i class="bi bi-question-circle text-blue-medium" style="font-size: 3rem;" aria-hidden="true"></i>
          <h6 class="mt-3 mb-3 text-blue-dark" :id="modalDescriptionId">
            Är du säker på att du vill radera checklistpunkten
            <strong class="text-blue-darkest">"{{ item.title }}"</strong>?
          </h6>
          <div class="text-muted small" role="region" aria-label="Information">
            <i class="bi bi-info-circle me-1" aria-hidden="true"></i>
            För {{ getRoleDisplayName(role) }} - denna åtgärd kan inte ångras.
          </div>
        </div>

        <div class="modal-footer border-0 justify-content-center">
          <button type="button" ref="cancelButton" class="btn btn-slate-outline" @click="$emit('cancel')">
            Avbryt
          </button>
          <button type="button" class="btn btn-danger-muted" @click="$emit('confirm')"
            aria-label="Bekräfta radering av checklistpunkt">
            Radera
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// Props från föräldrakomponent
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  role: {
    type: String,
    required: true
  }
})

// Events som skickas till föräldrakomponent
const emit = defineEmits(['confirm', 'cancel'])

// Ref för avbryt-knappen
const cancelButton = ref(null)

// Unika ID:n för ARIA
const modalTitleId = `delete-modal-title-${Math.random().toString(36).substr(2, 9)}`
const modalDescriptionId = `delete-modal-desc-${Math.random().toString(36).substr(2, 9)}`

// Översätt rollnamn till svenska för visning i användargränssnittet
const getRoleDisplayName = (role) => {
  const names = {
    designer: 'Designer',
    developer: 'Utvecklare',
    tester: 'Testare'
  }
  return names[role] || role
}

// Sätt fokus på avbryt-knappen när modal öppnas
onMounted(async () => {
  await nextTick()
  if (cancelButton.value) {
    cancelButton.value.focus()
  }
})
</script>

<style scoped>
.modal {
  animation: fadeIn 0.15s ease-out;
  z-index: 1070;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-header {
  padding-bottom: 0;
}

.modal-footer {
  padding-top: 0;
}

.text-blue-darkest {
  color: #1e293b !important;
}

.text-blue-dark {
  color: #334155 !important;
}

.text-blue-medium {
  color: #64748b !important;
}

/* Förbättrad fokusindikator för tangentbordsnavigering */
.btn:focus,
.btn-close:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.btn-slate-outline {
  background: transparent;
  border: 1px solid #64748b;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-slate-outline:hover {
  background: #64748b;
  border-color: #64748b;
  color: white;
}

.btn-slate-outline:active,
.btn-slate-outline:focus {
  background: #64748b;
  border-color: #64748b;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(100, 116, 139, 0.25);
}

.btn-danger-muted {
  background: #3b4c6b;
  border: 1px solid #3b4c6b;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-danger-muted:hover {
  background: #475569;
  border-color: #475569;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 76, 107, 0.3);
}

.btn-danger-muted:active,
.btn-danger-muted:focus {
  background: #475569;
  border-color: #475569;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(59, 76, 107, 0.25);
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
</style>
