<!-- components/AppHeader.vue - sidhuvud med navigation, logotyp och utloggningsfunktion -->

<template>
  <div class="dashboard-header">
    <div class="container-fluid">
      <div class="header-row">
        <div class="left-section">
          <img src="@/assets/images/logo.png" alt="logotyp" class="logo-image" />
          <span class="logo-text">Guide för webbtillgänglighet</span>
        </div>
        <div class="right-section">
          <router-link :to="getDashboardRoute()" class="nav-link me-3">
            {{ authStore.getRoleDisplayName(authStore.userRole) }}
          </router-link>
          <router-link to="/status" class="nav-link me-3">Status</router-link>
          <button @click="handleLogout" class="btn btn-outline-light btn-sm" :disabled="isLoggingOut">
            <span v-if="isLoggingOut" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-box-arrow-right d-inline d-sm-none" aria-hidden="true"></i>
            <span class="d-none d-sm-inline">
              {{ isLoggingOut ? 'Loggar ut...' : 'Logga ut' }}
            </span>
            <span class="sr-only d-sm-none">{{ isLoggingOut ? 'Loggar ut' : 'Logga ut' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggingOut = ref(false)

// Generera korrekt instrumentpanel-rutt baserat på användarens roll
const getDashboardRoute = () => {
  const role = authStore.userRole
  return `/dashboard/${role}`
}

// Hantera utloggning med laddningsindikator
const handleLogout = () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  // Metod för att logga ut - från auth store
  authStore.logout()
}
</script>