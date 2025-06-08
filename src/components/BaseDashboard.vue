<!-- components/BaseDashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- Sidhuvud med navigation -->
    <AppHeader />

    <!-- Huvudinnehåll för dashboard -->
    <main class="dashboard-content">
      <div class="container-fluid" v-if="authStore.user && authStore.isAuthenticated">
        <!-- Välkomstsektion med användarinformation -->
        <div class="welcome-section mb-4">
          <h1 class="h4 mb-1">
            Välkommen, {{ authStore.user?.username || 'Användare' }}!
          </h1>
          <p class="text-muted mb-0">
            Du är inloggad som {{ authStore.getRoleDisplayName(authStore.userRole) }}
          </p>
        </div>
        <slot />
      </div>

      <!-- Laddningsindikator medan användardata hämtas -->
      <div v-else class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Laddar...</span>
          </div>
          <p class="text-muted">Laddar användardata...</p>
        </div>
      </div>
    </main>

    <!-- Sidfot -->
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

const authStore = useAuthStore()
const router = useRouter()

// Kontrollera autentisering och ladda användardata vid komponentens montering
onMounted(async () => {
  try {
    // Om ingen token finns, omdirigera direkt till login
    if (!authStore.token) {
      router.push('/login')
      return
    }

    // Om token finns men ingen användardata, försök ladda den
    if (!authStore.user) {
      await authStore.loadUserFromToken()
    }

    // Slutgiltig kontroll - om fortfarande ingen användare, omdirigera till login
    if (!authStore.user) {
      authStore.logout()
      router.push('/login')
    }
  } catch (error) {
    // Hantera fel vid laddning av användardata
    authStore.logout()
    router.push('/login')
  }
})

// Övervaka förändringar i autentiseringsstatus
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (!isAuth) {
    router.push('/login')
  }
})
</script>

<style scoped>
/* Välkomstsektion styling */
.welcome-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  border-left: 4px solid #1e293b;
}

.welcome-section h1 {
  color: #1e293b;
  font-weight: 600;
}

/* Responsiv anpassning för mobila enheter */
@media (max-width: 768px) {
  .welcome-section {
    padding: 1rem 1.5rem;
  }

  .welcome-section h1 {
    font-size: 1.25rem;
  }
}
</style>