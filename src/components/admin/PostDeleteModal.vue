<!-- components/admin/PostDeleteModal.vue - bekräftelsedialog för borttagning av inlägg -->

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
          <h5 class="mt-3 mb-3 text-slate-dark modal-description" :id="modalDescriptionId">
            Är du säker på att du vill radera inlägget
            <strong class="text-slate-darkest">"{{ post.title }}"</strong>?
          </h5>

          <!-- Information om inlägget som ska raderas -->
          <div class="mt-3 mb-2" role="region" aria-label="Information om inlägg som ska raderas">
            <div class="d-flex align-items-center justify-content-center mb-1">
              <i :class="getRoleIcon(post.role)" class="me-2" aria-hidden="true"></i>
              <span class="badge bg-slate-dark">
                <span class="visually-hidden">Roll: </span>{{ getRoleDisplayName(post.role) }}
              </span>
            </div>
            <small class="text-muted d-block content-preview">
              <span class="visually-hidden">Innehåll: </span>{{ truncateContent(post.content, 60) }}
            </small>
          </div>

          <div class="alert alert-warning" role="region" aria-label="Varning">
            <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
            <span class="small">Detta kan inte ångras. Inlägget kommer att tas bort permanent.</span>
          </div>
        </div>

        <div class="modal-footer border-0 justify-content-center">
          <button type="button" ref="cancelButton" class="btn btn-slate-outline" @click="$emit('cancel')">
            Avbryt
          </button>
          <button type="button" class="btn btn-danger-muted" @click="$emit('confirm')"
            aria-label="Bekräfta radering av inlägg">
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
  post: {
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

  // Speciell hantering för URL:er
  const urlRegex = /https?:\/\/[^\s]+/g
  const urls = content.match(urlRegex)

  if (urls && urls.length > 0) {
    // Om innehållet börjar med en URL, visa bara domänen
    if (content.trim().startsWith(urls[0])) {
      try {
        const url = new URL(urls[0])
        const domain = url.hostname.replace('www.', '')
        const remainingText = content.replace(urls[0], '').trim()

        if (remainingText) {
          return `${domain} ${remainingText.substring(0, 20)}...`
        } else {
          return domain
        }
      } catch (e) {
        // Om URL parsing misslyckas, använd standard trunkering
      }
    }
  }

  // Standard trunkering
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
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

/* Hantera långa titlar och text */
.modal-description {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.modal-description strong {
  display: inline-block;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

/* Hantera innehållsförhandsvisning med långa länkar */
.content-preview {
  display: block;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  /* Tillåter brytning var som helst i långa URL:er */
  word-break: break-all;
  /* Bryter långa ord/länkar */
  max-width: 250px;
  /* Anpassat för modal-sm */
  margin: 0 auto;
  hyphens: auto;
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

.badge {
  font-size: 0.75em;
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