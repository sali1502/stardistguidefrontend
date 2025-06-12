<!-- components/admin/ProjectDeleteModal.vue -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h4 class="modal-title text-blue-darkest">
            Bekräfta borttagning
          </h4>
          <button type="button" class="btn-close" @click="$emit('cancel')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <div class="modal-body text-center">
          <i class="bi bi-question-circle text-blue-medium" style="font-size: 3rem;"></i>
          <h5 class="mt-3 mb-3 text-blue-dark">
            Är du säker på att du vill radera projektet
            <strong class="text-blue-darkest">{{ project.name }}</strong>?
          </h5>
        </div>

        <div class="modal-footer border-0 justify-content-center">
          <button type="button" class="btn btn-slate-outline" @click="$emit('cancel')">
            Avbryt
          </button>
          <button type="button" class="btn btn-danger-muted" @click="$emit('confirm')">
            Radera
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props från föräldrakomponent (ProjectManagement.vue)
const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

// Events som skickas till föräldrakomponent
const emit = defineEmits(['confirm', 'cancel'])
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

.text-blue-darkest {
  color: #1e293b !important;
}

.text-blue-dark {
  color: #334155 !important;
}

.text-blue-medium {
  color: #64748b !important;
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
</style>