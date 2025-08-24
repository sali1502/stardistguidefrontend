<!-- components/admin/ProjectDeleteModal.vue - Bekräftelsedialog för borttagning av projekt -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true"
    role="alertdialog" :aria-labelledby="modalTitleId" :aria-describedby="modalDescriptionId"
    @click.self="$emit('cancel')" @keydown.escape="$emit('cancel')">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h4 class="modal-title text-slate-darkest" :id="modalTitleId">
            Bekräfta borttagning
          </h4>
          <button type="button" class="btn-close" @click="$emit('cancel')" aria-label="Stäng dialog">
          </button>
        </div>

        <div class="modal-body text-center">
          <i class="bi bi-question-circle text-slate-medium" style="font-size: 3rem;" aria-hidden="true"></i>
          <h5 class="mt-3 mb-3 text-slate-dark" :id="modalDescriptionId">
            Är du säker på att du vill radera projektet
            <strong class="text-slate-darkest">{{ project.name }}</strong>?
          </h5>

          <div class="alert alert-warning" role="region" aria-label="Varning">
            <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
            <span class="small">Detta kan inte ångras. Projektets data och alla checklistor kommer att tas bort
              permanent.</span>
          </div>
        </div>

        <div class="modal-footer border-0 justify-content-center">
          <button type="button" ref="cancelButton" class="btn btn-slate-outline" @click="$emit('cancel')">
            Avbryt
          </button>
          <button type="button" class="btn btn-danger-muted" @click="$emit('confirm')"
            aria-label="Bekräfta radering av projekt">
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
  project: {
    type: Object,
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

.text-slate-darkest {
  color: #0f172a !important;
}

.text-slate-dark {
  color: #1e293b !important;
}

.text-slate-medium {
  color: #475569 !important;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffecb5;
  color: #664d03;
  border: none;
  border-radius: 6px;
}

/* Fokusindikator för tangentbordsnavigering */
.btn:focus,
.btn-close:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.btn-slate-outline {
  background: transparent;
  border: 1px solid #475569;
  color: #475569;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-slate-outline:hover {
  background: #475569;
  border-color: #475569;
  color: white;
}

.btn-slate-outline:active,
.btn-slate-outline:focus {
  background: #475569;
  border-color: #475569;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(71, 85, 105, 0.25);
}

.btn-danger-muted {
  background: #613232;
  border: 1px solid #613232;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-danger-muted:hover {
  background: #743d3d;
  border-color: #743d3d;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(97, 50, 50, 0.3);
}

.btn-danger-muted:active,
.btn-danger-muted:focus {
  background: #743d3d;
  border-color: #743d3d;
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(97, 50, 50, 0.25);
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