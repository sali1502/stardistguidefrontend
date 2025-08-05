<!-- components/admin/ProjectChecklistModal.vue - modal för att hantera checklistpunkter för alla roller inom ett projekt -->

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" aria-modal="true"
    role="dialog" :aria-labelledby="modalTitleId" @click.self="handleBackdropClick" @keydown.esc="handleEscape">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content" ref="modalContent">
        <div class="modal-header">
          <h4 class="modal-title text-blue-darkest" :id="modalTitleId">
            <i class="bi bi-check2-square me-2" aria-hidden="true"></i>
            Hantera checklistor - {{ project.name }}
          </h4>
          <button type="button" class="btn-close" @click="handleClose" @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose" aria-label="Stäng modal">
          </button>
        </div>

        <div class="modal-body">
          <!-- Felmeddelande vid problem med API-anrop -->
          <div v-if="error" class="alert alert-danger" role="alert" aria-live="assertive">
            <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
            {{ error }}
            <button type="button" class="btn-close float-end" @click="error = ''"
              aria-label="Stäng felmeddelande"></button>
          </div>

          <!-- Framgångsmeddelande -->
          <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="assertive" aria-atomic="true">
            <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
            {{ successMessage }}
            <button type="button" class="btn-close float-end" @click="successMessage = ''" aria-hidden="true"
              tabindex="-1">
            </button>
          </div>

          <!-- Navigering mellan rollspecifika checklistor -->
          <div class="role-navigation mb-4">
            <ul class="nav nav-tabs nav-fill" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeRole === 'designer' }" @click="activeRole = 'designer'"
                  @keydown="handleTabKeydown" role="tab" :aria-selected="activeRole === 'designer' ? 'true' : 'false'"
                  :aria-controls="`tabpanel-designer`" :id="`tab-designer`" ref="designerTab">
                  <i class="bi bi-palette me-2" aria-hidden="true"></i>
                  Designer
                  <span class="badge bg-blue-medium ms-2">{{ getItemCount('designer') }}</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeRole === 'developer' }"
                  @click="activeRole = 'developer'" @keydown="handleTabKeydown" role="tab"
                  :aria-selected="activeRole === 'developer' ? 'true' : 'false'" :id="`tab-developer`"
                  ref="developerTab">
                  <i class="bi bi-code-slash me-2" aria-hidden="true"></i>
                  Utvecklare
                  <span class="badge bg-blue-medium ms-2">{{ getItemCount('developer') }}</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: activeRole === 'tester' }" @click="activeRole = 'tester'"
                  @keydown="handleTabKeydown" role="tab" :aria-selected="activeRole === 'tester' ? 'true' : 'false'"
                  :aria-controls="`tabpanel-tester`" :id="`tab-tester`" ref="testerTab">
                  <i class="bi bi-bug me-2" aria-hidden="true"></i>
                  Testare
                  <span class="badge bg-blue-medium ms-2">{{ getItemCount('tester') }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Innehåll för vald rollflik -->
          <div class="tab-content">
            <div class="tab-pane active" role="tabpanel" :id="`tabpanel-${activeRole}`"
              :aria-labelledby="`tab-${activeRole}`">

              <!-- Laddningsindikator -->
              <div v-if="loading" class="text-center py-4" role="status" aria-live="polite">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Laddar...</span>
                </div>
                <p class="mt-2 text-muted" aria-hidden="true">Laddar checklista...</p>
              </div>

              <!-- Checklistpunkter för vald roll -->
              <div v-else>
                <!-- Rubrik och knapp för att lägga till ny punkt -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="text-blue-darkest mb-0">
                    {{ getRoleDisplayName(activeRole) }} - Checklistpunkter
                  </h5>
                  <button class="btn btn-outline-primary btn-sm" @click="openAddItemModal" :disabled="loading"
                    :ref="el => setButtonRef(el, `add-item-${activeRole}`)">
                    <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
                    Lägg till punkt
                  </button>
                </div>

                <!-- Lista med befintliga checklistpunkter -->
                <div v-if="getCurrentChecklist()?.items?.length > 0" class="checklist-items">
                  <div v-for="(item, index) in getCurrentChecklist().items" :key="item._id || index"
                    class="checklist-item mb-2">
                    <div class="card">
                      <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1">
                            <h5 class="card-title mb-1 text-blue-darkest">{{ item.title }}</h5>
                            <p class="card-text text-muted small mb-0" v-html="makeLinksClickable(item.content)"></p>
                          </div>
                          <div class="btn-group btn-group-sm ms-3" role="group"
                            :aria-label="`Åtgärder för ${item.title}`">
                            <button class="btn btn-outline-primary" @click="openEditItemModal(item)" :disabled="loading"
                              :aria-label="`Redigera punkt ${item.title}`"
                              :ref="el => setButtonRef(el, `edit-${item._id || index}`)">
                              <i class="bi bi-pencil" aria-hidden="true"></i>
                            </button>
                            <button class="btn btn-delete" @click="confirmDeleteItem(item)" :disabled="loading"
                              :aria-label="`Ta bort punkt ${item.title}`"
                              :ref="el => setButtonRef(el, `delete-${item._id || index}`)">
                              <i class="bi bi-trash" aria-hidden="true"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Meddelande när inga checklistpunkter finns -->
                <div v-else class="text-center py-4">
                  <i class="bi bi-check2-square text-muted" style="font-size: 3rem;" aria-hidden="true"></i>
                  <h5 class="mt-3 text-muted">Inga checklistpunkter</h5>
                  <p class="text-muted">Lägg till den första punkten för {{ getRoleDisplayName(activeRole).toLowerCase()
                  }}</p>
                  <button class="btn btn-outline-primary" @click="openAddItemModal" :disabled="loading"
                    ref="firstAddButton">
                    <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
                    Lägg till första punkten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleClose" @keydown.enter="handleClose"
            @keydown.space.prevent="handleClose" ref="closeButton">
            Stäng
          </button>
        </div>
      </div>
    </div>

    <!-- Modal för att lägga till/redigera checklistpunkt -->
    <ChecklistItemModal v-if="showItemModal" :item="editingItem" :role="activeRole"
      :project-id="project.id || project._id" :is-editing="isEditingItem" :existing-items="getCurrentChecklist().items"
      :return-focus-to="itemModalReturnFocusElement" @save="handleItemSave" @close="closeItemModal" />

    <!-- Modal för att bekräfta borttagning av checklistpunkt -->
    <ChecklistItemDeleteModal v-if="showDeleteModal" :item="itemToDelete" :role="activeRole" @confirm="handleItemDelete"
      @cancel="cancelItemDelete" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { checklistService } from '@/services/checklistService'
import ChecklistItemModal from './ChecklistItemModal.vue'
import ChecklistItemDeleteModal from './ChecklistItemDeleteModal.vue'

// Props från föräldrakomponent
const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  returnFocusTo: {
    type: Object,
    default: null
  }
})

// Events som skickas till föräldrakomponent
const emit = defineEmits(['close'])

// Refs för DOM-element
const modalContent = ref(null)
const closeButton = ref(null)
const designerTab = ref(null)
const developerTab = ref(null)
const testerTab = ref(null)
const firstAddButton = ref(null)

// Element som hade fokus innan modalen öppnades
const previousActiveElement = ref(null)

// Element att återställa fokus till när item-modal stängs
const itemModalReturnFocusElement = ref(null)

// Unik ID för modal-titel (för ARIA)
const modalTitleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`

// Objekt för att hålla referenser till knappar
const buttonRefs = ref({})

// Funktion för att sätta knapp-referenser
const setButtonRef = (el, key) => {
  if (el) {
    buttonRefs.value[key] = el
  }
}

// Aktiv roll som visas i checklisthanteringen
const activeRole = ref('designer')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Checklistdata för alla roller (designer, developer, tester)
const checklists = reactive({
  designer: { items: [] },
  developer: { items: [] },
  tester: { items: [] }
})

// State för modaler (lägg till/redigera och ta bort)
const showItemModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)

// Skapa ny checklistpunkt eller redigera kontrolleras med isEditingItem
const isEditingItem = computed(() => !!editingItem.value)

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

// Hantera tangentbordsnavigering i tabs
const handleTabKeydown = (event) => {
  trapFocus(event)

  const tabs = [designerTab.value, developerTab.value, testerTab.value]
  const currentIndex = tabs.findIndex(tab => tab === event.target)

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextIndex = (currentIndex + 1) % tabs.length
    tabs[nextIndex].focus()
    tabs[nextIndex].click()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
    tabs[prevIndex].focus()
    tabs[prevIndex].click()
  }
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
  if (props.returnFocusTo) {
    props.returnFocusTo.focus()
  } else if (previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
  emit('close')
}

// Funktioner för att öppna och stänga modaler
const openAddItemModal = () => {
  editingItem.value = null
  itemModalReturnFocusElement.value = document.activeElement
  showItemModal.value = true
}

const openEditItemModal = (item) => {
  editingItem.value = { ...item }
  itemModalReturnFocusElement.value = document.activeElement
  showItemModal.value = true
}

const closeItemModal = async () => {
  showItemModal.value = false
  editingItem.value = null

  // Återställ fokus till rätt element
  await nextTick()

  if (!isEditingItem.value && getCurrentChecklist()?.items?.length > 0) {
    // Vid skapande av ny punkt, sätt fokus på första redigera-knappen
    const firstItem = getCurrentChecklist().items[0]
    const firstEditButton = buttonRefs.value[`edit-${firstItem._id || 0}`]
    if (firstEditButton) {
      setTimeout(() => {
        firstEditButton.focus()
      }, 100)
    }
  } else if (itemModalReturnFocusElement.value) {
    // Annars återställ fokus till elementet som öppnade modalen
    setTimeout(() => {
      itemModalReturnFocusElement.value.focus()
    }, 100)
  }
}

const confirmDeleteItem = (item) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const cancelItemDelete = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
}

// Klickbara länkar - tillgänglighetsanpassade
const makeLinksClickable = (text) => {
  if (!text) return ''

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+(?:#[^\s<>"{}|\\^`\[\]]*)?/gi

  return text.replace(urlRegex, (url) => {
    let cleanUrl = url
    let punctuation = ''

    // Hantera interpunktion i slutet av URL:er
    const punctuationMatch = url.match(/([.,!?;]+)$/)
    if (punctuationMatch) {
      cleanUrl = url.slice(0, -punctuationMatch[1].length)
      punctuation = punctuationMatch[1]
    }

    const safeUrl = cleanUrl.replace(/\s/g, '%20')

    try {
      const urlObj = new URL(cleanUrl)
      const domain = urlObj.hostname.replace('www.', '')
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)

      let linkText = domain
      let description = domain

      // Bygg länktext med path-information
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        if (lastPart.length > 1 && !lastPart.includes('.')) {
          let readablePath = lastPart.replace(/-/g, ' ').replace(/_/g, ' ')

          // Klipp av om för långt
          if (readablePath.length > 30) {
            readablePath = readablePath.substring(0, 27) + '...'
          }

          linkText = `${domain} - ${readablePath}`
          description = `${readablePath} på ${domain}`
        }
      }

      return `<a href="${safeUrl}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 title="Öppnar ${description} i nytt fönster">${linkText}</a>${punctuation}`

    } catch (e) {
      const fallbackText = cleanUrl.split('/')[2] || 'Extern länk'
      return `<a href="${safeUrl}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 title="Öppnar extern webbplats i nytt fönster">${fallbackText}</a>${punctuation}`
    }
  })
}

// Översätt rollnamn till svenska för användargränssnittet
const getRoleDisplayName = (role) => {
  const names = {
    designer: 'Designer',
    developer: 'Utvecklare',
    tester: 'Testare'
  }
  return names[role] || role
}

// Hämta checklista för aktuell roll
const getCurrentChecklist = () => {
  return checklists[activeRole.value] || { items: [] }
}

// Räkna antal checklistpunkter för given roll
const getItemCount = (role) => {
  return checklists[role]?.items?.length || 0
}

// Hämta checklistdata från backend för specifik roll
const fetchChecklist = async (role) => {
  loading.value = true
  error.value = ''

  try {
    const result = await checklistService.getChecklist(props.project.id || props.project._id, role)

    if (result.success) {
      // Formatera och spara checklistdata
      checklists[role] = checklistService.formatChecklistForDisplay(result.checklist)
    } else {
      error.value = result.message || `Kunde inte ladda checklista för ${getRoleDisplayName(role).toLowerCase()}`
    }

  } catch (err) {
    error.value = `Kunde inte ladda checklista för ${getRoleDisplayName(role).toLowerCase()}`
  } finally {
    loading.value = false
  }
}

// Spara checklistpunkt (skapa ny eller uppdatera befintlig)
const handleItemSave = async (itemData, callback) => {
  try {
    loading.value = true
    const projectId = props.project.id || props.project._id

    let result

    if (isEditingItem.value) {
      // Uppdatera befintlig checklistpunkt
      result = await checklistService.updateChecklistItem(
        projectId,
        activeRole.value,
        editingItem.value._id || editingItem.value.id,
        itemData
      )
    } else {
      // Skapa ny checklistpunkt
      result = await checklistService.addChecklistItem(projectId, activeRole.value, itemData)
    }

    if (result.success) {
      // Uppdatera lokal data med svar från server
      checklists[activeRole.value] = checklistService.formatChecklistForDisplay(result.checklist)
      successMessage.value = result.message
      closeItemModal()

      // Rensa framgångsmeddelandet automatiskt efter 20 sekunder (WCAG 2.2.1)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
    } else {
      error.value = result.message || 'Kunde inte spara checklistpunkt'
    }

    // Anropa callback med resultatet för felhantering i modal
    const finalResult = result || { success: false, message: 'Inget svar från server' }

    if (callback) {
      callback(finalResult)
    }

  } catch (err) {
    error.value = 'Kunde inte spara checklistpunkt'
    const errorResult = {
      success: false,
      message: error.value,
      error: err
    }

    if (callback) {
      callback(errorResult)
    }
  } finally {
    loading.value = false
  }
}

// Ta bort checklistpunkt från backend och lokal state
const handleItemDelete = async () => {
  if (!itemToDelete.value) return

  try {
    loading.value = true
    const projectId = props.project.id || props.project._id

    const result = await checklistService.removeChecklistItem(
      projectId,
      activeRole.value,
      itemToDelete.value._id || itemToDelete.value.id
    )

    if (result.success) {
      // Uppdatera lokal data med svar från server
      checklists[activeRole.value] = checklistService.formatChecklistForDisplay(result.checklist)
      successMessage.value = result.message

      // Rensa framgångsmeddelandet automatiskt efter 20 sekunder (WCAG 2.2.1)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
    } else {
      error.value = result.message || 'Kunde inte radera checklistpunkt'
    }

    cancelItemDelete()

  } catch (err) {
    error.value = 'Kunde inte radera checklistpunkt'
    cancelItemDelete()
  } finally {
    loading.value = false
  }
}

// Ladda checklistdata för aktuell roll
const loadCurrentRoleData = async () => {
  await fetchChecklist(activeRole.value)
}

// Övervaka rollbyte och ladda data för ny roll
watch(activeRole, loadCurrentRoleData)

// Ladda data för standardroll när komponenten monteras
onMounted(async () => {
  // Spara referens till elementet som hade fokus innan modalen öppnades
  previousActiveElement.value = document.activeElement

  // Lägg till event listener för tangentbord
  document.addEventListener('keydown', handleEscape)

  // Ladda initial data
  await loadCurrentRoleData()

  // Sätt fokus på första tab
  await nextTick()
  setTimeout(() => {
    if (designerTab.value) {
      designerTab.value.focus()
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

/* Styling för rollnavigering */
.role-navigation .nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.role-navigation .nav-link {
  background: none;
  border: none;
  color: #495057;
  font-weight: 500;
  padding: 1rem;
  transition: all 0.2s ease;
}

.role-navigation .nav-link:hover {
  color: #343a40;
  background-color: #f8f9fa;
  border-radius: 8px;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.role-navigation .nav-link:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.role-navigation .nav-link.active {
  color: #1e293b;
  background-color: white;
  border-bottom: 2px solid #1e293b;
  font-weight: 600;
}

.bg-blue-medium {
  background-color: #475569 !important;
  color: white;
}

.text-blue-darkest {
  color: #1e293b !important;
}

.text-blue-dark {
  color: #334155 !important;
}

.text-blue-medium {
  color: #475569 !important;
}

/* Checklistpunkter styling */
.checklist-items {
  max-height: 400px;
  overflow-y: auto;
}

.checklist-item .card {
  border: 1px solid #dee2e6;
  transition: box-shadow 0.2s ease;
}

.checklist-item .card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-delete {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
}

.btn-delete:hover {
  background-color: #1e293b !important;
  border-color: #1e293b !important;
  color: white !important;
}

.btn-delete:focus {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
  box-shadow: 0 0 0 0.2rem rgba(15, 23, 42, 0.5) !important;
}

.btn-delete:active {
  background-color: #0c1426 !important;
  border-color: #0c1426 !important;
  color: white !important;
}

.btn-delete i {
  color: white !important;
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

/* Responsiva anpassningar för mobila enheter */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .role-navigation .nav-link {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .checklist-items {
    max-height: 300px;
  }
}

/* Animation för flikinnehåll */
.tab-pane {
  animation: fadeIn 0.3s ease-in;
}
</style>