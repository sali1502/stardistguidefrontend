<!-- views/NotFoundView.vue - 404-sida med rollbaserad navigation och korrekt rubrikhierarki -->

<template>
  <BaseDashboard>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center">
            <div class="mb-4">
              <h2 class="display-1 fw-bold text-primary" style="font-size: 8rem;">
                404
              </h2>
            </div>

            <h3 class="h1 mb-3">
              <i class="bi bi-search me-2"></i>
              Sidan hittades inte
            </h3>

            <!-- Förklarande beskrivning -->
            <p class="lead text-muted mb-4">
              Sidan du letar efter existerar inte eller har flyttats.
            </p>

            <!-- Visa den URL som användaren försökte komma åt -->
            <div class="alert alert-light border" role="alert">
              <i class="bi bi-link-45deg me-2"></i>
              <strong>Begärd sida:</strong>
              <code class="text-danger">{{ requestedPath }}</code>
            </div>

            <!-- Visuella förslag på vad användaren kan göra -->
            <div class="row g-4 my-5">
              <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-house-door text-primary" style="font-size: 2rem;"></i>
                    <h4 class="card-title mt-3">Gå till startsidan</h4>
                    <p class="card-text text-muted">
                      Börja om från början och hitta det du letar efter.
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-arrow-left-circle text-success" style="font-size: 2rem;"></i>
                    <h4 class="card-title mt-3">Gå tillbaka</h4>
                    <p class="card-text text-muted">
                      Återvänd till den föregående sidan du besökte.
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-speedometer2 text-warning" style="font-size: 2rem;"></i>
                    <h4 class="card-title mt-3">Min instrumentpanel</h4>
                    <p class="card-text text-muted">
                      Gå till din rollbaserade instrumentpanel.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Åtgärdsknappar för navigation -->
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <button @click="goBack" class="btn btn-outline-primary btn-lg" v-if="canGoBack">
                <i class="bi bi-arrow-left me-2"></i>
                Gå tillbaka
              </button>

              <router-link :to="getHomeRoute()" class="btn btn-primary btn-lg">
                <i class="bi bi-house me-2"></i>
                {{ isAuthenticated ? 'Min instrumentpanel' : 'Startsida' }}
              </router-link>
            </div>

            <!-- Snabblänkar till tillgängliga sidor för inloggade användare -->
            <div v-if="isAuthenticated && availablePages.length > 0" class="mt-5">
              <h5 class="h5 mb-3">Eller besök en av dessa sidor:</h5>
              <div class="d-flex gap-2 justify-content-center flex-wrap">
                <router-link v-for="page in availablePages" :key="page.path" :to="page.path"
                  class="btn btn-outline-secondary btn-sm">
                  <i :class="page.icon + ' me-1'"></i>
                  {{ page.name }}
                </router-link>
              </div>
            </div>

            <!-- Hjälptext för användaren -->
            <div class="mt-5">
              <small class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Om du tror att detta är ett fel, kontakta administratören.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseDashboard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDashboard from '@/components/BaseDashboard.vue'

// Router och storeinstanser
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Beräknade egenskaper för användarens tillstånd
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.user?.role)

// Hämta den URL som användaren försökte komma åt
const requestedPath = computed(() => {
  return route.fullPath || window.location.pathname
})

// Kontrollera om användaren kan gå tillbaka
const canGoBack = computed(() => {
  return window.history.length > 1
})

// Generera lista över tillgängliga sidor baserat på användarens roll
const availablePages = computed(() => {
  if (!isAuthenticated.value) return []

  // Gemensamma sidor för alla inloggade användare
  const pages = [
    {
      path: '/status',
      name: 'Status',
      icon: 'bi bi-info-circle'
    }
  ]

  // Rollspecifika instrumentpaneler
  if (userRole.value) {
    const roleDashboards = {
      'admin': { path: '/dashboard/admin', name: 'Admin', icon: 'bi bi-gear' },
      'designer': { path: '/dashboard/designer', name: 'Designer', icon: 'bi bi-palette' },
      'developer': { path: '/dashboard/developer', name: 'Utvecklare', icon: 'bi bi-code-slash' },
      'tester': { path: '/dashboard/tester', name: 'Testare', icon: 'bi bi-bug' }
    }

    // Lägg till användarens egen instrumentpanel
    if (userRole.value !== 'admin' && roleDashboards[userRole.value]) {
      pages.unshift(roleDashboards[userRole.value])
    }

    // Admin kan se alla andra instrumentpaneler
    if (userRole.value === 'admin') {
      Object.entries(roleDashboards).forEach(([role, dashboard]) => {
        if (role !== 'admin' && !pages.find(p => p.path === dashboard.path)) {
          pages.push(dashboard)
        }
      })
    }
  }

  return pages
})

// Bestäm vilken startsida användaren ska omdirigeras till
const getHomeRoute = () => {
  if (!isAuthenticated.value) {
    return '/login'
  }

  // Omdirigera till användarens rollspecifika instrumentpanel
  if (userRole.value) {
    const dashboardRoutes = {
      'admin': '/dashboard/admin',
      'designer': '/dashboard/designer',
      'developer': '/dashboard/developer',
      'tester': '/dashboard/tester'
    }
    return dashboardRoutes[userRole.value] || '/login'
  }

  return '/login'
}

// Hantera tillbaka-navigation med fallback
const goBack = () => {
  if (canGoBack.value) {
    router.go(-1)
  } else {
    // Om ingen historik finns, gå till startsidan
    router.push(getHomeRoute())
  }
}
</script>