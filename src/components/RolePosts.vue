<!-- components/RolePosts.vue - -visar rollspecifika inlägg på dashboard -->

<template>
  <div class="role-posts">

    <!-- Laddningsindikator -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Laddar...</span>
      </div>
      <p class="mt-2 text-muted">Laddar inlägg...</p>
    </div>

    <!-- Felmeddelande vid problem -->
    <div v-else-if="error" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Fel: {{ error }}
    </div>

    <!-- Meddelande när inga inlägg finns -->
    <div v-else-if="posts.length === 0" class="text-center py-4">
      <i class="bi bi-file-text text-muted" style="font-size: 3rem;"></i>
      <h4 class="mt-3 text-muted">Inga inlägg hittades</h4>
      <p class="text-muted">Det finns inga inlägg för {{ getRoleDisplayName(userRole) }} just nu.</p>
    </div>

    <!-- Lista med inlägg för användarens roll -->
    <div v-else>
      <article v-for="post in posts" :key="post._id || post.id" class="card mb-3" :aria-label="`Inlägg: ${post.title}`"
        tabindex="0">
        <div class="card-body">
          <div class="d-flex align-items-start">
            <i :class="getRoleIcon(post.role)" class="me-3 mt-1" aria-hidden="true"></i>
            <div class="flex-grow-1">
              <h4 class="card-title mb-2">{{ post.title }}</h4>
              <div class="card-text" v-html="makeLinksClickable(post.content)"></div>
              <div class="mt-3 d-flex justify-content-end align-items-center">
                <time class="text-muted" :datetime="getISODate(post.createdAt)">
                  {{ formatDate(post.createdAt) }}
                </time>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props från föräldrakomponent
const props = defineProps({
  userRole: {
    type: String,
    required: true
  },
  projectId: {
    type: [String, Number],
    default: null
  },
  projectName: {
    type: String,
    default: ''
  }
})

// Reaktiv data för inläggshantering
const posts = ref([])
const loading = ref(true)
const error = ref('')

// Klickbara länkar - tillgänglighetsanpassade
const makeLinksClickable = (text) => {
  if (!text) return ''

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+(?:#[^\s<>"{}|\\^`\[\]]*)?/gi
  const processedUrls = new Set() // Håll reda på bearbetade URL:er

  return text.replace(urlRegex, (url) => {
    let cleanUrl = url
    let punctuation = ''

    // Hantera interpunktion i slutet av URL:er
    const punctuationMatch = url.match(/([.,!?;]+)$/)
    if (punctuationMatch) {
      cleanUrl = url.slice(0, -punctuationMatch[1].length)
      punctuation = punctuationMatch[1]
    }

    // Om vi redan har bearbetat denna URL, returnera den som vanlig text
    if (processedUrls.has(cleanUrl)) {
      return url
    }
    processedUrls.add(cleanUrl)

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

// Hämta ikon för given roll
const getRoleIcon = (role) => {
  const icons = {
    'designer': 'bi bi-palette-fill text-primary',
    'developer': 'bi bi-code-slash text-primary',
    'tester': 'bi bi-bug-fill text-primary'
  }
  return icons[role] || 'bi bi-file-text text-primary'
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

// Formatera datum för visning i användargränssnittet
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Hämta ISO-datum för time element
const getISODate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toISOString()
}

// Hämta inlägg från backend och filtrera baserat på användarens roll
const fetchPosts = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    // Filtrera inlägg baserat på användarens roll
    const allPosts = Array.isArray(data) ? data : []
    posts.value = allPosts.filter(post => post.role === props.userRole)

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Hämta inlägg när komponenten monteras
onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.role-posts {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card:focus {
  outline: 3px solid #334155;
  outline-offset: 2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card:focus-visible {
  outline: 3px solid #334155;
  outline-offset: 2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #000000 !important;
  font-weight: 600;
}

.card-text {
  line-height: 1.6;
  color: #475569;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.bg-primary {
  background-color: #334155 !important;
}

.text-primary {
  color: #334155 !important;
}

/* Responsiv design för mobila enheter */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .d-flex {
    flex-direction: column;
  }

  .me-3 {
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
    text-align: center;
  }
}
</style>