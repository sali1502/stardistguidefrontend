<!-- components/admin/AdminOverview.vue -->

<template>
  <div class="admin-overview">
    <!-- Felmeddelande vid problem med datainhämtning -->
    <div v-if="errorMessage" class="alert alert-warning mb-4" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ errorMessage }}
    </div>

    <!-- Statistikkort med navigeringsfunktionalitet -->
    <div class="row g-3 justify-content-center">
      <!-- Användarstatistik -->
      <div class="col-md-3 col-lg-3">
        <div class="card stat-card clickable-card" @click="navigateToUsers">
          <div class="card-body text-center">
            <i class="bi bi-people stat-icon"></i>
            <h3 class="stat-number">
              <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>{{ stats.users.total }}</span>
            </h3>
            <p class="stat-label">Användare</p>
            <small class="text-muted mt-1">Klicka för att hantera</small>
          </div>
        </div>
      </div>

      <!-- Projektstatistik -->
      <div class="col-md-3 col-lg-3">
        <div class="card stat-card clickable-card" @click="navigateToProjects">
          <div class="card-body text-center">
            <i class="bi bi-folder stat-icon"></i>
            <h3 class="stat-number">
              <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>{{ stats.projects.total }}</span>
            </h3>
            <p class="stat-label">Totalt projekt</p>
            <small class="text-muted mt-1">Klicka för att hantera</small>
          </div>
        </div>
      </div>

      <!-- Inläggsstatistik -->
      <div class="col-md-3 col-lg-3">
        <div class="card stat-card clickable-card" @click="navigateToPosts">
          <div class="card-body text-center">
            <i class="bi bi-file-text stat-icon"></i>
            <h3 class="stat-number">
              <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
              <span v-else>{{ stats.posts.total }}</span>
            </h3>
            <p class="stat-label">Totalt inlägg</p>
            <small class="text-muted mt-1">Klicka för att hantera</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Snabblänkar för rollbaserade dashboards -->
    <div class="row mt-5">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h2 class="h5 mb-0">
              <i class="bi bi-speedometer2 me-2"></i>
              Rollbaserade dashboards
            </h2>
            <small class="text-muted">Få snabb överblick över olika rollers arbetsflöden</small>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <!-- Designer Dashboard -->
              <div class="col-md-4">
                <div class="role-card designer-card" @click="navigateToRole('designer')">
                  <div class="role-card-body">
                    <div class="role-header">
                      <i class="bi bi-palette-fill role-icon"></i>
                      <h3 class="role-title">Designer</h3>
                    </div>
                    <p class="role-description">
                      Designspecifika checklistor och uppgifter
                    </p>
                    <div class="role-actions">
                      <span class="action-text">
                        <i class="bi bi-arrow-right me-1"></i>
                        Visa dashboard
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Utvecklare Dashboard -->
              <div class="col-md-4">
                <div class="role-card developer-card" @click="navigateToRole('developer')">
                  <div class="role-card-body">
                    <div class="role-header">
                      <i class="bi bi-code-slash role-icon"></i>
                      <h3 class="role-title">Utvecklare</h3>
                    </div>
                    <p class="role-description">
                      Utvecklingsuppgifter och kod-relaterade checklistor
                    </p>
                    <div class="role-actions">
                      <span class="action-text">
                        <i class="bi bi-arrow-right me-1"></i>
                        Visa dashboard
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Testare Dashboard -->
              <div class="col-md-4">
                <div class="role-card tester-card" @click="navigateToRole('tester')">
                  <div class="role-card-body">
                    <div class="role-header">
                      <i class="bi bi-bug-fill role-icon"></i>
                      <h3 class="role-title">Testare</h3>
                    </div>
                    <p class="role-description">
                      Testspecifika checklistor och kvalitetskontroll
                    </p>
                    <div class="role-actions">
                      <span class="action-text">
                        <i class="bi bi-arrow-right me-1"></i>
                        Visa dashboard
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Router för navigation
const router = useRouter()

// API-konfiguration för backendanslutning
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Hämta autentiseringstoken från localStorage eller sessionStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

// Generell funktion för autentiserade API-anrop
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)

  if (!response.ok) {
    throw new Error(`HTTP fel! Status: ${response.status}`)
  }

  return response.json()
}

// Testa anslutning till backendserver
const testConnection = async () => {
  try {
    await fetchWithAuth('/users')
    return true
  } catch (error) {
    return false
  }
}

// Events för navigering till olika adminsektioner
const emit = defineEmits(['navigate'])

// Navigeringsfunktioner för administratörsgränssnittet
const navigateToUsers = () => {
  emit('navigate', 'users')
}

const navigateToProjects = () => {
  emit('navigate', 'projects')
}

const navigateToPosts = () => {
  emit('navigate', 'posts')
}

// Navigeringsfunktioner för rollbaserade dashboards
const navigateToRole = (role) => {
  const roleRoutes = {
    'designer': '/dashboard/designer',
    'developer': '/dashboard/developer',
    'tester': '/dashboard/tester'
  }

  if (roleRoutes[role]) {
    router.push(roleRoutes[role])
  }
}

const navigateToStatus = () => {
  router.push('/status')
}

// Reaktiv data för statistikvisning
const stats = ref({
  users: {
    total: 0
  },
  projects: {
    total: 0
  },
  posts: {
    total: 0
  }
})

const isLoading = ref(true)
const errorMessage = ref('')

// Hämta och beräkna statistik från befintliga API-slutpunkter
const loadStats = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Kontrollera serveranslutning
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error('Kan inte ansluta till servern')
    }

    // Hämta data från alla slutpunkter parallellt för bättre prestanda
    const [users, projects, posts] = await Promise.all([
      fetchWithAuth('/users').catch(() => ({ length: 0 })),
      fetchWithAuth('/projects').catch(() => []),
      fetchWithAuth('/posts').catch(() => [])
    ])

    // Beräkna statistik baserat på hämtad data
    stats.value = {
      users: {
        total: Array.isArray(users) ? users.length : (users.length || 0)
      },
      projects: {
        total: Array.isArray(projects) ? projects.length : 0
      },
      posts: {
        total: Array.isArray(posts) ? posts.length : 0
      }
    }

  } catch (error) {
    errorMessage.value = `Kunde inte ladda statistik: ${error.message}`

    // Fallback-data vid fel för att undvika tomma kort
    stats.value = {
      users: { total: '—' },
      projects: { total: '—' },
      posts: { total: '—' }
    }
  } finally {
    isLoading.value = false
  }
}

// Ladda statistik när komponenten monteras
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.admin-overview {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.15);
}

/* Styling för statistikkort */
.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 4px solid #334155;
}

/* Interaktiva kort som kan klickas på */
.clickable-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(30, 41, 59, 0.2);
  border-left-color: #1e293b;
}

.clickable-card:hover .stat-icon {
  color: #1e293b;
  transform: scale(1.1);
}

.clickable-card:hover .stat-number {
  color: #1e293b;
}

.clickable-card:active {
  transform: translateY(-2px);
}

/* Styling för statistikikoner */
.stat-icon {
  font-size: 2.5rem;
  color: #334155;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

/* Styling för statistiksiffror */
.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
}

/* Styling för statistiketiketter */
.stat-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Kort för roller - styling */
.role-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: currentColor;
}

.role-card-body {
  padding: 1.5rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.role-header {
  margin-bottom: 1rem;
}

.role-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  display: block;
  color: #334155;
  transition: all 0.3s ease;
}

.role-card:hover .role-icon {
  color: #1e293b;
  transform: scale(1.05);
}

.role-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.role-description {
  color: #334155;
  font-size: 0.875rem;
  margin: 1rem 0;
  flex-grow: 1;
}

.role-actions {
  margin-top: auto;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.role-card:hover .action-text {
  opacity: 1;
}

.designer-card {
  border-color: #e2e8f0;
  color: #1e293b;
}

.designer-card:hover {
  border-color: #334155;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
}

.developer-card {
  border-color: #e2e8f0;
  color: #1e293b;
}

.developer-card:hover {
  border-color: #334155;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
}

.tester-card {
  border-color: #e2e8f0;
  color: #1e293b;
}

.tester-card:hover {
  border-color: #334155;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
}

/* Responsiv design för mindre skärmar */
@media (max-width: 768px) {
  .stat-number {
    font-size: 2rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .role-card-body {
    padding: 1rem;
  }

  .role-icon {
    font-size: 2rem;
  }

  .role-title {
    font-size: 1.1rem;
  }

  .d-flex.gap-2 {
    justify-content: center;
  }
}
</style>