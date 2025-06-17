<!-- components/admin/PostManagement.vue - administrationskomponent för att hantera inlägg med CRUD-operationer och responsiv design -->

<template>
  <div class="post-management">
    <!-- Sidhuvud med titel och skapaknapp -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-file-text me-2" aria-hidden="true"></i>
          Inläggshantering
        </h2>
        <p class="text-muted mb-0">
          Skapa, redigera och radera inlägg
        </p>
      </div>
      <button class="btn btn-primary btn-sm d-md-none" @click="openCreateModal" :disabled="postsStore.loading">
        <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
        Nytt inlägg
      </button>
      <button class="btn btn-primary d-none d-md-block" @click="openCreateModal" :disabled="postsStore.loading">
        <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
        Skapa inlägg
      </button>
    </div>

    <!-- Felmeddelande från store -->
    <div v-if="postsStore.error" class="alert alert-danger" role="alert" aria-live="assertive">
      <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
      {{ postsStore.error }}
      <button type="button" class="btn-close float-end" @click="postsStore.clearError"
        aria-label="Stäng felmeddelande"></button>
    </div>

    <!-- Framgångsmeddelande (med stäng-knapp som ignoreras av skärmläsare, försvinner efter 20 sek) -->
    <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="assertive" aria-atomic="true">
      <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
      {{ successMessage }}
      <button type="button" class="btn-close float-end" @click="successMessage = ''" aria-hidden="true" tabindex="-1">
      </button>
    </div>

    <!-- Inläggstabell med responsiv design -->
    <div class="card">
      <div class="card-header">
        <h3 class="mb-0" id="post-table-heading">
          <i class="bi bi-table me-2" aria-hidden="true"></i>
          Inläggslista
        </h3>
      </div>
      <div class="card-body">
        <!-- Laddningsindikator -->
        <div v-if="postsStore.loading" class="text-center py-4" role="status" aria-live="polite">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar...</span>
          </div>
          <p class="mt-2 text-muted" aria-hidden="true">Laddar inlägg...</p>
        </div>

        <!-- Inläggstabell för olika skärmstorlekar -->
        <div v-else-if="postsStore.posts.length > 0">
          <!-- Desktop tabell (stora skärmar) -->
          <div class="table-responsive d-none d-lg-block">
            <table class="table table-hover" role="table" aria-labelledby="post-table-heading">
              <caption class="visually-hidden">
                Tabell som visar alla inlägg med möjlighet att redigera eller ta bort dem
              </caption>
              <thead class="table-light">
                <tr>
                  <th scope="col">Titel</th>
                  <th scope="col">Roll</th>
                  <th scope="col">Innehåll</th>
                  <th scope="col">Skapad</th>
                  <th scope="col" width="120">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in postsStore.posts" :key="post.id || post._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i :class="getRoleIcon(post.role)" class="me-2" aria-hidden="true"></i>
                      <div>
                        <div class="fw-bold">{{ post.title }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-darkblue">
                      {{ getRoleDisplayName(post.role) }}
                    </span>
                  </td>
                  <td>
                    <div class="post-content-preview" v-html="makeLinksClickable(truncateContent(post.content, 100))">
                    </div>
                  </td>
                  <td>
                    <small>{{ formatDate(post.createdAt) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group" :aria-label="`Åtgärder för ${post.title}`">
                      <button class="btn btn-outline-primary" @click="openEditModal(post)"
                        :disabled="postsStore.loading" :aria-label="`Redigera inlägg: ${post.title}`"
                        :ref="el => setButtonRef(el, `edit-${post.id || post._id}`)">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                        <span class="visually-hidden">Redigera</span>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                        :aria-label="`Ta bort inlägg: ${post.title}`"
                        :ref="el => setButtonRef(el, `delete-${post.id || post._id}`)">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                        <span class="visually-hidden">Ta bort</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Medium tabell (tablets) -->
          <div class="table-responsive d-none d-md-block d-lg-none">
            <table class="table table-hover" role="table" aria-labelledby="post-table-heading">
              <caption class="visually-hidden">
                Kompakt tabell som visar inlägg med möjlighet att redigera eller ta bort dem
              </caption>
              <thead class="table-light">
                <tr>
                  <th scope="col">Titel</th>
                  <th scope="col">Roll</th>
                  <th scope="col" width="120">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in postsStore.posts" :key="post.id || post._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i :class="getRoleIcon(post.role)" class="me-2" aria-hidden="true"></i>
                      <div>
                        <div class="fw-bold">{{ post.title }}</div>
                        <div class="text-muted small" v-html="makeLinksClickable(truncateContent(post.content, 80))">
                        </div>
                        <div class="text-muted small">{{ formatDate(post.createdAt) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-darkblue">
                      {{ getRoleDisplayName(post.role) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group" :aria-label="`Åtgärder för ${post.title}`">
                      <button class="btn btn-outline-primary" @click="openEditModal(post)"
                        :disabled="postsStore.loading" :aria-label="`Redigera inlägg: ${post.title}`"
                        :ref="el => setButtonRef(el, `edit-md-${post.id || post._id}`)">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                        <span class="visually-hidden">Redigera</span>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                        :aria-label="`Ta bort inlägg: ${post.title}`"
                        :ref="el => setButtonRef(el, `delete-md-${post.id || post._id}`)">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                        <span class="visually-hidden">Ta bort</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobil kortlayout för små skärmar -->
          <div class="d-md-none" role="list" aria-label="Lista över inlägg">
            <article v-for="post in postsStore.posts" :key="post.id || post._id" class="post-card mb-3" role="listitem"
              :aria-label="`Inlägg: ${post.title}`">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-start flex-grow-1">
                  <i :class="getRoleIcon(post.role)" class="me-3 mt-1" aria-hidden="true"></i>
                  <div class="flex-grow-1">
                    <h4 class="fw-bold mb-1 h6">{{ post.title }}</h4>
                    <span class="badge bg-darkblue" style="font-size: 0.7em;">
                      <span class="visually-hidden">Roll: </span>{{ getRoleDisplayName(post.role) }}
                    </span>
                    <div class="text-muted small mt-2" v-html="makeLinksClickable(truncateContent(post.content, 120))">
                    </div>
                    <div class="text-muted small mt-1">
                      <span class="visually-hidden">Datum: </span>Skapad: {{ formatDate(post.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group" :aria-label="`Åtgärder för ${post.title}`">
                  <button class="btn btn-outline-primary" @click="openEditModal(post)" :disabled="postsStore.loading"
                    :aria-label="`Redigera inlägg: ${post.title}`"
                    :ref="el => setButtonRef(el, `edit-mob-${post.id || post._id}`)">
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                    <span class="visually-hidden">Redigera</span>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                    :aria-label="`Ta bort inlägg: ${post.title}`"
                    :ref="el => setButtonRef(el, `delete-mob-${post.id || post._id}`)">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                    <span class="visually-hidden">Ta bort</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Tom lista - inga inlägg -->
        <div v-else class="text-center py-4" role="status" aria-live="polite">
          <i class="bi bi-file-text text-muted" style="font-size: 3rem;" aria-hidden="true"></i>
          <h5 class="mt-3 text-muted">Inga inlägg hittades</h5>
          <p class="text-muted">Skapa ditt första inlägg genom att klicka på "Skapa inlägg"</p>
        </div>
      </div>
    </div>

    <!-- Modal för att skapa/redigera inlägg -->
    <PostFormModal v-if="showModal" :post="editingPost" :is-editing="isEditing"
      :return-focus-to="modalReturnFocusElement" @save="handleSave" @close="closeModal" />

    <!-- Modal för att bekräfta borttagning -->
    <PostDeleteModal v-if="showDeleteModal" :post="postToDelete" @confirm="handleDelete" @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { usePostsStore } from '@/stores/posts'
import PostFormModal from './PostFormModal.vue'
import PostDeleteModal from './PostDeleteModal.vue'

const postsStore = usePostsStore()

// Reaktiv data för modalhantering
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingPost = ref(null)
const postToDelete = ref(null)
const successMessage = ref('')
const modalReturnFocusElement = ref(null)

// Objekt för att hålla referenser till knappar
const buttonRefs = ref({})

// Funktion för att sätta button referenser
const setButtonRef = (el, key) => {
  if (el) {
    buttonRefs.value[key] = el
  }
}

const isEditing = computed(() => !!editingPost.value)

// Funktioner för att öppna och stänga modaler
const openCreateModal = () => {
  editingPost.value = null
  modalReturnFocusElement.value = document.activeElement
  showModal.value = true
}

const openEditModal = (post) => {
  editingPost.value = { ...post }
  modalReturnFocusElement.value = document.activeElement
  showModal.value = true
}

const closeModal = async () => {
  showModal.value = false
  editingPost.value = null

  // Återställ fokus till rätt element
  await nextTick()

  if (!isEditing.value && postsStore.posts.length > 0) {
    // Om vi skapade ett nytt inlägg, sätt fokus på första redigera-knappen
    const firstPost = postsStore.posts[0]
    const firstEditButton = buttonRefs.value[`edit-${firstPost.id || firstPost._id}`]
    if (firstEditButton) {
      setTimeout(() => {
        firstEditButton.focus()
      }, 100)
    }
  } else if (modalReturnFocusElement.value) {
    // Annars återställ fokus till elementet som öppnade modalen
    setTimeout(() => {
      modalReturnFocusElement.value.focus()
    }, 100)
  }
}

const confirmDelete = (post) => {
  postToDelete.value = post
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  postToDelete.value = null
}

// Hantera spara inlägg (skapa eller uppdatera)
const handleSave = async (postData, callback) => {
  try {
    let result

    // Skapa nytt eller redigera inlägg styrs av isEditing
    if (isEditing.value) {
      result = await postsStore.updatePost(editingPost.value.id || editingPost.value._id, postData)
    } else {
      result = await postsStore.createPost(postData)
    }

    // Hantera framgångsrikt resultat
    if (result && result.success === true) {
      successMessage.value = result.message || 'Operationen lyckades'
      closeModal()

      // Rensa framgångsmeddelandet efter 20 sekunder (WCAG 2.2.1 standard)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
    }

    // Anropa callback med resultatet för felhantering i modal
    const finalResult = result || { success: false, message: 'Inget svar från server' }

    if (callback) {
      callback(finalResult)
    }

  } catch (error) {
    // Hantera fel och skicka strukturerat felmeddelande till callback
    const errorResult = {
      success: false,
      message: 'Ett oväntat fel uppstod',
      error: error
    }

    if (callback) {
      callback(errorResult)
    }
  }
}

// Hantera borttagning av inlägg
const handleDelete = async () => {
  if (!postToDelete.value) return

  try {
    const result = await postsStore.deletePost(postToDelete.value.id || postToDelete.value._id)

    // Visa framgångsmeddelande om borttagningen lyckades
    if (result && result.success) {
      successMessage.value = result.message

      // Rensa meddelandet efter 20 sekunder (WCAG 2.2.1 standard)
      setTimeout(() => {
        successMessage.value = ''
      }, 20000)
    }

    cancelDelete()
  } catch (error) {
    // Stäng modal även vid fel - felmeddelandet hanteras av store
    cancelDelete()
  }
}

// Klickbara länkar - tillgänglinghetsanpassade
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

// Funktion som respekterar hela URLs
const truncateContent = (content, maxLength) => {
  if (!content) return '-'
  if (content.length <= maxLength) return content

  // Hitta alla URLs i texten
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  const urls = content.match(urlRegex) || []

  // Om texten innehåller URLs, var försiktig med trunkering
  if (urls.length > 0) {
    // Hitta position för första URL
    const firstUrlStart = content.search(urlRegex)

    if (firstUrlStart < maxLength) {
      // URL:en börjar före trunkerings-punkten
      const firstUrl = urls[0]
      const urlEnd = firstUrlStart + firstUrl.length

      if (urlEnd > maxLength) {
        // URL:en skulle klippas av - trunkera före URL:en istället
        if (firstUrlStart > 20) {
          return content.substring(0, firstUrlStart - 1).trim() + '...'
        } else {
          // URL:en startar tidigt - behåll hela URL:en även om det blir längre
          return content.substring(0, urlEnd) + (content.length > urlEnd ? '...' : '')
        }
      }
    }
  }

  // Standard-trunkering om inga URLs påverkas
  return content.substring(0, maxLength) + '...'
}

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill text-darkblue',
    'developer': 'bi bi-code-slash text-darkblue',
    'tester': 'bi bi-bug-fill text-darkblue'
  }
  return icons[role] || 'bi bi-file-text text-darkblue'
}

// Översätt rollnamn till svenska för visning
const getRoleDisplayName = (role) => {
  return postsStore.getRoleDisplayName(role)
}

// Formatera datum för visning i användargränssnittet
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Hämta inlägg när komponenten laddas
onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped>
.post-management {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.alert {
  border: none;
  border-radius: 8px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.post-content-preview {
  max-width: 300px;
  word-wrap: break-word;
}

.bg-darkblue {
  background-color: #0f172a !important;
  color: white !important;
}

.text-darkblue {
  color: #0f172a !important;
}

.post-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Förbättrad fokusindikator för tangentbordsnavigering */
.btn:focus,
.btn-close:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Responsiva justeringar för olika skärmstorlekar */
@media (max-width: 991px) {
  .post-card i {
    font-size: 1.1rem;
  }
}

@media (max-width: 575px) {
  .post-card i {
    font-size: 1.25rem;
  }

  .btn-group-sm .btn {
    padding: 0.375rem 0.5rem;
  }
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

/* Fix för små skärmar - förbättra responsivitet */
@media (max-width: 400px) {
  .post-card {
    padding: 0.75rem;
  }

  /* Direkt övergång till vertikal layout vid 400px för att undvika hopp */
  .post-card .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .post-card .btn-group {
    align-self: flex-end;
    margin-top: 0.5rem;
    min-width: 80px;
    flex-shrink: 0;
  }

  .post-card .flex-grow-1 {
    min-width: 0;
    /* Tillåt content att krympa */
    word-break: break-word;
  }

  .post-card .fw-bold {
    line-height: 1.2;
    word-break: break-word;
    hyphens: auto;
  }
}

/* Förbättra hantering av långa titlar på alla skärmstorlekar */
.post-card .fw-bold {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  line-height: 1.3;
}
</style>