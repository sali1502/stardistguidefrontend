<!-- components/admin/PostManagement.vue -->

<template>
  <div class="post-management">
    <!-- Sidhuvud med titel och skapaknapp -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="mb-1">
          <i class="bi bi-file-text me-2"></i>
          Inläggshantering
        </h3>
        <p class="text-muted mb-0">
          Skapa, redigera och radera inlägg
        </p>
      </div>
      <button class="btn btn-primary btn-sm d-md-none" @click="openCreateModal" :disabled="postsStore.loading">
        <i class="bi bi-plus-lg me-2"></i>
        Nytt inlägg
      </button>
      <button class="btn btn-primary d-none d-md-block" @click="openCreateModal" :disabled="postsStore.loading">
        <i class="bi bi-plus-lg me-2"></i>
        Skapa inlägg
      </button>
    </div>

    <!-- Felmeddelande från store -->
    <div v-if="postsStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ postsStore.error }}
      <button type="button" class="btn-close float-end" @click="postsStore.clearError"></button>
    </div>

    <!-- Framgångsmeddelande -->
    <div v-if="successMessage" class="alert alert-success" role="alert">
      <i class="bi bi-check-circle-fill me-2"></i>
      {{ successMessage }}
      <button type="button" class="btn-close float-end" @click="successMessage = ''"></button>
    </div>

    <!-- Inläggstabell med responsiv design -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-table me-2"></i>
          Inläggslista
        </h5>
      </div>
      <div class="card-body">
        <!-- Laddningsindikator -->
        <div v-if="postsStore.loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar...</span>
          </div>
          <p class="mt-2 text-muted">Laddar inlägg...</p>
        </div>

        <!-- Inläggstabell för olika skärmstorlekar -->
        <div v-else-if="postsStore.posts.length > 0">
          <!-- Desktop tabell (stora skärmar) -->
          <div class="table-responsive d-none d-lg-block">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Titel</th>
                  <th>Roll</th>
                  <th>Innehåll</th>
                  <th>Skapad</th>
                  <th width="120">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in postsStore.posts" :key="post.id || post._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i :class="getRoleIcon(post.role)" class="me-2"></i>
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
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" @click="openEditModal(post)"
                        :disabled="postsStore.loading" title="Redigera inlägg">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                        title="Ta bort inlägg">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Medium tabell (tablets) -->
          <div class="table-responsive d-none d-md-block d-lg-none">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Titel</th>
                  <th>Roll</th>
                  <th width="120">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in postsStore.posts" :key="post.id || post._id">
                  <td>
                    <div class="d-flex align-items-center">
                      <i :class="getRoleIcon(post.role)" class="me-2"></i>
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
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" @click="openEditModal(post)"
                        :disabled="postsStore.loading" title="Redigera inlägg">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                        title="Ta bort inlägg">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobil kortlayout för små skärmar -->
          <div class="d-md-none">
            <div v-for="post in postsStore.posts" :key="post.id || post._id" class="post-card mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-start flex-grow-1">
                  <i :class="getRoleIcon(post.role)" class="me-3 mt-1"></i>
                  <div class="flex-grow-1">
                    <div class="fw-bold mb-1">{{ post.title }}</div>
                    <span class="badge bg-darkblue" style="font-size: 0.7em;">
                      {{ getRoleDisplayName(post.role) }}
                    </span>
                    <div class="text-muted small mt-2" v-html="makeLinksClickable(truncateContent(post.content, 120))">
                    </div>
                    <div class="text-muted small mt-1">
                      Skapad: {{ formatDate(post.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group">
                  <button class="btn btn-outline-primary" @click="openEditModal(post)" :disabled="postsStore.loading"
                    title="Redigera inlägg">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-delete" @click="confirmDelete(post)" :disabled="postsStore.loading"
                    title="Ta bort inlägg">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tom lista - inga inlägg -->
        <div v-else class="text-center py-4">
          <i class="bi bi-file-text text-muted" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Inga inlägg hittades</h5>
          <p class="text-muted">Skapa ditt första inlägg genom att klicka på "Skapa inlägg"</p>
        </div>
      </div>
    </div>

    <!-- Modal för att skapa/redigera inlägg -->
    <PostFormModal v-if="showModal" :post="editingPost" :is-editing="isEditing" @save="handleSave"
      @close="closeModal" />

    <!-- Modal för att bekräfta borttagning -->
    <PostDeleteModal v-if="showDeleteModal" :post="postToDelete" @confirm="handleDelete" @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const isEditing = computed(() => !!editingPost.value)

// Funktioner för att öppna och stänga modaler
const openCreateModal = () => {
  editingPost.value = null
  showModal.value = true
}

const openEditModal = (post) => {
  editingPost.value = { ...post }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPost.value = null
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
const handleSave = async (postData) => {
  try {
    let result

    // Skapa nytt eller redigera inlägg kontrolleras av isEditing
    if (isEditing.value) {
      result = await postsStore.updatePost(editingPost.value.id || editingPost.value._id, postData)
    } else {
      result = await postsStore.createPost(postData)
    }

    // Hantera framgångsrikt resultat
    if (result && result.success) {
      successMessage.value = result.message || 'Operationen lyckades'
      closeModal()

      // Rensa framgångsmeddelandet efter fem sekunder
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    }

    // Returnera resultatet till modal för felhantering
    return result || { success: false, message: 'Inget svar från server' }

  } catch (error) {
    // Hantera fel och skicka felmeddelande till modal
    return {
      success: false,
      message: 'Ett oväntat fel uppstod',
      error: error
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

      // Rensa meddelandet efter fem sekunder
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    }

    cancelDelete()
  } catch (error) {
    // Stäng modal även vid fel - felmeddelandet hanteras av store
    cancelDelete()
  }
}

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

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill text-darkblue',
    'developer': 'bi bi-code-slash text-darkblue',
    'tester': 'bi bi-bug-fill text-darkblue'
  }
  return icons[role] || 'bi bi-file-text text-darkblue'
}

// Hämta badgeklass för given roll
const getRoleBadgeClass = (role) => {
  const classes = {
    'designer': 'bg-darkblue',
    'developer': 'bg-darkblue',
    'tester': 'bg-darkblue'
  }
  return classes[role] || 'bg-darkblue'
}

// Översätt rollnamn till svenska för visning
const getRoleDisplayName = (role) => {
  return postsStore.getRoleDisplayName(role)
}

// Förkorta innehåll för förhandsvisning i tabeller
const truncateContent = (content, maxLength) => {
  if (!content) return '-'
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
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

.bg-blue-darkest {
  background-color: #0f172a !important;
  color: white;
}

.bg-blue-dark {
  background-color: #1e293b !important;
  color: white;
}

.bg-blue-medium-dark {
  background-color: #334155 !important;
  color: white;
}

.bg-blue-medium {
  background-color: #475569 !important;
  color: white;
}

.text-blue-darkest {
  color: #0f172a !important;
}

.text-blue-dark {
  color: #1e293b !important;
}

.text-blue-medium-dark {
  color: #334155 !important;
}

.text-blue-medium {
  color: #475569 !important;
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
</style>