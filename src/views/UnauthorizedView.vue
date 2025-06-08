<!-- views/UnauthorizedView.vue - Sida för användare utan behörighet -->

<template>
  <BaseDashboard>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="text-center">
            <!-- Varningsikon för visuell tydlighet -->
            <div class="mb-4">
              <i class="bi bi-shield-exclamation text-warning" style="font-size: 4rem;"></i>
            </div>
            
            <!-- Huvudrubrik -->
            <h1 class="h2 text-dark mb-3">Åtkomst nekad</h1>
            
            <!-- Förklarande beskrivning -->
            <p class="lead text-muted mb-4">
              Du har inte behörighet att komma åt denna sida.
            </p>
            
            <!-- Rollbaserad information om varför åtkomst nekades -->
            <div class="alert alert-warning" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <span v-if="userRole">
                Du är inloggad som <strong>{{ getRoleDisplayName(userRole) }}</strong>, 
                men denna sida kräver andra behörigheter.
              </span>
              <span v-else>
                Du behöver logga in med ett konto som har rätt behörigheter.
              </span>
            </div>
            
            <!-- Handlingsalternativ för användaren -->
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <!-- Länk till användarens dashboard för inloggade användare -->
              <router-link 
                :to="getDashboardRoute()" 
                class="btn btn-primary"
                v-if="userRole"
              >
                <i class="bi bi-house me-2"></i>
                Till min dashboard
              </router-link>
              
              <!-- Inloggningslänk för icke-autentiserade användare -->
              <router-link 
                to="/login" 
                class="btn btn-primary"
                v-else
              >
                <i class="bi bi-box-arrow-in-right me-2"></i>
                Logga in
              </router-link>
            </div>
            
            <!-- Hjälpinformation för användaren -->
            <div class="mt-5">
              <small class="text-muted">
                <i class="bi bi-envelope me-1"></i>
                Behöver du hjälp? Kontakta administratören för att få rätt behörigheter.
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
import { useAuthStore } from '@/stores/auth'
import BaseDashboard from '@/components/BaseDashboard.vue'

// Store-instans för autentisering
const authStore = useAuthStore()

// Beräknad egenskap för användarens roll
const userRole = computed(() => authStore.user?.role)

// Konvertera rollkod till svenskt visningsnamn
const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Administratör',
    'designer': 'Designer', 
    'developer': 'Utvecklare',
    'tester': 'Testare'
  }
  return roleNames[role] || role
}

// Bestäm vilken dashboardrutt användaren ska omdirigeras till
const getDashboardRoute = () => {
  if (!userRole.value) return '/login'
  
  const dashboardRoutes = {
    'admin': '/dashboard/admin',
    'designer': '/dashboard/designer',
    'developer': '/dashboard/developer', 
    'tester': '/dashboard/tester'
  }
  
  return dashboardRoutes[userRole.value] || '/login'
}
</script>