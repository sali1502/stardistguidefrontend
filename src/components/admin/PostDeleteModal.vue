<!-- components/admin/PostDeleteModal.vue - bekräftelsedialog för borttagning av inlägg -->
<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h4 class="modal-title text-slate-darkest">
            Bekräfta borttagning
          </h4>
          <button type="button" class="btn-close" @click="$emit('cancel')"><span
              class="visually-hidden">Stäng</span></button>
        </div>

        <div class="modal-body text-center">
          <i class="bi bi-question-circle text-slate-medium" style="font-size: 3rem;"></i>
          <h5 class="mt-3 mb-3 text-slate-dark">
            Är du säker på att du vill radera inlägget
            <strong class="text-slate-darkest">"{{ post.title }}"</strong>?
          </h5>

          <!-- Information om inlägget som ska raderas -->
          <div class="mt-3 mb-2">
            <div class="d-flex align-items-center justify-content-center mb-1">
              <i :class="getRoleIcon(post.role)" class="me-2"></i>
              <span class="badge bg-slate-dark">
                {{ getRoleDisplayName(post.role) }}
              </span>
            </div>
            <small class="text-muted d-block">
              {{ truncateContent(post.content, 60) }}
            </small>
          </div>
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
// Props från föräldrakomponent
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// Events som skickas till föräldrakomponent
const emit = defineEmits(['confirm', 'cancel'])

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill text-slate-dark',
    'developer': 'bi bi-code-slash text-slate-dark',
    'tester': 'bi bi-bug-fill text-slate-dark'
  }
  return icons[role] || 'bi bi-file-text text-slate-dark'
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

// Förkorta innehåll för förhandsvisning
const truncateContent = (content, maxLength) => {
  if (!content) return '-'
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
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

.bg-slate-dark {
  background-color: #1e293b !important;
  color: white !important;
}

.text-slate-dark {
  color: #1e293b !important;
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

.badge {
  font-size: 0.75em;
}
</style>